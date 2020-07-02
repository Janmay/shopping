const path = require("path");
const slash = require("slash2");
const postcssNormalize = require("postcss-normalize");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const safePostCssParser = require("postcss-safe-parser");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssFlexFixPlugin = require("postcss-flexbugs-fixes");
const postcssPresetEnvPlugin = require("postcss-preset-env");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const appDirectory = process.cwd();
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const appSrc = [resolveApp("components"), resolveApp("pages")];

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const getCSSModuleLocalIdent = (context, localIdentName, localName) => {
  if (context.resourcePath.includes("node_modules")) return localName;
  const match = context.resourcePath.match(/(components|pages)(.*)/);
  if (match && match[2]) {
    const cssPath = match[2].replace(/\.module\.(css|scss|sass)/, "");
    const arr = slash(cssPath)
      .replace(/\/index$/, "")
      .split("/")
      .map((p) => p.replace(/([A-Z])/g, "-$1"))
      .map((p) => p.toLowerCase());
    return `ec${arr.join("-")}-${localName}`.replace(/--/g, "-");
  }
  return localName;
};

// webpack config
// const withSass = require('@zeit/next-sass');
// module.exports = withSass({
//   cssModules: true,
//   webpack(config, options) {
//     console.log(JSON.stringify(config.module.rules))
//     return config;
//   }
// });
module.exports = {
  target: "server",
  distDir: "build",
  poweredByHeader: false,
  webpack: (config, { dev, isServer }) => {
    // eslint
    config.module.rules.unshift({
      test: /\.(js|jsx|ts|tsx)$/,
      enforce: "pre",
      include: appSrc,
      loader: require.resolve("eslint-loader"),
      options: {
        cache: true,
        eslintPath: require.resolve("eslint"),
        formatter: require("eslint-formatter-friendly"),
      },
    });

    // styles: css、sass
    const getStyleLoaders = (cssOptions = {}, preProcessor) => {
      const loaders = [
        dev &&
          !isServer && {
            loader: require.resolve("style-loader"),
            options: {
              attributes: {
                nonce: process.env.cspNonce,
              },
            },
          },
        !dev &&
          !isServer && {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
      ].filter(Boolean);
      if (loaders.length) {
        cssOptions.importLoaders = loaders.length;
      }
      loaders.push(
        {
          loader: require.resolve("css-loader"),
          options: {
            sourceMap: !dev,
            ...cssOptions,
          },
        },
        {
          loader: require.resolve("postcss-loader"),
          options: {
            // ident: "postcss",
            plugins: () => [
              postcssFlexFixPlugin,
              postcssPresetEnvPlugin({
                autoprefixer: {
                  flexbox: "no-2009",
                },
                stage: 3,
              }),
              postcssNormalize(),
            ],
            sourceMap: !dev,
          },
        }
      );
      if (preProcessor) {
        loaders.push(
          {
            loader: require.resolve("resolve-url-loader"),
            options: {
              sourceMap: !dev,
            },
          },
          {
            loader: require.resolve(preProcessor),
            options: {
              sourceMap: true,
            },
          }
        );
      }
      return loaders.filter(Boolean);
    };

    if (!dev) {
      if (!Array.isArray(config.optimization.minimizer)) {
        config.optimization.minimizer = [];
      }

      config.optimization.minimizer.push(
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: {
              inline: false,
              annotation: true,
            },
          },
          cssProcessorPluginOptions: {
            preset: [
              "default",
              {
                minifyFontValues: {
                  removeQuotes: false,
                },
              },
            ],
          },
        })
      );

      if (!isServer) {
        config.plugins.push(
          new MiniCssExtractPlugin({
            filename: "static/css/[contenthash].css",
            chunkFilename: "static/css/[contenthash].chunk.css",
          })
        );
      }
    }

    // ANALYZE=true yarn build
    if (process.env.ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: isServer
            ? "../analyze/server.html"
            : "./analyze/client.html",
        })
      );
    }

    const styleRules = [
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: getStyleLoaders(),
        sideEffects: true,
      },
      {
        test: cssModuleRegex,
        use: getStyleLoaders({
          modules: {
            getLocalIdent: getCSSModuleLocalIdent,
          },
        }),
      },
      {
        test: sassRegex,
        exclude: sassModuleRegex,
        use: getStyleLoaders({}, "sass-loader"),
      },
      {
        test: sassModuleRegex,
        use: getStyleLoaders(
          {
            modules: {
              getLocalIdent: getCSSModuleLocalIdent,
            },
          },
          "sass-loader"
        ),
      },
    ];

    const ruleConfig = config.module.rules.find((r) => r.oneOf);
    if (ruleConfig) {
      ruleConfig.oneOf.push(...styleRules);
    } else {
      config.module.rules.push(...styleRules);
    }
    // console.log(JSON.stringify(config.module.rules))
    return config;
  },
};
