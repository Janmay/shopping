import React from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "./theme";
import BasicHeader from "./basic-header";

const BasicLayout: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BasicHeader />
      {children}
    </ThemeProvider>
  );
};

export default BasicLayout;
