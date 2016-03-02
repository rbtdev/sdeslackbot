var express = require('express');
var Paginate = require('../middleware/paginate.js');
var AuthController = require('../controllers/auth.js');
var LocationController = require('../controllers/location.js');
var NoteController = require('../controllers/note.js');
var UserController = require('../controllers/user.js');
var FileController = require('../controllers/file.js');
var AlertController = require('../controllers/alert.js');
var CsvUpload = require('../middleware/csvUpload.js');
var ApiController = require('../controllers/api.js');
var FileUpload = require('multer')({ dest: './public/uploads/'});
var Locations = ApiController(LocationController);
var Alerts = ApiController(AlertController);
var api = express.Router();

// Set up API endpoints

// Unsecure endpoints (No JWT Token required)
api
	// Authentication (login)
	.post('/api-token-auth', AuthController.authenticate)
	// Password Reset
	.post('/passwordResetRequests', UserController.setResetPwRequest)
	.post('/passwordResets', UserController.resetPw)
	// User creation (sign up)
	.post('/users', UserController.create)
	// Images (uploaded avatars)
	.get('/images/:id', FileController.getImage)

	// Receive Outgress Alerts
	.post('/alerts',FileUpload.array(), Alerts.create)

;

// Secure Endpoints
api.use(AuthController.isAuthorized)

	// Users
	.get('/users', UserController.readMany)
	.get('/users/:id', UserController.readOne)
	.put('/users/:id', UserController.update)

	// Notes 
	.post('/notes/', NoteController.create)
	.get('/notes', Paginate, NoteController.readAll)
	.put('/notes/:id', NoteController.update)
	.delete('/notes/:id', NoteController.delete)

	// Locations
	.post('/locations/', Locations.create)
	.get('/locations', Paginate, Locations.readAll)
	.put('/locations/:id', Locations.updateOne)
	.delete('/locations/:id', Locations.delete)
	.get('/locations/download',  Locations.download)

	// Files
	.post('/files/', FileUpload.single('file[file]'), FileController.create)
	.post('/locationsFiles', FileUpload.single('locationsFile[file]'), 
		CsvUpload(LocationController.collectionName, LocationController.importFields), 
		Locations.updateBulk)

// End of routes 
;
module.exports = api;
