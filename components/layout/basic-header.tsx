import React from "react";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from "@material-ui/core/AppBar/AppBar";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Link from "@material-ui/core/Link";
import ShoppingCartSharpIcon from "@material-ui/icons/ShoppingCartSharp";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    flexDirection: "column",
    paddingLeft: 0,
    paddingRight: 0
  },
  divider: {
    width: "100%"
  },
  link: {
    display: "block",
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(7) / 2,
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(7) / 2,
    "&:hover": {
      color: theme.palette.text.primary
    }
  }
}));

const links = [
  {
    id: "nike-plus",
    title: "NIKE会员",
    path: "https://www.nike.com/cn/zh_cn/c/nike-plus"
  },
  {
    id: "jordan",
    title: "Jordan",
    path: "https://www.nike.com/cn/zh_cn/c/jordan"
  },
  { id: "converse", title: "Converse", path: "https://www.converse.com.cn/" }
];

const BasicHeader = () => {
  const classes = useStyles();

  return (
    <AppBar
      position="static"
      color="inherit"
      variant="outlined"
      elevation={0}
      square
    >
      <Toolbar className={classes.root}>
        <Grid container justify="space-between">
          <Grid item>
            <Grid item container>
              {links.map(({ id, title, path }) => (
                <React.Fragment key={id}>
                  <Grid item>
                    <Link
                      className={classes.link}
                      color="textSecondary"
                      underline="none"
                      href={path}
                    >
                      {title}
                    </Link>
                  </Grid>
                  <Grid item>
                    <Divider orientation="vertical" />
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Grid>
          <Grid item>
            <Link
              className={classes.link}
              color="textSecondary"
              underline="none"
              href="#"
            >
              <ShoppingCartSharpIcon fontSize="inherit" />
            </Link>
          </Grid>
        </Grid>
        <Divider className={classes.divider} />
        <Grid container justify="space-between">
          <Grid item></Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default BasicHeader;
