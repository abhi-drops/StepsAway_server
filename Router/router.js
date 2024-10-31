const express = require('express')
const router  = express.Router()
const userController = require('../Controller/userController')
const cityController = require('../Controller/cityController')
const circleController = require('../Controller/circleController')
const noteController = require('../Controller/noteController')
const jwtMiddileware = require('../Middleware/jwtMiddleware')
const multerConfig = require('../Middleware/multerMiddleware')


router.post('/register',userController.register)

router.post(`/login`,userController.login)

router.post(`/addnewcity`,cityController.addNewCity)

router.post(`/searchCities`,cityController.searchCities)

router.post('/addnewcircle', jwtMiddileware , circleController.addNewCircle);

router.post(`/searchCircles`,circleController.searchCircles)

router.get('/getUserData', jwtMiddileware , userController.getUserData);

router.get('/getCircleData/:circleId', circleController.getCircleData);

router.post('/addNewNote', jwtMiddileware , noteController.addNewNote);

router.get('/getNoteData/:NoteId', noteController.getNoteData);

module.exports = router