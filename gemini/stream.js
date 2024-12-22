const fs = require("fs");
const zlib = require("zlib");
const { mkdir } = require("fs/promises");
const { Readable } = require("stream");
const { finished } = require("stream/promises");
const path = require("path");
const fileName = "input.txt";
const unlinkFileName = "";
const imageUrl =
  "https://images.pexels.com/photos/1115090/pexels-photo-1115090.jpeg";

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
    fs.createReadStream(fileName).pipe(
      zlib.createGzip().pipe(fs.createWriteStream("./input.zip"))
    );
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
};

// append file content
const appendFileContent = () => {
  try {
    // synchronous
    fs.appendFileSync(fileName, new Date().toLocaleString());

    // asynchronous
    fs.appendFile(fileName, new Date().toLocaleString(), (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (e) {
    console.log("error");
  }
};

// copy file
const copyFile = () => {
  try {
    // synchronous
    fs.copyFileSync(fileName, "./newfile.txt");

    // asynchronous
    fs.copyFile(fileName, "./newfile.txt", (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (e) {
    console.log("error");
  }
};

// remove file
const removeFile = () => {
  try {
    // synchronous
    fs.unlinkSync(unlinkFileName);

    // asynchronous
    fs.unlink(unlinkFileName, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (e) {
    console.log("error");
  }
};

// create new directory in case not available in the provide path
const createDirectory = () => {
  const path = "dir";
  try {
    // check if path exist
    if (fs.existsSync(path)) {
      console.log("path exist");
    }

    // recursive true means we can create nested directory in one go
    fs.access(path, (error) => {
      if (!error) {
        console.log("path exist");
      } else {
        fs.mkdirSync("dir/newdir", { recursive: true });
      }
    });
  } catch (e) {
    console.log("error");
  }
};

// create random string
const randomString = () => {
  return (Math.random() + 1).toString(36).substring(7).toString();
};

// save file from server url
const saveFileFromUrl = async () => {
  const res = await fetch(imageUrl);
  let fName = randomString();
  const splitName = imageUrl.split(".");
  if (splitName && splitName.length) {
    fName = `${fName}.${splitName[splitName.length - 1]}`;
  }
  if (!fs.existsSync("downloads")) await mkdir("downloads"); //Optional if you already have downloads directory
  const destination = path.resolve("./downloads", fName);
  const fileStream = fs.createWriteStream(destination, { flags: "wx" });
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
};

module.exports = {
  appendFileContent,
  copyFile,
  createDirectory,
  createFile,
  createZip,
  readFile,
  readFileInStream,
  removeFile,
  saveFileFromUrl,
};
