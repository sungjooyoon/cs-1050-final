// display score
function displayPrivacyScore(message) {
  // from content.js
  document.getElementById("score").innerText = `Privacy Score: ${message.privacyScore}/100`;
}

// get/display trackers
function getTrackers() {
  chrome.runtime.sendMessage({ type: "getTrackers" }, function(response) {
    document.getElementById("trackers").innerText = `Trackers Found: ${response.trackerCount}`;
  });
}

// check for scam
function checkForScam(privacyScore) {
  const scamAlertElement = document.getElementById("scamAlert");

  if (privacyScore < 50) {
    scamAlertElement.innerText = "Warning: scam likely!";
  } else if (privacyScore >= 50 && privacyScore <= 80) {
    scamAlertElement.innerText = "Beware: this website may be risky!";
  } else if (privacyScore > 80 && privacyScore <= 100) {
    scamAlertElement.innerText = "This site appears safe.";
  } else {
    scamAlertElement.innerText = "Privacy score out of expected range.";
  }
}

// display categories of point earning criteria
function displayCategories(categories) {
  const categoriesContainer = document.getElementById("categories");
  categoriesContainer.innerHTML = ""; // Clear previous content

  if (categories && categories.length > 0) {
    categories.forEach(category => {
      const listItem = document.createElement("div");
      listItem.innerText = category;
      categoriesContainer.appendChild(listItem);
    });
  } else {
    categoriesContainer.innerText = "No categories earning points.";
  }
}

// inject content.js for results when clicked
document.getElementById("checkPrivacy").addEventListener("click", function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"]
    });
  });

  getTrackers();
});

// listening from content.js
chrome.runtime.onMessage.addListener(function(message) {
  displayPrivacyScore(message);

  if (message.categories) {
    displayCategories(message.categories); // Display categories if available
  }

  checkForScam(message.privacyScore);
});
