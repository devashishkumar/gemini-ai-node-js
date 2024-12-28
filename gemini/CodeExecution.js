const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const { mkdir } = require("fs/promises");
const fs = require("fs");
const clone = require("git-clone");
require("dotenv").config();
class CodeExecutionClass {
  geminiAiObj;
  geminiAiApiKey = process.env.GEMINI_AI_API_KEY;
  geminiAiModel = "gemini-1.5-pro";

  constructor() {
    this.geminiAiObj = new GoogleGenerativeAI(this.geminiAiApiKey);
    this.model = this.geminiAiObj.getGenerativeModel({
      model: this.geminiAiModel,
      tools: [
        {
          codeExecution: {},
        },
      ],
    });
  }

  /**
   * generate code
   */
  async generateCode() {
    const result = await this.model.generateContent(
        'What is the sum of the first 50 prime numbers? ' +
          'Generate and run code in for the calculation, and make sure you get all 50.',
      );
    console.log(result.response.text());
  }

  /**
   * code execution
   */
  async enableCodeExecution() {
    const result = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text:
                  'What is the sum of the first 50 prime numbers? ' +
                  'Generate and run code for the calculation, ' +
                  'and make sure you get all 50.',
              },
            ],
          },
        ],
        tools: [
          {
            codeExecution: {},
          },
        ],
      });
      
    console.log(result.response.text());
  }

  /**
   * code execution in chat
   */
  async enableCodeExecutionInChat() {
    const chat = this.model.startChat({
        // This could also be set on the model.
        tools: [
          {
            codeExecution: {},
          },
        ],
      });
      
      const result = await chat.sendMessage(
        'What is the sum of the first 50 prime numbers? ' +
          'Generate and run code for the calculation, and make sure you get all 50.',
      );
      
    console.log(result.response.text());
  }
}

const classObj = new CodeExecutionClass();
classObj.enableCodeExecutionInChat();
