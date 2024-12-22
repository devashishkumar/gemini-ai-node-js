const fs = require("fs");
const zlib = require("zlib");
const fileName = "input.txt";

// read file
const readFile = () => {
  try {
    // synchronous
    const result = fs.readFileSync(fileName, "utf-8");

    // asynchronous
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

// create file along with content
const createFile = () => {
    try {
        // synchronous
        fs.writeFileSync("./file.txt", "Hello World");

        // asynchronous
        fs.writeFile("./file.txt", "Hello World", (err) => {
            if (err) {
                console.log(err);
            }
        });
      } catch (e) {
        console.log("error");
      } 
}

// append file content
const appendFileContent = () => {
    try {
        // synchronous
        fs.appendFileSyncSync(fileName, new Date().toLocaleString());

        // asynchronous
        fs.appendFile(fileName, new Date().toLocaleString(), (err) => {
            if (err) {
                console.log(err);
            }
        });
      } catch (e) {
        console.log("error");
      } 
}

module.exports = { createFile, createZip, readFile, readFileInStream };
