const express = require('express')
const router  = express.Router()
const userController = require('../Controller/userController')
const cityController = require('../Controller/cityController')
const circleController = require('../Controller/circleController')
const noteController = require('../Controller/noteController')
const eventController = require('../Controller/eventController')
const jwtMiddileware = require('../Middleware/jwtMiddleware')
const multerConfig = require('../Middleware/multerMiddleware')
const reportController = require("../Controller/reportController")

router.post('/register',userController.register)

router.post(`/login`,userController.login)

router.post(`/addnewcity`,cityController.addNewCity)

router.post(`/searchCities`,cityController.searchCities)

router.post('/addnewcircle', jwtMiddileware , circleController.addNewCircle);

router.post(`/searchCircles`,circleController.searchCircles)

router.post('/getUserData', jwtMiddileware , userController.getUserData);

router.get('/getCircleData/:circleId', circleController.getCircleData);

router.post('/joinCircle/:circleId',jwtMiddileware, circleController.joinCircle);

router.post('/addNewNote', jwtMiddileware , noteController.addNewNote);

router.get('/getNoteData/:NoteId', noteController.getNoteData);

router.put('/addNoteComment/:NoteId', jwtMiddileware, noteController.addNoteComment);

router.put('/addNoteLike/:NoteId', jwtMiddileware, noteController.addNoteLike);


router.post('/addNewEvent', jwtMiddileware ,eventController.addNewEvent);

router.get('/getEventsData/:cityId',eventController.getEventsData);

router.get('/getEventData/:eventId',eventController.getEventData);

router.put('/addEventComment/:eventId', jwtMiddileware, eventController.addEventComment);

router.put('/addEventLike/:eventId', jwtMiddileware, eventController.addEventLike);

router.put('/editUserData', jwtMiddileware, userController.editUserData);

router.put('/editEventNote/:eventId', jwtMiddileware, eventController.editEventNote);

router.put('/editCircleNote/:NoteId', jwtMiddileware, noteController.editCircleNote);

router.post('/followUser', jwtMiddileware , userController.followUser);

router.post('/getTotalCount', jwtMiddileware , reportController.getTotalCount);

router.post('/addReport', jwtMiddileware , reportController.addReport);

router.get('/getReport', reportController.getReports);

router.put('/removeCircleNote/:NoteId', jwtMiddileware, noteController.deleteNote);

router.put('/deleteEvent/:eventId', jwtMiddileware, eventController.deleteEvent);

router.put('/banUser', jwtMiddileware, userController.banUser);

router.put('/resolveReport/:reportId', reportController.resolveReport);

module.exports = router