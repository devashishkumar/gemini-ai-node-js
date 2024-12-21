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
}

const classObj = new GeminiAiClass();
// classObj.generateTextData("What are LLM");
// classObj.imageToText(
//   `image.png`,
//   "image/png",
//   "Tell something about this image"
// );
classObj.generateTextData("What are LLM");
