// Import necessary libraries
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ChromaClient, OpenAIEmbeddingFunction } = require("chromadb");
const pdf = require("pdf-parse");
require("dotenv").config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Initialize ChromaDB client
const client = new ChromaClient();
const collection = client.getOrCreateCollection({ name: "my_rag_collection" });

const query = "Installation steps for C# on Windows";
const file = "./C#.pdf";

async function processPdf() {
  try {
    // 1. Load and preprocess data (if file exists)
    let textChunks = [];
    if (file) {
      // use pdf-parse or similar library to extract text
      const dataBuffer = fs.readFileSync(file);
      const pdfData = await pdf(dataBuffer);
      textChunks = pdfData.text.split("\n").map((line) => line.trim()).filter((line) => line);
    }

    // 2. Generate embeddings and store in vector DB
    // ...

    // 3. Retrieve relevant documents
    const retrievedDocs = await collection.query({
      queryTexts: [query],
      nResults: 3,
    });

    // 4. Generate response using Gemini
    const prompt = `Context: ${retrievedDocs.documents.join(
      "\n"
    )}\nQuery: ${query}`;
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch (error) {
    console.error("Error processing PDF:", error);
  }
}
processPdf();
