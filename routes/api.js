var express = require('express');
var Paginate = require('../middleware/paginate.js');
var AuthController = require('../controllers/auth.js');
var LocationController = require('../controllers/location.js');
var NoteController = require('../controllers/note.js');
var UserController = require('../controllers/user.js');
var FileController = require('../controllers/file.js');
var multer  = require('multer');
var FileUpload = multer({ dest: './public/uploads/'});

var router = express.Router();

// Authentication 
router.post('/api-token-auth', AuthController.authenticate);

// User 
router.post('/users', UserController.create);
router.get('/users', AuthController.isAuthorized, UserController.readAll); 
router.get('/users/:id', AuthController.isAuthorized, UserController.readOne);
router.put('/users/:id', AuthController.isAuthorized, UserController.update);

// Notes 
router.post('/notes/', AuthController.isAuthorized, NoteController.create);
router.get('/notes', AuthController.isAuthorized, Paginate, NoteController.readAll);
router.put('/notes/:id',AuthController.isAuthorized, NoteController.update);
router.delete('/notes/:id', AuthController.isAuthorized, NoteController.delete);

// Locations
router.post('/locations/', AuthController.isAuthorized, LocationController.create);
router.get('/locations', AuthController.isAuthorized, Paginate, LocationController.readAll);
router.put('/locations/:id',AuthController.isAuthorized, LocationController.update);
router.delete('/locations/:id', AuthController.isAuthorized, LocationController.delete);

// Files
router.post('/files/', FileUpload.single('file[image]'), AuthController.isAuthorized, FileController.create);

// Images
router.get('/images/:id', FileController.getImage);
module.exports = router;
