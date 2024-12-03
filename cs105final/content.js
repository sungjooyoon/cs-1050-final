// functions for security features
// check https
function checkHTTPS() {
  return window.location.protocol === 'https:';
}

// check domain safety, w.r.t. blacklist
async function checkDomainSafety(domain) {
  const apiKey = ''; 
  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

  const requestBody = {
    client: {
      clientId: "yourcompanyname",
      clientVersion: "1.0.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [
        { url: domain }
      ]
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    return result.matches ? false : true; 
  } catch (error) {
    console.error("Error checking domain safety:", error);
    return null; 
  }
}

// check if modern encryption
function checkModernEncryption() {
  try {
    const secureContext = window.isSecureContext;
    return secureContext; 
  } catch (error) {
    console.error("Error checking modern encryption:", error);
    return false;
  }
}

// age checks
async function checkDomainAge() {
  const apiKey = ''; 
  const domain = window.location.hostname;
  const apiUrl = `https://jsonwhoisapi.com/api/v1/whois?identifier=${domain}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Token ${apiKey}` }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("JSONWHOIS API Response:", data);

    const creationDate = new Date(data.created);
    if (isNaN(creationDate)) {
      throw new Error("Invalid creation date format");
    }

    const now = new Date();

    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const fiveYearsAgo = new Date(now);
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);

    const tenYearsAgo = new Date(now);
    tenYearsAgo.setFullYear(now.getFullYear() - 10);

    const fifteenYearsAgo = new Date(now);
    fifteenYearsAgo.setFullYear(now.getFullYear() - 15);

    return {
      isYoungerThanSixMonths: creationDate > sixMonthsAgo,
      isOlderThanFiveYears: creationDate <= fiveYearsAgo,
      isOlderThanTenYears: creationDate <= tenYearsAgo,
      isOlderThanFifteenYears: creationDate <= fifteenYearsAgo,
    };
  } catch (error) {
    console.error("Error checking domain age:", error);
    return { error: true }; 
  }
}

// check domestic registration
async function checkDomainRegistrationCountry() {
  const apiKey = ''; 
  const domain = window.location.hostname;

  try {
    // dns res to pull ip
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    if (!dnsResponse.ok) {
      throw new Error(`DNS resolution error! Status: ${dnsResponse.status}`);
    }
    const dnsData = await dnsResponse.json();
    if (!dnsData || !dnsData.Answer || dnsData.Answer.length === 0) {
      throw new Error("Failed to resolve IP address for the domain");
    }

    let ipAddress = null;
    for (const answer of dnsData.Answer) {
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(answer.data)) {
        ipAddress = answer.data; // ipv4 translation
        break;
      }
    }

    if (!ipAddress) {
      throw new Error("no valid address found");
    }

    const apiUrl = `https://ipinfo.io/${ipAddress}?token=${apiKey}`;
    const ipInfoResponse = await fetch(apiUrl);
    if (!ipInfoResponse.ok) {
      throw new Error(`IPInfo HTTP error! Status: ${ipInfoResponse.status}`);
    }
    const ipInfoData = await ipInfoResponse.json();
    const country = ipInfoData.country;
    if (!country) {
      throw new Error("country information is missing from the ipinfo data");
    }

    const domesticCountries = ["US"];
    return domesticCountries.includes(country); 
  } catch (error) {
    console.error("Error checking domain registration country:", error);
    return false; 
  }
}

// check if bad registrar, on top 50 list of spam registrars
async function checkBadRegistrar() {
  const apiKey = ''; 
  const domain = window.location.hostname;
  const apiUrl = `https://jsonwhoisapi.com/api/v1/whois?identifier=${domain}`;

  const badRegistrars = [
    "郑州世纪创联电子科技发展有限公司",
    "Domain International Services Limited",
    "香港翼优有限公司",
    "郑州世纪创联电子科技开发有限公司",
    "nicenic.net",
    "Harmon Web Global Service",
    "MIRACLEDOMAINS",
    "Zname Ltd",
    "CLEANNET.GE LTD",
    "Miracle Ventures Ltd",
    "ZHENGZHOU CENTURY CONNECT ELECTRONIC TECHNOLOGY DEVELOPMENT CO., LTD",
    "Dnsgulf Pte. Ltd.",
    "Aceville Pte. Ltd.",
    "Hongkong Kouming International Limited",
    "域名國際有限公司",
    "Ultahost, Inc.",
    "广西北部湾在线投资控股有限公司",
    "耐思尼克国际集团有限公司",
    "MainReg, INC.",
    "贵州中域智科网络技术有限公司",
    "Nets To Limited",
    "globalr",
    "云南互道云网络科技有限公司",
    "FE-RU",
    "OPENPROV-RU",
    "宁夏恒盛友情网络科技有限公司",
    "Backorder Ltd",
    "Dominet (HK) Limited",
    "北京中域智科国际网络技术有限公司",
    "网聚品牌管理有限公司",
    "云南蓝队云计算有限公司",
    "DDD TECHNOLOGY PTE. LTD.",
    "NauNet",
    "北京网尊科技有限公司",
    "福州中旭网络技术有限公司",
    "SINO PROFIT (HONG KONG) LIMITED)",
    "海南美洁达科技有限公司",
    "URL Solutions",
    "Name.com",
    "上海福虎信息科技有限公司",
    "Cosmotown Inc.",
    "广东互易网络知识产权有限公司",
    "广州名扬信息科技有限公司",
    "北京新网数码信息技术有限公司",
    "西安千喜网络科技有限公司",
    "北京资海科技有限责任公司",
    "Dynadot",
    "北京万维通港科技有限公司"
  ];

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Token ${apiKey}` }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("JSONWHOIS API Response for Registrar:", data);

    const registrarName = data.registrar;
    if (!registrarName) {
      throw new Error("Registrar information is missing from the WHOIS data");
    }

    return badRegistrars.includes(registrarName); 
  } catch (error) {
    console.error("Error checking domain registrar:", error);
    return false; 
  }
}

// check non-native language
function checkNonNativeGrammar() {
  const textContent = document.body.innerText;

  if (/\brigister\b/i.test(textContent)) {
    console.log("error: rigister");
    return false;
  }

  const sentences = textContent.split(/[.!?]\s+/); 
  let errors = 0;
  let totalWords = 0;

  // common grammar error patterns
  const commonMistakes = [
    /\btheir\b.*?\bthere\b/i,
    /\bthen\b.*?\bthan\b/i,
    /\bit's\b.*?\bits\b/i,
    /\byour\b.*?\byou're\b/i,
    /\baffect\b.*?\beffect\b/i,
    /\badvice\b.*?\badvise\b/i
  ];

  // most common nonnative mistakes
  const nonNativeMistakes = [
    /\b(?:he|she|it)\s+go\b/i, 
    /\b(?:a|an|the)\s+(?:water|money|information|advice)\b/i,
    /\bin\b\s+\b(monday|january|2020)\b/i, 
    /\bat\b\s+\b(home|work|school)\b/i, 
    /\b(?:i|he|she|we|they)\s+was\b/i, 
    /\bis\b\s+\b(?:you|we|they)\b/i, 
    /\bgo\s+to\s+home\b/i, 
    /\bmore\s+better\b/i, 
    /\bmore\s+faster\b/i, 
    /\bdidn't\s+went\b/i 
  ];

  // check every sentence
  sentences.forEach((sentence) => {
    const words = sentence.trim().split(/\s+/);
    totalWords += words.length;

    // bad punctuation
    if (!/[.!?]$/.test(sentence.trim())) {
      errors++;
    }

    // repetition
    let previousWord = "";
    words.forEach((word) => {
      if (word.toLowerCase() === previousWord.toLowerCase()) {
        errors++;
      }
      previousWord = word;
    });

    // verb tense inconsistency
    const presentTenseWords = sentence.match(/\b(is|are|go|do|have)\b/g) || [];
    const pastTenseWords = sentence.match(/\b(was|were|went|did|had)\b/g) || [];
    if (presentTenseWords.length > 0 && pastTenseWords.length > 0) {
      errors++;
    }
  });

  // full check
  [...commonMistakes, ...nonNativeMistakes].forEach((regex) => {
    if (regex.test(textContent)) {
      errors++;
    }
  });

  // score accuracy
  const errorRate = errors / totalWords;
  const grammarScore = (1 - errorRate) * 100;

  return grammarScore >= 80; 
}

// helper to pull all text
function getAllTextContent(node) {
  let text = '';
  for (let child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.nodeValue + ' ';
    } else if (child.nodeType === Node.ELEMENT_NODE && child.nodeName !== 'SCRIPT' && child.nodeName !== 'STYLE') {
      text += getAllTextContent(child);
    }
  }
  return text;
}

// check for payment
function checkPaymentInformation() {
  let score = 0;
  const pageContent = getAllTextContent(document.documentElement).toLowerCase();

  const paymentKeywords = [
    "credit card",
    "payment method",
    "billing information",
    "checkout",
    "payment details",
    "card number",
    "visa",
    "mastercard",
    "american express",
    "pay now",
    "add to cart",
    "order summary",
    "gift card",
    "order status"
  ];

  const usesPayPal = pageContent.includes("paypal");

  // payment keywords or nah
  const takesPayment = paymentKeywords.some(keyword => pageContent.includes(keyword));

  if (!takesPayment) {
    // if no paymen, add 10 points
    score += 10;
  } else if (usesPayPal) {
    // paypal is plus five
    score += 5;
  }

  return { score, takesPayment, usesPayPal };
}

// checking for number of popups, particularly helpful for scam popups
function hasExcessivePopups() {
  let popupCount = 0;

  const originalWindowOpen = window.open;
  window.open = function (...args) {
    popupCount++;
    return originalWindowOpen.apply(this, args);
  };

  return {
    incrementPopupCount: function () {
      popupCount++;
    },
    check: function () {
      return popupCount > 3;
    },
  };
}

// background.js comms for no. of tracker
function getNumberOfTrackers() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "getTrackers" }, (response) => {
      resolve(response.trackerCount);
    });
  });
}

// categories array to push criteria list to extension
let categories = [];

if (checkHTTPS()) {
  categories.push("HTTPS");
}

// check using functions
checkDomainSafety(window.location.hostname).then(isSafe => {
  if (isSafe) {
    categories.push("Safe Browsing");
  }

  if (checkModernEncryption()) {
    categories.push("Modern Encryption");
  }

   const popupTracker = hasExcessivePopups();

   Promise.all([
    checkDomainAge(),
    checkDomainRegistrationCountry(),
    checkBadRegistrar(),
    checkNonNativeGrammar()
  ]).then(results => {
    const domainAgeResult = results[0];

    if (!domainAgeResult.isYoungerThanSixMonths) {
      categories.push("Established Domain Age (> 6 months)");
    }
    if (domainAgeResult.isOlderThanFiveYears) {
      categories.push("Domain Age > 5 Years");
    }
    if (domainAgeResult.isOlderThanTenYears) {
      categories.push("Domain Age > 10 Years");
    }
    if (domainAgeResult.isOlderThanFifteenYears) {
      categories.push("Domain Age > 15 Years");
    }

    if (results[1]) { 
      categories.push("Domestic Registration");
    }
    if (!results[2]) { 
      categories.push("Trusted Registrar");
    }
    if (results[3]) {
      categories.push("Localized Grammar");
    }

    const paymentResult = checkPaymentInformation();
    if (!paymentResult.takesPayment) {
      categories.push("No Payment Information Collected");
    } else if (paymentResult.usesPayPal) {
      categories.push("Accepts PayPal Payments");
    }

    const isExcessivePopup = popupTracker.check();
    if (!isExcessivePopup) {
      categories.push("No Excessive Popups");
    }

    // beam to popup.js
    chrome.runtime.sendMessage({ categories: categories });
  }).catch(error => {
    console.error("Error in checks:", error);
  });
}).catch(error => {
  console.error("Error in Safe Browsing check:", error);
});

// main to calc score
(async function collectPrivacyData() {
  let privacyScore = 0;

  const isSecure = checkHTTPS();
  if (isSecure) privacyScore += 10;

  const domain = window.location.hostname;
  const domainSafety = await checkDomainSafety(domain);
  if (domainSafety) privacyScore += 10;

  const domainAgeResult = await checkDomainAge();
  if (!domainAgeResult.isYoungerThanSixMonths) {
    privacyScore += 5; 
  }
  if (domainAgeResult.isOlderThanFiveYears) {
    privacyScore += 5; 
  }
  if (domainAgeResult.isOlderThanTenYears) {
    privacyScore += 10; 
  }
  if (domainAgeResult.isOlderThanFifteenYears) {
    privacyScore += 10; 
  }

  const isDomestic = await checkDomainRegistrationCountry();
  if (isDomestic) privacyScore += 10;

  if (checkModernEncryption()) privacyScore += 10;

  if (checkNonNativeGrammar()) {
    privacyScore += 5;
  }

  const paymentResult = checkPaymentInformation();
  privacyScore += paymentResult.score;

  const isBadRegistrar = await checkBadRegistrar();
  if (!isBadRegistrar) privacyScore += 10;

  const popupTracker = hasExcessivePopups();
  if (!popupTracker.check()) privacyScore += 5;

  const numberOfTrackers = await getNumberOfTrackers();
  privacyScore = Math.max(privacyScore, 0);

  const message = {
    isSecure,
    isDomainSafe: domainSafety,
    isDomainYoung: domainAgeResult.isYoungerThanSixMonths,
    isOlderThanFiveYears: domainAgeResult.isOlderThanFiveYears,
    isOlderThanTenYears: domainAgeResult.isOlderThanTenYears,
    isDomestic,
    isBadRegistrar,
    numberOfTrackers,
    privacyScore, 
    categories,
    paymentResult,
    popupCount: popupTracker.popupCount || 0
  };

  console.log("Sending message from content.js:", message);
  chrome.runtime.sendMessage(message);
})();
