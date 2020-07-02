import React from "react";
import App from "next/app";
import Head from "next/head";
import BasicLayout from "../components/layout/basic-layout";

export default class extends App {
  render() {
    const {
      Component,
      pageProps: { title, description, ...restProps },
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
