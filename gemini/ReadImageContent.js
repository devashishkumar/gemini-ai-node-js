const path = require("path");
const fs = require("fs");
const Tesseract = require("tesseract.js");

const readImageContent = (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    return {
      success: true,
      data: {
        buffer: imageBuffer,
        base64: base64Image,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

const extractTextFromImage = (imagePath) => {
  try {
    const {
      data: { text },
    } = Tesseract.recognize(imagePath, "eng");
    return {
      success: true,
      text,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

const imagePath = path.join(__dirname, "./../public/images/image2.png");
const result = readImageContent(imagePath);

if (result.success) {
  console.log("Buffer: ", result.data.buffer);
  console.log("Base64: ", result.data.base64);
} else {
  console.error("Error reading image content: ", result.error);
}
