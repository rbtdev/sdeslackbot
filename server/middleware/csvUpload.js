var path = require('path');
var fs = require('fs');

function csvUpload(modelName) {
  return function (req, res, next) {
    var Converter = require("csvtojson").core.Converter;
    var converter = new Converter({constructResult:true});
    console.log('Converting ' + req.file.filename);
    console.log('File Mimetype ' + req.file.mimetype);
    converter.on("end_parsed",
          function(jsonObj) {
            console.log(modelName + ":" + jsonObj);  
            req.body[modelName] = jsonObj;
            next();
      });
    converter.on("error",function(errMsg,errData){
      console.log("Converter error: " + errMsg);
      console.log("Error Data: " + JSON.stringify(errData))
      res.status(500).send({msg:errMsg, data: errData})
    });
    console.log('Building path...');
    var filePath = path.join(__dirname, '../public/uploads/',  req.file.filename);
    console.log('filePath = ' + filePath);
    var readFile = fs.createReadStream(filePath);
    readFile.pipe(converter);
  }
}

module.exports = csvUpload;