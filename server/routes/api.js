var express = require('express');
var Paginate = require('../middleware/paginate.js');
var AuthController = require('../controllers/auth.js');
var LocationController = require('../controllers/location.js');
var NoteController = require('../controllers/note.js');
var UserController = require('../controllers/user.js');
var FileController = require('../controllers/file.js');
var CsvUpload = require('../middleware/csvUpload.js');
var ApiController = require('../controllers/api.js');

var multer  = require('multer');
var FileUpload = multer({ dest: './public/uploads/'});

var router = express.Router();

// Authentication 
router.post('/api-token-auth', AuthController.authenticate);

// Password Reset
router.post('/passwordResetRequests', UserController.setResetPwRequest);
router.post('/passwordResets', UserController.resetPw);

// User 
router.post('/users', UserController.create);
router.get('/users', AuthController.isAuthorized, UserController.readMany); 
router.get('/users/:id', AuthController.isAuthorized, UserController.readOne);
router.put('/users/:id', AuthController.isAuthorized, UserController.update);

// Notes 
router.post('/notes/', AuthController.isAuthorized, NoteController.create);
router.get('/notes', AuthController.isAuthorized, Paginate, NoteController.readAll);
router.put('/notes/:id',AuthController.isAuthorized, NoteController.update);
router.delete('/notes/:id', AuthController.isAuthorized, NoteController.delete);

// Locations
var Locations = ApiController(LocationController);
router.post('/locations/', AuthController.isAuthorized, Locations.create);
router.get('/locations', AuthController.isAuthorized, Paginate, Locations.readAll);
router.put('/locations/:id',AuthController.isAuthorized, Locations.update);
router.delete('/locations/:id', AuthController.isAuthorized, Locations.delete);
// TODO: The download endpoint is currently not secured.
//   Need to find a way for the front end to download a file using Auth tokens
router.get('/locations/download',  Locations.download);


// Files
router.post('/files/', FileUpload.single('file[file]'), AuthController.isAuthorized, FileController.create);
router.post('/locationsFiles', 
			FileUpload.single('locationsFile[file]'), 
			AuthController.isAuthorized, 
			CsvUpload(LocationController.collectionName, LocationController.importFields), 
			Locations.replace);

// Images
router.get('/images/:id', FileController.getImage);
module.exports = router;
