/* eslint-disable react/prop-types */
import React from "react";
import { createUseStyles } from "react-jss";

const classes = createUseStyles({
  keyid: { textAlign: "center" },
  dropdowncontainer: {
    position: "relative",
    textAlign: "center",
    width: "10%",
    "&:hover": {
      "& $tooltip": {
        transform: "scaleY(1) translateX(-50%)",
      },
      "& svg": {
        transform: "rotate(360deg)",
        fill: "#808080",
      },
    },
  },
  delete: {
    "&:hover": {
      color: "lightgray"
    }
  },
  tooltip: {
    position: "absolute",
    left: "50%",
    right: "0",
    display: "block",
    transform: "scaleY(0) translateX(-50%)",
    transformOrigin: "top",
    backgroundColor: "#E1E1E1",
    color: "black",
    padding: "5px",
    zIndex: 1,
    textAlign: "center",
    transition: "transform 0.1s",
    border: "1px solid darkgrey",
    width: "6rem",
    "& div": {
      display: "block",
      padding: ".2rem .2rem .2rem .2rem",
      "&:hover": {
        cursor: "pointer",
        backgroundColor: "lightgray",
      },
    },
    "& $delete":{
      "&:hover": {
        backgroundColor: "darkred"
      }
    }
  },
  online: {
    fontWeight: "bold",
    color: "green",
    textAlign: "center",
  },
  offline: {
    color: "red",
    textAlign: "center",
  },

  default: {
    display: "inline-block",
    backgroundColor: "darkgreen",
    color: "lightgray",
    padding: ".3em",
    marginLeft: "1em",
  },
});

const TableCell = (props) => {
  const style = classes();

  return (
    <tr className={style.row}>
      <td className={style.keyid}>{props.keyId + 1}</td>
      <td className={style.owner}>
        {props.email}
        {props.defaultCheck(props.keyId) ? <div className={style.default}>Default</div> : null}
      </td>
      <td className={"url" in props ? style.online : style.offline}>{"url" in props ? "Online" : "Offline"}</td>
      <td className={style.dropdowncontainer}>
        <svg className={style.dropdown} viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1.553 6.776a.5.5 0 0 1 .67-.223L8 9.44l5.776-2.888a.5.5 0 1 1 .448.894l-6 3a.5.5 0 0 1-.448 0l-6-3a.5.5 0 0 1-.223-.67z" />
        </svg>
        <span className={style.tooltip}>
          <div onClick={() => props.downloadFunc(props.keyId, props.email)}>Download</div>
          <div onClick={() => props.defaultFunc(props.keyId)}>Set Default</div>
          {!("url" in props) ? <div onClick={() => props.postKey(props.keyId, props.publicKey)}>Upload to key server</div> : ""}
          <div className={style.delete} onClick={() => props.deleteFunc(props.keyId, props.email)}>
            Delete
          </div>
        </span>
      </td>
    </tr>
  );
};

export default TableCell;
