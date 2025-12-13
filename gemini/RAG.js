const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
let RecursiveCharacterTextSplitter;
class LocalRecursiveCharacterTextSplitter {
  constructor({ chunkSize = 1000, chunkOverlap = 200 } = {}) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  splitText(text) {
    const chunks = [];
    if (!text) return chunks;
    let start = 0;
    const size = this.chunkSize;
    const overlap = this.chunkOverlap;
    while (start < text.length) {
      const end = Math.min(start + size, text.length);
      chunks.push(text.slice(start, end));
      if (end === text.length) break;
      start = end - overlap;
      if (start < 0) start = 0;
    }
    return chunks;
  }

  async splitDocuments(docs) {
    const out = [];
    for (const doc of docs) {
      const text = doc.pageContent || doc.content || "";
      const chunks = this.splitText(text);
      for (const chunk of chunks) {
        out.push({ pageContent: chunk, metadata: doc.metadata || {} });
      }
    }
    return out;
  }
}
RecursiveCharacterTextSplitter = LocalRecursiveCharacterTextSplitter;

let MemoryVectorStore;
class LocalMemoryVectorStore {
  constructor(docs = []) {
    this.docs = docs; // array of { pageContent, metadata }
  }

  static async fromDocuments(docs, embeddings) {
    // Ignore embeddings if not usable; store documents for simple retrieval.
    return new LocalMemoryVectorStore(
      docs.map((d) => ({
        pageContent: d.pageContent || d.content || "",
        metadata: d.metadata || {},
      }))
    );
  }

  asRetriever() {
    const docs = this.docs;
    return {
      // naive retrieval: score by count of query words appearing in document
      async getRelevantDocuments(query) {
        if (!query) return [];
        const qWords = String(query).toLowerCase().split(/\W+/).filter(Boolean);
        const scored = docs.map((d) => {
          const text = (d.pageContent || "").toLowerCase();
          let score = 0;
          for (const w of qWords) {
            if (text.includes(w)) score += 1;
          }
          return { doc: d, score };
        });
        scored.sort((a, b) => b.score - a.score);
        // return top documents with positive score, or top 3 if none match
        const positive = scored.filter((s) => s.score > 0).map((s) => s.doc);
        if (positive.length > 0) return positive.slice(0, 5);
        return scored.slice(0, 3).map((s) => s.doc);
      },
    };
  }
}
MemoryVectorStore = LocalMemoryVectorStore;

const path = require("path");
const fs = require("fs");
require("dotenv").config();
const fileDetails = "C#.pdf";
class RagClass {
  genAI;
  javascriptGenAi;
  geminiAiApiKey = process.env.GEMINI_AI_API_KEY;
  geminiAiModel = "gemini-1.5-flash";
  geminiAiTwoModel = "gemini-2.5-flash";
  geminiEmbeddingModel = "gemini-embedding-001";
  constructor() {
    this.genAI = new GoogleGenerativeAIEmbeddings({
      model: this.geminiEmbeddingModel,
      apiKey: this.geminiAiApiKey,
    });
    this.javascriptGenAi = new GoogleGenAI({ apiKey: this.geminiAiApiKey });
    console.log("Gemini AI RAG Initialized");
  }

  async vectorStoreInitialize() {
    // 1. Load the PDF
    const loader = new PDFLoader(fileDetails);
    const rawDocs = await loader.load();
    // 2. Split the document into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(rawDocs);

    // 3. Create Gemini Embeddings and Vector Store
    const embeddings = this.genAI;

    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );

    console.log(
      `Successfully created vector store with ${splitDocs.length} chunks.`
    );
    return vectorStore;
  }

  // ... (Continued from Step 2)

  async runRag(vectorStore, userQuestion) {
    const ai = this.javascriptGenAi;
    const retriever = vectorStore.asRetriever();

    // 1. Retrieve relevant documents ('R' in RAG)
    const relevantDocs = await retriever.getRelevantDocuments(userQuestion);
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n---\n");

    // 2. Construct the RAG prompt
    const prompt = `
        You are an expert document assistant. Answer user questions as per
        context provided. If the context does not 
        contain the answer, reply with you don't have any information.

        CONTEXT:
        ---
        ${context}
        ---

        QUESTION: ${userQuestion}
        
        ANSWER:
    `;

    // 3. Generate the response ('G' in RAG)
    const response = await ai.models.generateContent({
      model: this.geminiAiTwoModel,
      contents: prompt,
    });

    return response.text;
  }

  // --- Main Execution ---
  async generateOutput(prompt) {
    console.log("Initializing RAG Process...");
    const vectorStore = await this.vectorStoreInitialize();

    const question = prompt;
    console.log(`\nQuery:\n\n${question}`);

    const response = await this.runRag(vectorStore, question);
    console.log(`\nResult:\n\n${response}`);
  }
}

const classObj = new RagClass();
classObj.generateOutput(
  "Background garbage collection in C# and how it works?"
);
