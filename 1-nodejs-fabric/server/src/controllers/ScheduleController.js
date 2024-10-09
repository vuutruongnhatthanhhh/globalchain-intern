const ScheduleService = require('../services/ScheduleService')

const createSchedule = async(req, res) => {
    try{
        // Lấy ra những thuộc tính request sau khi send bằng TC
        const {dayOfWeek, workingHours} = req.body
        // console.log(req.body)
      

        if( !dayOfWeek || !workingHours){
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required a'

            })
        }
    //   Nếu không dính các trường hợp trên thì đưa cái request qua bên service (req.body)
      const response =   await ScheduleService.createSchedule(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const updateSchedule = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const scheduleId = req.params.id
    //   Lấy ra những thông tin cần thay đổi
    const data = req.body
        if(!scheduleId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'

            })
        }
 
    
      const response =   await ScheduleService.updateSchedule(scheduleId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const getAllSchedule = async(req, res) => {
    try{
      
    
      const response =   await ScheduleService.getAllSchedule()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const getDetailSchedule = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const scheduleId = req.params.id
    //   console.log('scheduleid',  req.params)
        if(!scheduleId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The ScheduleId is required'

            })
        }
    //   console.log('user id', userId)
    
      const response =   await ScheduleService.getDetailsSchedule(scheduleId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  



module.exports = {
    createSchedule,
    updateSchedule,
    getAllSchedule,
    getDetailSchedule
} 