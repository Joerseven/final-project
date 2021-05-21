/* eslint-disable react/prop-types */
import { isEmpty } from "lodash";
import React from "react";
import { createUseStyles } from "react-jss";

const classes = createUseStyles({
  red: {
    position: "absolute",
    bottom: "3rem",
    left: "3rem",
    textAlign: "center",
    color: "white",
    width: "25rem",
    margin: "0.5em auto",
    padding: 20,
    borderLeft: "2px solid white",
    backgroundColor: "red",
  },
  yellow: {
    position: 'absolute',
    bottom: '3rem',
    left: '3rem',
    width: '25rem',
    textAlign: 'center',
    color: 'lightgrey',
    margin: '0.5em auto',
    padding: 20,
    borderLeft: '2px solid lightgrey',
    backgroundColor: 'yellow'
  },
  green: {
    position: 'absolute',
    bottom: '3rem',
    left: '3rem',
    width: '25rem',
    textAlign: 'center',
    color: 'white',
    margin: '0.5em auto',
    padding: 20,
    borderLeft: '2px solid white',
    backgroundColor: 'green'
  }
});

const StatusBox = (props) => {

  const style = classes();

  if (isEmpty(props.string)) {
    return null;
  } else if (props.good === true) {
    return <div className={style.green}>{props.string}</div>;
  } else if (props.good === false) {
    return <div className={style.red}>{props.string}</div>;
  } else {
    return <div className={style.yellow}>{props.string}</div>;
  }
};

export default StatusBox;
