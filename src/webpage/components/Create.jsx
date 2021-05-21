import * as openpgp from "openpgp/lightweight";
import React, { useState } from "react";
import localforage from "localforage";
import StatusBox from "./StatusBox";
import { isEmpty, isEqual } from "lodash";
import { createUseStyles } from "react-jss";

const classes = createUseStyles({
  create: {
    display: "grid",
    width: "90%",
    margin: "0 auto",
    gridTemplateColumns: "50% 50%",
  },
  textarea: {
    resize: "none",
    gridColumnStart: "2",
    gridColumnEnd: "3",
    border: "none",
    borderLeft: "1px solid grey",
    padding: "20px",
    outline: "none",
    margin: "5px",
    fontFamily: "inherit",
    gridRowStart: "2",
    gridRowEnd: "10",
    color: "black",
  },
  buttonContainer: {
    width: "90%",
    margin: "0.5em auto",
    textAlign: "right",
  },
  button: {
    border: "none",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-flex",
    cursor: "pointer",
    margin: "4px 2px",
    width: "auto",
    height: "30px",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px 0 rgba(73, 52, 52, 0.2)",
    fontSize: "medium",
    padding: "20px",
  },
  input: {
    WebkitAppearance: "none",
    display: "block",
    padding: "20px",
    gridColumnStart: "1",
    gridColumnEnd: "2",
    margin: "5px",
    fontSize: "14px",
    outline: "none",
    border: "none",
    borderLeft: "1px solid gray",
    fontFamily: '"Libre Franklin", sans-serif',
  },
  error: {
    color: "red",
    marginLeft: "6px",
    fontSize: "0.8rem",
  },
  invalid: {
    borderLeft: "1px solid red",
  },
  valid: { color: "green" },
  checkboxContainer: {
    gridColumnStart: "2",
    gridColumnEnd: "3",
    gridRowStart: "1",
    gridRowEnd: "2",
    backgroundColor: "#fff",
    margin: "5px",
    borderLeft: "1px solid grey",
    display: "flex",
    alignItems: "center",
    justifyContent: "left",
    fontSize: ".8rem",
    paddingLeft: "20px",
    "& input": {
      "&:checked": {
        "& ~ $realbox": {
          backgroundColor: "green",
          "&:after": {
            display: "block",
          },
        },
      },
    },
    "& $realbox": {
      "&:after": {
        display: "none",
        left: "9px",
        top: "5px",
        width: "5px",
        height: "10px",
        border: "solid white",
        borderWidth: "0 3px 3px 0",
        transform: "rotate(45deg)",
      },
    },
  },
  gonebox: {
    position: "absolute",
    opacity: 0,
    cursor: "pointer",
    height: "0",
    width: "0",
  },
  realbox: {
    position: "inline-block",
    marginLeft: "0.5rem",
    top: "0",
    left: "0",
    height: "25px",
    width: "25px",
    backgroundColor: "white",
    border: "1px solid grey",
    "&:after": {
      content: '""',
      position: "relative",
      display: "block",
    },
  },
});

const Create = () => {
  const style = classes();

  const [fields, setField] = useState({});
  const [status, setStatus] = useState({
    string: "",
    good: false,
  });

  const postKey = async (publicKey) => {
    const data = {
      publicKeyArmored: publicKey,
    };

    const requestOptions = {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    try {
      await fetch("https://keys.mailvelope.com/api/v1/key", requestOptions);
      setStatus({ string: "Key uploaded sucessfully! Make sure you go to your email and validate it, or they won't be able to access it!", good: true });
      return true;
    } catch {
      setStatus({ string: "Something went wrong with the upload to the server. Make sure you're connected to the internet.", good: false });
    }
  };

  const createKey = async (user, password, description) => {
    const keyOptions = {
      type: "rsa",
      rsaBits: 4096,
      userIDs: [user],
      passphrase: password,
    };

    const { privateKeyArmored: privateKey, publicKeyArmored: publicKey } = await openpgp.generateKey(keyOptions);

    console.log(publicKey);
    console.log(privateKey);

    const storedKeyPair = {
      name: user.name,
      email: user.email,
      privateKey: privateKey,
      publicKey: publicKey,
      description: typeof description === "undefined" ? "" : description,
    };

    const defaultKey = await localforage.getItem("default");
    const localKeys = await localforage.getItem("localKeys");

    if (fields.checkbox === true) {
      if (await postKey(storedKeyPair.publicKey)) {
        storedKeyPair.url = `https://keys.mailvelope.com/api/v1/key?email=${storedKeyPair.email}`;
      }
    }

    if (defaultKey === null || isEqual(localKeys, [])) {
      await localforage.setItem("default", storedKeyPair);
    }

    if (localKeys === null) {
      await localforage.setItem("localKeys", [storedKeyPair]);
    } else {
      const keyArray = [...localKeys, storedKeyPair];
      await localforage.setItem("localKeys", keyArray);
    }

    setStatus({ string: "Lockbox and it's key created successfully!", good: true });
  };

  const handleCheck = (value, e) => {
    let newState = fields;
    newState[value] = e.target.checked;
    setField(newState);
    console.log(fields);
  };

  const handleChange = (value, e) => {
    let newState = fields;
    newState[value] = e.target.value;
    setField(newState);
    console.log(fields);
  };

  const validateKeyForm = () => {
    let emptyFields = "";

    const required = ["name", "email", "password", "confirmPassword"];
    for (let field of required) {
      if (!(field in fields)) {
        field === "confirmPassword" ? (emptyFields += `confirm password.`) : (emptyFields += `${field}, `);
      }
    }
    if (!isEmpty(emptyFields)) {
      setStatus({ string: `Please fill in the following: ${emptyFields}`, good: false });
    } else if (!/^[a-zA-Z ]+$/.test(fields.name)) {
      setStatus({ string: `Please enter a real name.`, good: false });
    } else if (!/^[^\s@]+@[^\s@]+$/.test(fields.email)) {
      setStatus({ string: `This isn't a valid email address`, good: false });
    } else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/.test(fields.password)) {
      setStatus({ string: `Your password has to be longer than 8 and contain a capital letter, a lowercase letter and a number.`, good: false });
    } else if (fields.confirmPassword != fields.password) {
      setStatus({ string: `Your passwords need to match!`, good: false });
    } else {
      const usrid = { name: fields.name, email: fields.email };
      createKey(usrid, fields.password, fields.description);
      setStatus({ string: "Creating lockbox now...", good: "yellow" });
    }
  };

  return (
    <section className={style.wrapper}>
      <h1>Create a Lockbox</h1>
      <div className={style.create}>
        <input type="text" placeholder="Your name" className={style.input} onChange={(e) => handleChange("name", e)} />
        <input type="text" placeholder="Your email" className={style.input} onChange={(e) => handleChange("email", e)} />
        <input type="password" placeholder="Password for the lockbox" className={style.input} onChange={(e) => handleChange("password", e)} />
        <input type="password" placeholder="Confirm Password for the lockbox" className={style.input} onChange={(e) => handleChange("confirmPassword", e)} />
        <label className={style.checkboxContainer}>
          {" "}
          Upload the lockbox to server, (recommended)
          <input type="checkbox" className={style.gonebox} defaultChecked={fields.checkbox} onChange={(e) => handleCheck("checkbox", e)} />
          <span className={style.realbox}></span>
        </label>
        <textarea
          placeholder="Give the lockbox a small description so you know what you're using it for. (Optional)"
          className={style.textarea}
          onChange={(e) => handleChange("description", e)}></textarea>
      </div>
      <div className={style.buttonContainer}>
        <button className={style.button} type="button" onClick={validateKeyForm}>
          Create Lockbox!
        </button>
      </div>
      <StatusBox {...status} />
    </section>
  );
};

export default Create;
