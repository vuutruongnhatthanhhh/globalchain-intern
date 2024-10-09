const AppointmentService = require('../services/AppointmentService')

const createAppointment = async(req, res) => {
    try{
        // Lấy ra những thuộc tính request sau khi send bằng TC
        const {customer, workingHour, service} = req.body
        // console.log(req.body)
      

        if( !customer || !service ||   !workingHour){
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required a'

            })
        }
        



    //   Nếu không dính các trường hợp trên thì đưa cái request qua bên service (req.body)
      const response =   await AppointmentService.createAppointment(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
} 

const getDetailAppointment = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const appointmentId = req.params.id
    //   console.log('scheduleid',  req.params)
        if(!appointmentId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The  appointmentId is required'

            })
        }
    //   console.log('user id', userId)
    
      const response =   await AppointmentService.getDetailsAppointment(appointmentId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const getAllAppointment = async(req, res) => {
    try{
      
    
      const response =   await AppointmentService.getAllAppointment()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
} 

const updateAppointment = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const appointmentId = req.params.id
    //   Lấy ra những thông tin cần thay đổi
    const data = req.body
        if(!appointmentId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The appointmentId is required'

            })
        }
 
    
      const response =   await AppointmentService.updateAppointment(appointmentId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  


module.exports = {
    createAppointment,
    getDetailAppointment,
    getAllAppointment,
    updateAppointment
} 