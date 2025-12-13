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
// Default file names to use if none are provided via CLI
const FILES_TO_READ = ["C#.pdf", "Python-Programming.pdf"];
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

  /**
   * Initialize the vector store from one or more PDF files in parallel.
   * @param {string[]|string} files - Array of file paths or a single file path.
   */
  async vectorStoreInitialize(files = FILES_TO_READ) {
    // 1. Load the PDF
    // allow single file string to be passed
    const fileArray = Array.isArray(files) ? files : [files];
    // Expand directories in fileArray (if any directories were passed in)
    const resolvedFilePaths = [];
    for (const f of fileArray) {
      try {
        const stat = fs.statSync(f);
        if (stat.isDirectory()) {
          // add all PDF files in this directory
          const dirFiles = fs.readdirSync(f).filter((ff) => /.pdf$/i.test(ff));
          dirFiles.forEach((df) => resolvedFilePaths.push(path.join(f, df)));
        } else {
          resolvedFilePaths.push(f);
        }
      } catch (e) {
        // if path doesn't exist, just add it and let loader report the error
        resolvedFilePaths.push(f);
      }
    }

    console.log(`Attempting to load ${fileArray.length} input path(s):`, fileArray);
    // Create loaders and load all PDFs in parallel
    const loadPromises = resolvedFilePaths.map(async (f) => {
      try {
        const loader = new PDFLoader(f);
        const docs = await loader.load();
        // attach filename metadata so we know which file a chunk came from
        for (const d of docs) {
          d.metadata = d.metadata || {};
          d.metadata.filename = path.basename(f);
        }
        return { success: true, docs, file: f };
      } catch (err) {
        console.error(`Error loading ${f}:`, err.message || err);
        return { success: false, file: f, err };
      }
    });

    const loadResults = await Promise.all(loadPromises);
    const successfulResults = loadResults.filter((r) => r.success);
    const successfulLoads = successfulResults.flatMap((r) => r.docs);
    const successfulFiles = successfulResults.map((r) => r.file);
    if (successfulLoads.length === 0) {
      throw new Error("No PDF files were successfully loaded.");
    }
    // 2. Split the document into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(successfulLoads);

    // 3. Create Gemini Embeddings and Vector Store
    const embeddings = this.genAI;

    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );

    console.log(
      `Successfully created vector store with ${splitDocs.length} chunks from ${resolvedFilePaths.length} attempted file(s) and ${successfulFiles.length} successful file(s).`
    );
    console.log("Successfully loaded files:", successfulFiles);
    return vectorStore;
  }

  // ... (Continued from Step 2)

  async runRag(vectorStore, userQuestion) {
    const ai = this.javascriptGenAi;
    const retriever = vectorStore.asRetriever();

    // 1. Retrieve relevant documents ('R' in RAG)
    const relevantDocs = await retriever.getRelevantDocuments(userQuestion);
    console.log(`Retrieved ${relevantDocs.length} relevant doc(s)`);
    for (const d of relevantDocs) {
      const fn =
        d.metadata && d.metadata.filename
          ? d.metadata.filename
          : "<unknown-file>";
      console.log(
        `- ${fn}: ${String(d.pageContent || d.content || "")
          .slice(0, 120)
          .replace(/\n/g, " ")}...`
      );
    }
    const context = relevantDocs
      .map((doc) => {
        const filename =
          doc.metadata && doc.metadata.filename ? doc.metadata.filename : null;
        return filename
          ? `FILE: ${filename}\n${doc.pageContent}`
          : doc.pageContent;
      })
      .join("\n---\n");

    // 2. Construct the RAG prompt
    const prompt = `
        You are an expert document assistant. Answer user questions as per
        context provided. If the context does not 
        contain the answer, reply with I don't have any information.

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
  async generateOutput(prompt, files = FILES_TO_READ) {
    console.log("Initializing RAG Process...");
    const vectorStore = await this.vectorStoreInitialize(files);

    const question = prompt;
    console.log(`\nQuery:\n\n${question}`);

    const response = await this.runRag(vectorStore, question);
    console.log(`\nResult:\n\n${response}`);
  }
}
const argv = process.argv.slice(2);
const prompt = "Any relevant info about Python memory management";

// split flags (starting with '-') from positional args so flags don't get treated as file paths
const flags = argv.filter((a) => /^-/.test(a));
const positional = argv.filter((a) => !/^-/).map((a) => a.trim());
const question = positional[0] || prompt;
const files = positional.length > 1 ? positional.slice(1) : FILES_TO_READ;
const dryRun = flags.includes("--dry") || flags.includes("--no-ai");
const classObj = new RagClass();
// CLI usage: node RAG.js "Your question here" file1.pdf file2.pdf ...
if (require.main === module) {
  (async () => {
    try {
      if (dryRun) {
        console.log("Running in dry-run mode: will load files and show retrieved docs without calling the AI.");
        const vectorStore = await classObj.vectorStoreInitialize(files);
        const retriever = vectorStore.asRetriever();
        const docs = await retriever.getRelevantDocuments(question);
        console.log(`
DRY RUN: Found ${docs.length} relevant chunk(s) for question: ${question}\n`);
        docs.forEach((d, i) => {
          const fn = d.metadata && d.metadata.filename ? d.metadata.filename : "<unknown>";
          console.log(`[${i + 1}] File: ${fn}  —  Preview: ${String(d.pageContent || d.content || '').slice(0, 200).replace(/\n/g, ' ')}...`);
        });
        console.log("Dry run complete.");
        return;
      }

      await classObj.generateOutput(question, files);
      console.log("Done.");
    } catch (err) {
      console.error("RAG generation failed:", err);
    }
  })();
} else {
  // non cli usage example
  (async () => {
    try {
      await classObj.generateOutput(question, files);
      console.log("Done.");
    } catch (err) {
      console.error("RAG generation failed:", err);
    }
  })();
}
