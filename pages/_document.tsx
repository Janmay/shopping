import React from "react";
import Document, {
  DocumentContext,
  Head,
  Main,
  NextScript
} from "next/document";
import { ServerStyleSheets } from "@material-ui/core/styles";

export default class extends Document<{ nonce: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    // material ui styles
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: App => props => sheets.collect(<App {...props} />)
      });

    // csp nonce
    const nonce = process.env.cspNonce;

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      nonce,
      styles: [
        ...React.Children.toArray(initialProps.styles),
        sheets.getStyleElement({ nonce })
      ]
    };
  }

  render() {
    const { nonce } = this.props;

    return (
      <html>
        <Head nonce={nonce}>
          <meta property="csp-nonce" content={`nonce-${nonce}`} />
        </Head>
        <body>
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </html>
    );
  }
}
