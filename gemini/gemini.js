const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
class GeminiAiClass {
  geminiAiObj;
  geminiAiApiKey = process.env.GEMINI_AI_API_KEY;
  geminiAiModel = "gemini-1.5-flash";

  constructor() {
    console.log(this.geminiAiApiKey);
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
}

const classObj = new GeminiAiClass();
// classObj.generateTextData("What are LLM");
classObj.imageToText(
  `image.png`,
  "image/png",
  "Tell something about this image"
);
