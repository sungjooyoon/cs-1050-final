// signal
let trackerListReady = false;

// fetch 
function fetchTrackerList() {
  fetch(chrome.runtime.getURL('trackers.txt'))
    .then(response => response.text())
    .then(data => {
      // extracting domains
      const trackerDomains = new Set();
      const lines = data.split('\n');
      lines.forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('!') && !line.startsWith('[')) {
          // removing filters
          let domain = line;
          // leaders and trailers
          domain = domain.replace(/^(\|\|)?(.*?)(\^)?$/, '$2');
          if (domain) {
            trackerDomains.add(domain);
          }
        }
      });
      // storage
      chrome.storage.local.set({ trackerDomains: Array.from(trackerDomains) }, function() {
        trackerListReady = true; // true when ready
        console.log('Tracker list loaded with', trackerDomains.size, 'domains.');
      });
    })
    .catch(error => {
      console.error('Error fetching tracker list:', error);
    });
}

// fetch tracker list
fetchTrackerList();

// reset trackerCount on nav
chrome.webNavigation.onCommitted.addListener(function(details) {
  if (details.frameId === 0) { 
    chrome.storage.local.set({ 'trackerCount': 0 }, function() {
      console.log("Tracker count reset on navigation");
    });
  }
});

// listening for outgoing reqs
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // receive signal from top
    if (!trackerListReady) return;

    const url = new URL(details.url);
    const initiator = details.initiator || details.documentUrl || '';

    // pull from storage make useful
    chrome.storage.local.get(['trackerDomains', 'trackerCount'], function(result) {
      const trackerDomains = result.trackerDomains || [];
      let trackerCount = result.trackerCount || 0;

      if (initiator) {
        const initiatorUrl = new URL(initiator);
        if (initiatorUrl.hostname !== url.hostname) {
          // check if tracker = known tracker
          if (trackerDomains.some(domain => url.hostname.endsWith(domain))) {
            trackerCount++;
            chrome.storage.local.set({ 'trackerCount': trackerCount }, function() {
              console.log("Tracker detected:", details.url);
            });
          }
        }
      }
    });
  },
  { urls: ["<all_urls>"] }
);

// beam it to popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "getTrackers") {
    chrome.storage.local.get(['trackerCount'], function(result) {
      let count = result.trackerCount || 0;
      sendResponse({ trackerCount: count });
    });
    return true; 
  }
});
