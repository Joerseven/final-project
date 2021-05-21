/* eslint-disable no-undef */
const rule = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostEquals: "mail.google.com",
        schemes: ["https"],
      },
    }),
  ],
  actions: [new chrome.declarativeContent.ShowPageAction()],
};

const handleRequest = async (req) => {
  if (req.name === "getKey") {
    if (req.useDefault === true) {
      const publicKeyData = await localforage.getItem("default");
      const key = await openpgp.readKey({ armoredKey: publicKeyData.publicKey });
      const plainText = await openpgp.createMessage({ text: req.message });
      const cipherText = await openpgp.encrypt({
        message: plainText,
        publicKeys: key,
      });
      return cipherText;
    }
  } else if (req.name === "decryptKey") {
    if (req.useDefault === true) {
      try {
        const privateKeyData = await localforage.getItem("default");
        const key = await openpgp.decryptKey({
          privateKey: await openpgp.readKey({ armoredKey: privateKeyData.privateKey }),
          passphrase: req.password,
        });
        const message = await openpgp.readMessage({
          armoredMessage: req.message,
        });
        const { data: decrypted } = await openpgp.decrypt({
          message: message,
          privateKeys: key,
        });
        return decrypted;
      } catch {
        return "Something went wrong :(";
      }
    }
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([rule]);
  });
  localforage.setItem("default", {});
  localforage.setItem("localKeys", []);
});

chrome.runtime.onMessage.addListener((req, sender, res) => {
  handleRequest(req).then((data) => res(data));
  return true;
});
