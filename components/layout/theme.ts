import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    type: "light",
    background: {
      default: "#fff"
    }
  },
  props: {
    MuiButtonBase: {
      disableRipple: true
    }
  }
});

export default theme;
