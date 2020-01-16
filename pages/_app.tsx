import React from "react";
import App from "next/app";
import Head from "next/head";
import BasicLayout from "../components/layout/basic-layout";

export default class extends App {
  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement!.removeChild(jssStyles);
    }
  }

  render() {
    const {
      Component,
      pageProps: { title, description, ...restProps }
    } = this.props;

    return (
      <React.Fragment>
        <Head>
          <title>{title}</title>
          {description && <meta name="description" content={description} />}
        </Head>
        <BasicLayout>
          <Component {...restProps} />
        </BasicLayout>
      </React.Fragment>
    );
  }
}
