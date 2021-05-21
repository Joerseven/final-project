import React, { useEffect, useState } from "react";
import localforage from "localforage";
import TableCell from "./TableCell";
import StatusBox from "./StatusBox";
import { isEqual } from "lodash";
import { createUseStyles } from "react-jss";

const classes = createUseStyles({
  wrapper: {
    width: '90%',
    margin: '0 auto'
  },

  submit : {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '.5rem 0 .5rem 0'
  },
  add: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

const Manage = () => {
  const [keyTable, setKeyTable] = useState([]);
  const [requestState, setRequestState] = useState({
    string: "",
    good: false,
  });
  const [fields, setFields] = useState({
    email: "",
    file: null,
  });
  const [defaultKey, setDefaultKey] = useState();

  const style = classes();

  const handleChange = (value, e) => {
    setFields((prevState) => {
      prevState[value] = e.target.value;
      return prevState;
    });
    console.log(fields);
  };

  const handleFileChange = (e) => {
    setFields({ file: e.target.files[0] });
  };

  const fetchKeyTable = async () => {
    const newKeys = await localforage.getItem("localKeys");
    const defaultKeyNew = await localforage.getItem("default");
    setDefaultKey(defaultKeyNew);
    setKeyTable(newKeys);
  };

  const updateKeyTable = async () => {
    await localforage.setItem("localKeys", keyTable);
  };

  const updateDefaultKey = async () => {
    await localforage.setItem("default", defaultKey);
  };

  const sendRemoveRequest = async (email) => {
    const requestOptions = {
      method: "DELETE",
      cache: "no-cache",
    };

    const request = await fetch(`https://keys.mailvelope.com/api/v1/key?email=${email}`, requestOptions);
    console.log(request);
  };

  const uploadLockbox = async () => {
    let reason = "";
    let valid = false;
    let output = "Unchanged";
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if (fields.email == "") {
        valid = false;
        reason = "Please type in an email in the box to the left, so you know who the key belongs to!";
      } else if (!/^[^\s@]+@[^\s@]+$/.test(fields.email)) {
        valid = false;
        reason = "Please enter a valid email to the left! We need to know who the lockbox you're uploading belongs to.";
      } else if (fields.file === null) {
        valid = false;
        reason = "Upload a file!";
      } else {
        const reader = new FileReader();

        reader.onload = (e) => {
          output = e.target.result;
          console.log(output);

          const keyObject = {
            email: fields.email,
            publicKey: output,
          };

          setKeyTable((prevKeyTable) => {
            const newTable = [...prevKeyTable, keyObject];
            return newTable;
          });
          reason = "File uploaded successfully!";
          valid = true;
          setRequestState({string: reason, good: valid});
        };
        reader.readAsText(fields.file);
      }
    }

    setRequestState({ string: reason, good: valid });
  };

  const searchLockbox = async (email) => {
    let valid = true;
    let reason = "This wasn't supposed to happen.";

    if (/^[^\s@]+@[^\s@]+$/.test(email)) {
      let payload = {};
      let keyServerRequest = {};

      // The mailvelope returns invalid request without CORS headers, 
      try {
        keyServerRequest = await fetch(`https://keys.mailvelope.com/api/v1/key?email=${email}`);
      } catch {
        valid = false;
        reason = "Web request wasn't sucessful.";
      }

      if (keyServerRequest.status !== 200) {
        valid = false;
        reason = "We couldn't find the key sorry.";
      } else {
        payload = await keyServerRequest.json();
        console.log(payload);
        for (let object of payload.userIds) {
          if (object.verified === false) {
            valid = false;
            reason = "The key you're going to download is unverified, whoever it belongs to hasn't gone to their email and verified it. I'm not letting you have it sorry.";
          }
        }
      }

      if (valid === true) {
        const keyObject = {
          email: email,
          url: `https://keys.mailvelope.com/api/v1/key?email=${email}`,
          publicKey: payload.publicKeyArmored,
        };
        setKeyTable((prevKeyTable) => {
          const newTable = [...prevKeyTable, keyObject];
          return newTable;
        });
        reason = "The lockbox has been added!";
      }
    } else {
      valid = false;
      reason = "Please enter a valid email.";
    }

    setRequestState({ string: reason, good: valid });
  };

  useEffect(() => {
    fetchKeyTable();
    console.log("Hi!");
  }, []);

  useEffect(() => {
    if (keyTable != []) {
      updateKeyTable();
    }
  }, [keyTable]);

  useEffect(() => {
    if (defaultKey != null) {
      updateDefaultKey();
    }
  }, [defaultKey]);

  const removeKey = (keyId, email) => {
    console.log(`Removing element ${keyId}`);

    if (isDefault(keyId)) {
      setDefaultKey({});
    }

    sendRemoveRequest(email);

    setKeyTable((prevState) => {
      const newState = prevState.filter((v, index) => index !== keyId);
      return newState;
    });

    setRequestState({string: "You've sucessfulled deleted the key!", good: false});
  };

  const downloadKey = (keyId, email) => {
    const fakeElement = document.createElement("a");
    const data = `data:text/plain;charset=utf8,${encodeURIComponent(keyTable[keyId].publicKey)}`;
    fakeElement.href = data;
    fakeElement.download = `${email.substring(0, email.lastIndexOf("@"))}publickey.asc`;
    fakeElement.click();
  };

  const isDefault = (keyId) => {
    if (isEqual(keyTable[keyId], defaultKey)) {
      return true;
    } else {
      return false;
    }
  };

  const changeDefaultKey = async (keyId) => {
    const newDefault = keyTable[keyId];
    setDefaultKey(newDefault);
  };

  const postKey = async (keyId, publicKey) => {
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
      setRequestState({ string: "Key uploaded sucessfully! Make sure you go to your email and validate it, or they won't be able to access it!", good: true });

      setKeyTable((prevKeyTable) => prevKeyTable.map((value, index) => (index === keyId ? { ...value, url: `https://keys.mailvelope.com/api/v1/key?email=${prevKeyTable[keyId].email}` } : value)));
    } 
    catch {
      setRequestState({ string: "Something went wrong with the upload to the server. Make sure you're connected to the internet.", good: false });
    }
  };

  return (
    <section className={style.wrapper}>
      <h1>Manage Lockboxes</h1>
      <h2>Lockboxes you have keys for: </h2>
      <table className={style.privkeytable}>
        <thead>
          <tr>
            <th>Key ID</th>
            <th>Lockbox Owner</th>
            <th>Online Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {keyTable.map((value, index) =>
            "privateKey" in value ? (
              <TableCell key={index} keyId={index} deleteFunc={removeKey} downloadFunc={downloadKey} defaultFunc={changeDefaultKey} defaultCheck={isDefault} postKey={postKey} {...value} />
            ) : null
          )}
        </tbody>
      </table>
      <h2>Lockboxes people have sent you: </h2>
      <table className={style.pubkeytable}>
        <thead>
          <tr>
            <th>Key ID</th>
            <th>Lockbox Owner</th>
            <th>Online Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {keyTable.map((value, index) =>
            "privateKey" in value ? null : (
              <TableCell key={index} keyId={index} deleteFunc={removeKey} downloadFunc={downloadKey} defaultFunc={changeDefaultKey} defaultCheck={isDefault} postKey={postKey} {...value} />
            )
          )}
        </tbody>
      </table>
      <h2>Add a lockbox</h2>
      <p>Here you can either add a lockbox from a key server (just put in an email address and it&lsquo;ll search) (recommended), or upload one from a file.</p>
      <div className={style.add}>
        <input type="text" placeholder="Email Address" onChange={(e) => handleChange("email", e)} />
        <input type="file" onChange={handleFileChange} />
      </div>
      <div className={style.submit}>
        <button onClick={() => searchLockbox(fields.email)}>Search for lockbox</button>
        <button onClick={() => uploadLockbox()}>Upload lockbox file</button>
      </div>
      <StatusBox {...requestState} />
    </section>
  );
};

export default Manage;
