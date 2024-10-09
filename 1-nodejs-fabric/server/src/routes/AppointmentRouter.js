const express = require("express");
const router  = express.Router()
const appointmentController = require('../controllers/AppointmentController');

router.post('/create', appointmentController.createAppointment )
router.get('/getDetail/:id', appointmentController.getDetailAppointment )
router.get('/getAll', appointmentController.getAllAppointment )
router.put('/update/:id', appointmentController.updateAppointment )

module.exports = router