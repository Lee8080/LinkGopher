'use strict';
document.getElementById('extract-all').addEventListener('click', event => {
  handler(false).then(() => window.close());
});

document.getElementById('extract-some').addEventListener('click', event => {
  handler(true).then(() => window.close());
});

document.getElementById('about-linkgopher').addEventListener('click', event => {
  const {homepage_url} = chrome.runtime.getManifest();
  openTab(homepage_url).then(() => window.close());
});

// Localization.
[
  {id: 'extract-all', messageId: 'extractAll'},
  {id: 'extract-some', messageId: 'extractSome'},
  {id: 'about-linkgopher', messageId: 'aboutLinkGopher'}
].forEach(item => {
  const container = document.getElementById(item.id);
  container.innerText = chrome.i18n.getMessage(item.messageId);
})

/**
 * @function handler
 * @param {boolean} filtering
 */
function handler(filtering = false) {
  var tabId;

  return getCurrentTab()
    .then(items => { tabId = items[0].id; return injectScript(tabId); })
    .then(item => {
      const url = `${chrome.extension.getURL('browser/linkgopher.html')}?` +
                  `tabId=${tabId}&filtering=${filtering}`;
      return openTab(url);
    })
    .catch(error => window.alert(error));
};

/**
 * Get active tab of current window.
 *
 * @function getCurrentTab
 */
function getCurrentTab() {
  return new Promise((res, rej) => {
    const queryInfo = {
      active: true,
      currentWindow: true
    };

    chrome.tabs.query(queryInfo, items => passNext(items, res, rej));
  });
};

/**
 * Create tab with extension's page.
 *
 * @function openTab
 * @param {string} url
 */
function openTab(url) {
  return new Promise((res, rej) => {
    const createProperties = {active: true, url};
    chrome.tabs.create(createProperties, tab => passNext(tab, res, rej));
  });
};

/**
 * Inject script into tab
 *
 * @function injectScript
 * @param {number} tabId -- The ID of tab.
 * @param {string} file -- Pathname of script
 */
function injectScript(tabId, file = '/content-script.js') {
  return new Promise((res, rej) => {
    const details = {
      file,
      runAt: 'document_start'
    };

    chrome.tabs.executeScript(tabId, details, item => passNext(item, res, rej));
  });
};

/**
 * @function passNext
 * @param {*} result
 * @param {function} fulfill
 * @param {function} reject
 */
function passNext(result, fulfill, reject) {
  if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
  return fulfill(result);
};

// Get Current IP Address

function getIPAddress(callback, errorCallback) {
  var IPUrl = 'https://showextip.azurewebsites.net/'; // Any site used here must be present in manifest.json.
  var x = new XMLHttpRequest();
  x.open('GET', IPUrl);
  x.responseType = 'text';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response) {
      errorCallback('No response.');
      return;
    }
  
  var pattern = /\b(([01]?\d?\d|2[0-4]\d|25[0-5])\.){3}([01]?\d?\d|2[0-4]\d|25[0-5])\b/;
  var foundIP = pattern.exec(response); // Extract the IP addresses from the response and assign to foundIP array.

    callback(foundIP[0]);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderRefreshing() {
  var img = document.createElement("img");
  img.src = "loading.gif";
  var ipSpan = document.getElementById("status");
  ipSpan.replaceChild(img, ipSpan.childNodes[0]);
}

function renderText(statusText) {
  document.getElementById('status').textContent = statusText;
}


document.addEventListener('DOMContentLoaded', function() {
    renderRefreshing();

    getIPAddress(function(ipaddress) {

      renderText(ipaddress);

    }, function(errorMessage) {
      renderText('Unable to refresh. ' + errorMessage);
    });
});