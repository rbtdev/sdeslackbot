var path = require('path');
var fs = require('fs');

function  csvUpload(modelName, fieldNames) {
  return function (req, res, next) {
    var Converter=require("csvtojson").Converter;
    var converter= new Converter({headers: fieldNames});
    console.log("Field Names:" + fieldNames);

    converter.on("end_parsed",
          function(jsonObj) {
            req.body[modelName] = jsonObj;
            next();
    });

    converter.on("error",function(errMsg,errData){
      res.status(500).send({msg:errMsg, data: errData})
    });

    var filePath = path.join(__dirname, '../public/uploads/',  req.file.filename);
    var readFile = fs.createReadStream(filePath).pipe(converter);
  }
}

module.exports = csvUpload;