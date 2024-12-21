const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
class GeminiAiClass {
  geminiAiObj;
  geminiAiApiKey = process.env.GEMINI_AI_API_KEY;
  geminiAiModel = "gemini-1.5-flash";

  constructor() {
    console.log(this.geminiAiApiKey);
    this.geminiAiObj = new GoogleGenerativeAI(this.geminiAiApiKey);
  }

  async generateTextData(prompt) {
    // const genAI = new GoogleGenerativeAI(GEMINI_AI_API_KEY);
    const model = this.geminiAiObj.getGenerativeModel({
      model: this.geminiAiModel,
    });

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  }
}

const classObj = new GeminiAiClass();
classObj.generateTextData("What are LLM");