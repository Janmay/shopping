const path = require("path");
const slash = require("slash2");
const postcssNormalize = require("postcss-normalize");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const safePostCssParser = require("postcss-safe-parser");

const appDirectory = process.cwd();
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const appSrc = [resolveApp("components"), resolveApp("pages")];

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const getCSSModuleLocalIdent = (
  context,
  localIdentName,
  localName,
  options
) => {
  if (context.resourcePath.includes("node_modules")) return localName;
  const match = context.resourcePath.match(/(components|pages)(.*)/);
  if (match && match[2]) {
    const cssPath = match[2].replace(/\.module\.(css|scss|sass)/, "");
    const arr = slash(cssPath)
      .replace(/\/index$/, "")
      .split("/")
      .map(p => p.replace(/([A-Z])/g, "-$1"))
      .map(p => p.toLowerCase());
    return `ec${arr.join("-")}-${localName}`.replace(/--/g, "-");
  }
  return localName;
};

// webpack config
module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // eslint
    config.module.rules.unshift({
      test: /\.(js|jsx|ts|tsx)$/,
      enforce: "pre",
      include: appSrc,
      loader: require.resolve("eslint-loader"),
      options: {
        cache: true,
        eslintPath: require.resolve("eslint"),
        formatter: require("eslint-formatter-friendly")
      }
    });

    // styles: css、sass
    const getStyleLoaders = cssOptions => {
      return [
        {
          loader: require.resolve("css-loader"),
          options: {
            sourceMap: !dev,
            ...cssOptions
          }
        },
        {
          loader: require.resolve("postcss-loader"),
          options: {
            ident: "postcss",
            plugins: () => [
              require.resolve("postcss-flexbugs-fixes"),
              require.resolve("postcss-preset-env")({
                autoprefixer: {
                  flexbox: "no-2009"
                },
                stage: 3
              }),
              postcssNormalize()
            ],
            sourceMap: !dev
          }
        }
      ].filter(Boolean);
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
              annotation: true
            }
          },
          cssProcessorPluginOptions: {
            preset: [
              "default",
              {
                minifyFontValues: {
                  removeQuotes: false
                }
              }
            ]
          }
        })
      );
    }

    const styleRules = [
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: getStyleLoaders({
          importLoaders: 1
        }),
        sideEffects: true
      },
      {
        test: cssModuleRegex,
        use: getStyleLoaders({
          importLoaders: 1,
          modules: {
            getLocalIdent: getCSSModuleLocalIdent
          }
        })
      },
      {
        test: sassRegex,
        exclude: sassModuleRegex,
        use: getStyleLoaders(
          {
            importLoaders: 2
          },
          require.resolve("sass-loader")
        )
      },
      {
        test: sassModuleRegex,
        use: getStyleLoaders(
          {
            importLoaders: 2,
            modules: {
              getLocalIdent: getCSSModuleLocalIdent
            }
          },
          require.resolve("sass-loader")
        )
      }
    ];

    const ruleConfig = config.module.rules.find(r => r.oneOf);
    if (ruleConfig) {
      ruleConfig.push(styleRules);
    } else {
      config.module.rules.push({
        oneOf: styleRules
      });
    }

    return config;
  }
};
