const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
class ImageProcessingClass {
  geminiAiObj;
  geminiAiApiKey = process.env.GEMINI_AI_API_KEY;
  geminiAiModel = "gemini-1.5-flash";

  constructor() {
    this.geminiAiObj = new GoogleGenerativeAI(this.geminiAiApiKey);
  }

  /**
   * read image
   * @param {string} path
   * @param {string} mimeType
   * * @param {string} prompt
   * @returns
   */
  async imageBase64(filepath, mimeType, caption) {
    const model = this.geminiAiObj.getGenerativeModel({
      model: this.geminiAiModel,
    });
    const imageResp = await fetch(
      filepath
    ).then((response) => response.arrayBuffer());

    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(imageResp).toString("base64"),
          mimeType: mimeType,
        },
      },
      caption,
    ]);
    console.log(result.response.text());
  }
}

const classObj = new ImageProcessingClass();
classObj.imageBase64("https://images.pexels.com/photos/1115090/pexels-photo-1115090.jpeg", "image/jpeg", "Flower Image");