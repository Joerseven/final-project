document.addEventListener('DOMContentLoaded', () => {

  const message = evt => {
    console.log("oki");
    chrome.tabs.query({currentWindow: true,active: true},
      function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, evt.target.id);
        console.log("Even more oki");
      });
  };

  const options = () => {
    chrome.runtime.openOptionsPage();
  };

  let encrypt = document.getElementById("encrypt");
  let decrypt = document.getElementById("decrypt");
  let attach = document.getElementById("attach");

  encrypt.addEventListener("click", message, false);
  decrypt.addEventListener("click", message, false);
  attach.addEventListener("click", options, false);
}, false);
