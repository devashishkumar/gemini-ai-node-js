const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const { mkdir } = require("fs/promises");
const fs = require("fs");
const clone = require("git-clone");
require("dotenv").config();
class GitFeaturesClass {
  geminiAiObj;
  geminiAiApiKey = process.env.GEMINI_AI_API_KEY;
  geminiAiModel = "gemini-1.5-flash";
  gitRepository = "https://github.com/devashishkumar/gemini-ai-node-js.git";

  constructor() {
    this.geminiAiObj = new GoogleGenerativeAI(this.geminiAiApiKey);
  }

  /**
   * git clone
   */
  async gitClone() {
    const directoryName = "git-clone-directory";
    const repo = this.gitRepository.split("/");
    let repoName = "";
    if (repo && repo.length) {
      const lastRecord = repo[repo.length - 1];
      repoName = lastRecord.replace(".git", "");
    }
    const directoryPath = `${directoryName}/${repoName}`;
    if (!fs.existsSync(directoryPath)) {
      // fs.mkdirSync(directoryPath, { recursive: true });
      await mkdir(directoryPath, { recursive: true });
    }
    const destination = path.resolve(`./${directoryPath}`);
    clone(this.gitRepository, `${destination}/`);
  }
}
