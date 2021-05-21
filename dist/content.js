const PGPREGEX = /-----BEGIN PGP MESSAGE-----([\s\S]*?)-----END PGP MESSAGE-----/;

const createPopup = () => {
  return `
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@100&display=swap");
    #passwordpopup {
      position:fixed;
      display: flex;
      width: 250px;
      height: 100px;
      padding: 25px;
      background-color: lightgray;
      border-left: 1px solid grey;
      align-items: center;
      justify-content: center;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display:none;
      z-index: 5;
    }
    #passwordfield {
      font-family:"Libre Franklin", sans-serif;
      -webkit-appearance: none;
      display: block;
      padding: 20px;
      margin: 5px;
      font-size: 14px;
      outline: none;
      border: none;
      border-left: 1px solid gray;
      background-color: white;
    }
    #passwordbutton {
      border: none;
      text-align: center;
      text-decoration: none;
      display: inline-flex;
      cursor: pointer;
      margin: 4px 2px;
      width: auto;
      height: 30px;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px 0 rgba(73, 52, 52, 0.2);
      font-size: medium;
      padding: 20px;
    }
  </style>
  <div id="passwordpopup">
    <input id="passwordfield" type="password" placeholder="Password"/>
    <button id="passwordbutton">Unlock!</button>    
  </div>`;
};

const createHTML = (contents, locked) => {
  return `
      <div class="ctr-div">
        <div class="lockbox-top" id="${locked ? "padlocked" : "padlock"}">
          <svg height="25" width="25" viewBox="0 0 16 16" class="svg-lock">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          </svg>
        </div>
        <div class="lockbox-text ${locked ? "lockbox-text-close" : ""}" id="${locked ? "lockedbox" : "lockbox"}" contenteditable="true" role="textbox">${contents}</div>
      </div>
      <style>
      .ctr-div {
        width: 100%;
        margin: 25 auto;
        max-width: 600px;
        ${!locked ? `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 5;` : ""}
      }

      .lockbox-text:focus {
        outline: 5px solid;
      }

      .lockbox-top {
        width: 25px;
        margin: 0 auto;
        position: relative;
        top: 3px;
      }

      .lockbox-text {
        outline: 5px solid;
        max-height: 200px;
        width: 90%;
        margin: 0 auto;
        font-family: 'IBM Plex Mono', monospace;
        overflow: hidden;
        transition: max-height 1s ease-in-out;
        background-color: lightgray;
      }

      .lockbox-text-close {
        max-height: 0px;
        transition: max-height 1s ease-in-out;
      }

      .svg-lock {
        fill: black;
        margin: 0 auto;
        display: block;
      }

      .svg-lock:hover {
        fill: darkgrey;
      }

      .svg-lock:active {
        fill: silver;
      }

      </style>`;
};

class Lockbox {
  constructor() {}

  create() {
    this.injectHTML();
  }

  encryptInBackground(encryptionOptions) {
    chrome.runtime.sendMessage(encryptionOptions, (encrypted) => {
      document.querySelector(".editable").innerText = `${document.querySelector(".editable").innerText}LOCKBOX DATA DON'T TOUCH THIS!${encrypted}`;
      this.lockbox.classList.add("lockbox-text-close");
      alert("Lockbox has been encrypted successfully!");
      setTimeout(() => {
        const current = this.shadowRoot.querySelector(".ctr-div");
        if (current) {
          current.remove();
        }
      }, 1000);
    });
  }

  injectHTML() {
    const current = document.querySelector(".ctr-div");
    if (current) {
      current.remove();
    }

    this.root = document.createElement("div");
    this.root.contentEditable = true;

    this.shadowRoot = document.createElement("span");
    this.shadowRoot.innerHTML = createHTML("Please enter some text here to be encrypted. Make sure you have one 'compose email' up so that the lockbox knows where to put the encrypted data. ", false);

    this.lockbox = this.shadowRoot.querySelector("#lockbox");

    this.padlock = this.shadowRoot.querySelector("#padlock");
    this.padlock.addEventListener("click", this.close.bind(this), false);

    document.querySelector(".z0").appendChild(this.root);

    const shadow = this.root.attachShadow({mode: "open"});
    shadow.appendChild(this.shadowRoot);
  }

  close() {
    if (!document.querySelector(".editable")) {
      this.shadowRoot.innerHTML = "";
    } else {
      const requestOptions = {
        name: "getKey",
        useDefault: true,
        message: this.lockbox.innerHTML,
      };
  
      alert("Encryption starting, press ok to continue.");
      this.encryptInBackground(requestOptions);
    }  
  }
}

let validPGPMessageBlock = "";

const passwordPrompt = () => {
  document.querySelector(".a3s.aiL").innerHTML += createPopup();
  const box = document.getElementById("passwordpopup");
  box.style.display = "block";
  const passwordButton = document.getElementById("passwordbutton");
  passwordButton.addEventListener("click", () => {
    unlock(document.getElementById("passwordfield").value);
    document.getElementById("passwordpopup").remove();
  });
};

const unlock = (password) => {
  const emailText = document.getElementById("lockedbox").innerText;
  console.log(emailText);

  const decryptOptions = {
    name: "decryptKey",
    useDefault: true,
    message: validPGPMessageBlock,
    password: password,
  };

  chrome.runtime.sendMessage(decryptOptions, (decrypted) => {
    if (decrypted == null) {
      alert("Either you're trying to decrypt an invalid message (someone's messed up the contents) or you're using the wrong password.");
    } else {
      const box = document.getElementById("lockedbox");
      box.innerHTML = decrypted;
      box.classList.remove("lockbox-text-close");
    }
  });
};

const decryptFirst = () => {
  const nodes = document.querySelectorAll(".a3s.aiL");
  const existing = document.querySelector(".ctr-div");
  if (existing) {
    existing.remove();
  }
  for (let node of nodes) {
    let armouredText = null;
    try {
      [armouredText] = node.innerText.match(PGPREGEX);
    } catch {
      console.log("Not an iterable.");
    }
    if (armouredText) {
      console.log("Triggered");
      if (document.querySelectorAll("#lockedbox").length === 0) {
        [validPGPMessageBlock] = node.innerText.match(PGPREGEX);
        console.log(validPGPMessageBlock);
        node.innerHTML = node.innerHTML.replace(PGPREGEX, createHTML(armouredText, true));
        document.getElementById("padlocked").addEventListener("click", passwordPrompt, false);
      }
    }
  }
};


window.addEventListener("hashchange", decryptFirst);

chrome.runtime.onMessage.addListener((request) => {
  if (request === "encrypt") {
    const lockbox = new Lockbox();
    lockbox.create();
  }
  if (request === "decrypt") {
    decryptFirst();
  }
});
