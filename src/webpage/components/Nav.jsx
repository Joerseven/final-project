import React from "react";
import { NavLink } from "react-router-dom";
import { createUseStyles } from "react-jss";

const classes = createUseStyles({
  nav: {
    fontWeight: "bold",
    flex: 1,
    backgroundColor: "rgb(222, 222, 222)",
  },
  logo: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    margin: "0 auto",
    padding: "15px 0",
    fontFamily: '"Space Mono", monospace',
  },
  imgLogo: {
    margin: "0 7px 0 0",
    width: "32px",
    height: "28px",
  },
  navlink: {
    textAlign: "center",
    padding: "25px 0",
    boxSizing: "border-box",
    textDecoration: "none",
    color: "black",
    display: "block",
    "&:hover": {
      borderLeft: "2px solid black",
      backgroundColor: "rgb(230, 230, 230)"
    },
    "&:active": {
      backgroundColor: "rgb(230, 230, 230)",
    },
  },
  currentPage: {
    borderLeft: "2px solid black",
    backgroundColor: "rgb(231, 231, 231)",
  },
});

const Nav = () => {

  const style = classes();

  return (
    <nav className={style.nav}>
      <div className={style.logo}>
        <div style={{background:"url(lockbox.png)"}} className={style.imgLogo}></div> Lockbox
      </div>
      <span>
        <NavLink className={style.navlink} activeClassName={style.currentPage} to="/Manage">
          Manage Lockboxes
        </NavLink>
        <NavLink className={style.navlink} activeClassName={style.currentPage} to="/Create">
          Create Lockbox
        </NavLink>
        <NavLink className={style.navlink} activeClassName={style.currentPage} to="/Help">
          Help
        </NavLink>
      </span>
    </nav>
  );
};

export default Nav;
