const express = require("express");
const router  = express.Router()
const scheduleController = require('../controllers/ScheduleController');

router.post('/create', scheduleController.createSchedule )
router.put('/update/:id', scheduleController.updateSchedule )
router.get('/getAll', scheduleController.getAllSchedule )
router.get('/getDetail/:id', scheduleController.getDetailSchedule )


module.exports = router