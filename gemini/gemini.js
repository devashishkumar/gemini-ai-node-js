const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
class GeminiAiClass {
  geminiAiObj;
  geminiAiApiKey = process.env.GEMINI_AI_API_KEY;
  geminiAiModel = "gemini-1.5-flash";

  constructor() {
    this.geminiAiObj = new GoogleGenerativeAI(this.geminiAiApiKey);
  }

  /**
   * generate response as per prompt text
   * @param {string} prompt
   */
  async generateTextData(prompt) {
    const model = this.geminiAiObj.getGenerativeModel({
      model: this.geminiAiModel,
    });

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  }

  /**
   * read image
   * @param {string} path
   * @param {string} mimeType
   * * @param {string} prompt
   * @returns
   */
  async imageToText(fileName, mimeType, prompt) {
    const model = this.geminiAiObj.getGenerativeModel({
      model: this.geminiAiModel,
    });
    const filePath = `${path.resolve("./")}/public/images/${fileName}`;
    const imageResponse = {
      inlineData: {
        data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, imageResponse]);
    console.log(result.response.text());
  }

  /**
   * generate response as stream
   * @param {string} prompt
   */
  async generateTextStream(prompt) {
    const model = this.geminiAiObj.getGenerativeModel({
      model: this.geminiAiModel,
    });

    const result = await model.generateContentStream(prompt);

    // Print text as it comes in.
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
    }
  }

  /**
   * create interactive chat
   */
  async createInteractiveChat() {
    const model = this.geminiAiObj.getGenerativeModel({
      model: this.geminiAiModel,
    });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to know?" }],
        },
      ],
    });
    let result = await chat.sendMessage("My Brother name is Ayush.");
    console.log(result.response.text());
    result = await chat.sendMessage("What is my Brother name?");
    console.log(result.response.text());
  }

  /**
   * create interactive chat streaming
   */
  async createInteractiveChatStreaming() {
    const model = this.geminiAiObj.getGenerativeModel({
      model: this.geminiAiModel,
    });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to know?" }],
        },
      ],
    });
    let result = await chat.sendMessageStream("My Brother name is Ayush.");
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
    }
    result = await chat.sendMessageStream("What is my Brother name?");
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
    }
  }

  /**
   * configure text generation
   * @param {string} prompt
   */
  async configureTextGeneration(prompt) {
    const model = this.geminiAiObj.getGenerativeModel({
      model: this.geminiAiModel,
      generationConfig: {
        candidateCount: 1,
        stopSequences: ["x"],
        maxOutputTokens: 20,
        temperature: 1.0,
      },
    });

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  }
}

const classObj = new GeminiAiClass();
// classObj.generateTextData("What is LLM");
// classObj.imageToText(
//   `image.png`,
//   "image/png",
//   "Tell something about this image"
// );
// classObj.generateTextData("What is LLM");
// classObj.createInteractiveChat();
// classObj.createInteractiveChatStreaming();
// classObj.configureTextGeneration("What is LLM");
