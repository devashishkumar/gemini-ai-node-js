const fs = require("fs");
const zlib = require("zlib");
const fileName = "input.txt";

// read file
const readFile = () => {
  try {
    fs.readFile(fileName, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data.toString());
      }
    });
  } catch (e) {
    console.log("error");
  }
};

// read file in stream
const readFileInStream = () => {
  try {
    const rsStream = fs.createReadStream(fileName);
    rsStream.on("data", (data) => {
      console.log(data.toString());
      rsStream.on("end", () => {});
      rsStream.on("error", (err) => {
        console.log("file not found");
      });
    });
  } catch (e) {
    console.log("error");
  }
};

// create zip file from existing file
const createZip = () => {
  try {
    fs
      .createReadStream(fileName)
      .pipe(zlib.createGzip().pipe(fs.createWriteStream("./input.zip")));
  } catch (e) {
    console.log("error");
  }
};

module.exports = { createZip, readFile, readFileInStream };
