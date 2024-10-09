const Appointment = require("../models/AppointmentModel")
const Schedule = require("../models/ScheduleModel")
const createAppointment = (newSchedule) =>{
    return new Promise(async(resolve, reject) =>{
        const { customer, service, workingHour} = newSchedule;
        try{
            // console.log('new',newSchedule)
               // Kiểm tra sự tồn tại của workingHourId
        const schedule = await Schedule.findOne({ 'workingHours._id': workingHour });
        if (!schedule) {
            return res.status(404).json({
                status: 'ERR',
                message: 'WorkingHour not found in any Schedule'
            });
        }else{
         

        // Tạo cuộc hẹn mới
        const createdAppointment = await Appointment.create({
            customer,
            service,
            workingHour
        });

        if (createdAppointment) {
              // Cập nhật isAvailable của workingHour thành false
              const workingHourToUpdate = schedule.workingHours.id(workingHour);
              workingHourToUpdate.isAvailable = false;
              await schedule.save();
            resolve({
                status: 'OK',
                message: 'Appointment created successfully',
                data: createdAppointment
            })
            }
    }
    
       
        
            resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const getDetailsAppointment = (appointmentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm Appointment theo ID
            const appointment = await Appointment.findById(appointmentId)
            .populate({
                path: 'customer',
                select: '_id email name phone', // Chỉ populate các trường id, name, phone trong User
              })
              .populate({
                path: 'service',
                select: '_id name type price', // Chỉ populate các trường id, name, phone trong User
              })
            ;

            if (!appointment) {
                return resolve({
                    status: 'ERR',
                    message: 'Appointment not found'
                });
            }

                      // Tìm Schedule chứa workingHour có _id khớp với appointment.workingHour
                      const schedule = await Schedule.findOne({ 'workingHours._id': appointment.workingHour })
                      .populate({
                          path: 'workingHours',
                          match: { _id: appointment.workingHour },
                          populate: { path: 'doctor', select: 'name' }
                      });
      

                      
            if (!schedule) {
                return resolve({
                    status: 'ERR',
                    message: 'Schedule not found for the given workingHour'
                });
            }

            // Tìm và trả về đúng workingHour có _id khớp với appointment.workingHour
            const workingHour = schedule.workingHours.id(appointment.workingHour);
            if (!workingHour) {
                return resolve({
                    status: 'ERR',
                    message: 'WorkingHour not found in the schedule'
                });
            }

            return resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: {
                    appointment,
                    schedule,
                    workingHour,
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getAllAppointment = () => {
    return new Promise(async (resolve, reject) => {
      try {
        // Tìm tất cả các cuộc hẹn
        
        const appointments = await Appointment.find({})
        .populate({
            path: 'customer',
            select: '_id email name phone', // Chỉ populate các trường id, name, phone trong User
          })
          .populate({
            path: 'service',
            select: '_id name type price unit', // Chỉ populate các trường id, name, phone trong User
          })
        ;
  
        if (!appointments || appointments.length === 0) {
          return resolve({
            status: 'ERR',
            message: 'No appointments found',
          });
        }
  
        // Sử dụng map và Promise.all để lặp qua từng cuộc hẹn và lấy thông tin lịch làm việc và bác sĩ tương ứng
        const appointmentsWithDetails = await Promise.all(
          appointments.map(async (appointment) => {
            // Tìm lịch làm việc chứa workingHour có _id khớp với appointment.workingHour
            const schedule = await Schedule.findOne({
              'workingHours._id': appointment.workingHour,
            }).populate({
              path: 'workingHours',
              match: { _id: appointment.workingHour },
              populate: { path: 'doctor', select: 'name' },
            });
  
            if (!schedule) {
              return {
                status: 'ERR',
                message: 'Schedule not found for the given workingHour',
              };
            }
  
            // Tìm và trả về đúng workingHour có _id khớp với appointment.workingHour
            const workingHour = schedule.workingHours.id(appointment.workingHour);
            if (!workingHour) {
              return {
                status: 'ERR',
                message: 'WorkingHour not found in the schedule',
              };
            }
  
            return {
              appointment,
              schedule,
              workingHour
            };
          })
        );
  
        return resolve({
          status: 'OK',
          message: 'SUCCESS',
          data: appointmentsWithDetails,
        });
      } catch (e) {
        reject(e);
      }
    });
  };

const updateAppointment = (id, data) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
            const checkAppointment = await Appointment.findOne({
                _id: id
            })
            if(checkAppointment===null){
                resolve({
                    status: 'ERR',
                    message: 'The appointment is not defined'
                })
            }
            // update user
            const updatedAppointment = await Appointment.findByIdAndUpdate(id, data, {new : true})
            if (updatedAppointment) {
              // Tìm schedule chứa workingHour của appointment đã được cập nhật
              const schedule = await Schedule.findOne({ 'workingHours._id': updatedAppointment.workingHour });
              if (schedule) {
                  // Tìm workingHour trong schedule
                  const workingHourToUpdate = schedule.workingHours.id(updatedAppointment.workingHour);
                  if (workingHourToUpdate) {
                      // Cập nhật isAvailable thành true
                      workingHourToUpdate.isAvailable = true;
                      await schedule.save();
                  }
              }
          }
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    // Trả về user mới sau khi update
                    data: updatedAppointment
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}
  



module.exports = {
    createAppointment,
    getDetailsAppointment,
    getAllAppointment,
    updateAppointment
}
