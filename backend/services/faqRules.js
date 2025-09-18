// services/faqRules.js
const fs = require("fs");

let rules = [];

function loadFAQ() {
  const data = JSON.parse(fs.readFileSync("./train.json", "utf-8"));
  rules = data;
}

function regexFAQ(userInput) {
  for (const rule of rules) {
    const pattern = new RegExp(rule.prompt, "i"); 
    if (pattern.test(userInput)) {
      return rule.completion;
    }
  }
  return null;
}

// Export functions in CommonJS style
module.exports = { loadFAQ, regexFAQ };
