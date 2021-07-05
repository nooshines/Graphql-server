const express = require("express");

const fs = require("fs");

const archiver = require('archiver');

const path =require("path")

const multer =require("multer")

const FileSaver = require('file-saver');

const JSZip = require("jszip");

const app = express()

app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/index.html");
})


const dir = "public";
const subDir = "public/uploads"

app.use(express.static("public"))

if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    fs.mkdirSync(subDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  const maxSize = 10 * 1024 * 1024;

  const compressfilesupload = multer({ storage: storage,limits:{fileSize:maxSize}});

app.post("/compressfiles",compressfilesupload.array("file",100),(req,res)=>{
    // const zip = new JSZip();
// if(req.files){
//     req.files.forEach((file,i) => {
//         console.log("file.path",file.path)
//         zip.file(`file-${i}.jpg`, file.path);
//     })

//     zip.generateAsync({ type: "nodebuffer"}).then((zipFile) => {
//         const currentDate = new Date().getTime();
//         const fileName = `combined-${currentDate}.zip`;
//         return FileSaver.saveAs(zipFile, fileName);
//       });
//    }



const output = fs.createWriteStream(__dirname + '/public/example.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});
// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});
// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function() {
  console.log('Data has been drained');
});
// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err;
  }
});
// good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

const buffer3 = Buffer.from('buff it!');

archive.directory('public/uploads', false);

archive.finalize();

archive.pipe(res);

});



app.listen(4000,()=>{
    console.log("App is listening on port 4000")
})