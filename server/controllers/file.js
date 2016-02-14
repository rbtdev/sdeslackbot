var path = require('path');

var controller = {

	create: function (req, res, next) {

		//console.log(req.file)
		//
		// If cloud hosting files, upload the file to the cloud 
		// and set the image URL to the cloud URL.
		//
		var url = "https://"  + req.host;
		console.log('Env:' + process.env.ENV)
		if (process.env.ENV === "development") {
			url = req.protocol + "://"  + req.host + ":" + process.env.PORT;
		}
		url = url + '/api/v1/images/' + req.file.filename



  		var file = {
  			imageName: req.file.originalname,
  			image: {
  				url:  url
  			}
  		}
		res.status(200).send({file:file});
	},

	getImage: function (req, res, next) {
		res.sendFile(req.params.id,
			{ root: path.join(__dirname, '../public/uploads/') });
	}
};

module.exports = controller;