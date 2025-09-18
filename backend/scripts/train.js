// scripts/train.js
const fs = require("fs");
const { addChromaEntry } = require("../services/chromaService");
const { loadFAQ } = require("../services/faqRules");

async function train() {
  const data = JSON.parse(fs.readFileSync("./train.json", "utf-8"));
  
  for (const entry of data) {
    await addChromaEntry(entry);
    console.log(entry)
  }


  loadFAQ();
  console.log("✅ Training complete. Data loaded into Regex + ChromaDB.");
}

train();
