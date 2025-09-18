# 📌 Linkbuilder Draft Chatbot

An intelligent **link-building assistant chatbot** built with **React + Node.js**, using **ChromaDB** for semantic vector search, **MongoDB** for persistent storage, and **Gemini API** (with optional support for OpenAI or Grok) for natural language responses.

The chatbot helps users with:
- 📚 FAQs & knowledge base lookups
- 💬 Conversational assistance
- 🛠️ Resources and navigation guidance
- 🔍 Smart query handling using embeddings

---

## 🚀 Features

- **Hybrid Retrieval-Augmented Generation (RAG)**
  Combines **ChromaDB vector search** with **Gemini API** for context-aware answers.

- **Multi-Mode Chat**
  Supports **Chat, Help, Resources, and FAQ navigation**.

- **Persistent Knowledge Base**
  - FAQs stored in **MongoDB**
  - Indexed in **ChromaDB** for semantic search

- **Extensible API Provider Layer**
  Easily switch between **Gemini, OpenAI, Grok**, or other LLM providers.

- **Modern UI (React)**
  - Clean chatbot interface
  - Session handling
  - Provider selection

---

## 🏗️ Tech Stack

**Frontend**
- ⚛️ React + TypeScript
- 🎨 TailwindCSS
- 🔄 Axios

**Backend**
- 🟢 Node.js + Express
- 📦 ChromaDB (vector embeddings)
- 🍃 MongoDB (persistent storage)
- 🤖 Gemini API / OpenAI / Grok

---

## 📂 Project Structure

```bash
linkbuilder-chatbot/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI Components
│   │   ├── pages/           # Chat UI
│   │   ├── services/        # API calls
│   │   └── App.tsx
│   └── package.json
│
├── server/                  # Node.js backend
│   ├── routes/              # API routes
│   ├── services/            # Gemini, Chroma, Mongo integrations
│   ├── models/              # MongoDB schemas
│   ├── index.js             # Express entrypoint
│   └── package.json
│
├── chroma/                  # ChromaDB persistent volume
├── .env                     # Environment variables
└── README.md
```

## ⚙️ Setup & Installation

1️⃣ Clone Repository
---
```

git clone https://github.com/nahom-zenebe/Chatbot-linkbuilder
cd linkbuilder-chatbot 

```


2️⃣ Backend Setup
---

 ```

cd backend 
cd chatbot
npm install


```
## Run chromadb
```
npm install chromadb @chroma-core/default-embed
chroma run --path services.chromaService.js
chroma run --path ./chroma-data
```
#you can use docker if you need
```
docker run -d \
  --name chroma \
  -p 8000:8000 \
  -v chroma_data:/chroma-data \
  ghcr.io/chroma-core/chroma:latest \
  chroma start --persist-directory /chroma-data

```
## run your application
```
npm start
```

## Create a .env file in server:

```
PORT=5000
MONGO_URI=Your_String
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key  
GROK_API_KEY=your_grok_api_key       
CHROMA_HOST=localhost
CHROMA_PORT=8000

```
