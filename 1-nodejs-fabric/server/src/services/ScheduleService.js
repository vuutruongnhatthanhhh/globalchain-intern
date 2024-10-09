const Schedule = require("../models/ScheduleModel")

const createSchedule = (newSchedule) =>{
    return new Promise(async(resolve, reject) =>{
        const {dayOfWeek, workingHours } = newSchedule;
        try{
            // console.log('new',newSchedule)
             
           // Kiểm tra xem lịch làm việc đã tồn tại cho doctor, dayOfWeek và có khác startTime và endTime không
           const existingSchedule = await Schedule.findOne({
           
            dayOfWeek
           
        });
        // console.log('ext', existingSchedule)
        if (existingSchedule) {
            return reject('Schedule already exists dayOfWeek');
        }else{

          // Tạo lịch làm việc mới
          const createdSchedule = await Schedule.create({
            dayOfWeek,
            workingHours
        });
    
        if (createdSchedule) {
            resolve({
                status: 'OK',
                message: 'Schedule created successfully',
                data: createdSchedule
            })
            }
        }
            resolve({})
        }catch(e){
            reject(e)
        }
    })
}

// const updateSchedule = (id, data) =>{
//     return new Promise(async(resolve, reject) =>{
//         try{
      
//             const checkSchedule = await Schedule.findOne({
//                 _id: id
//             })
//             if(checkSchedule===null){
//                 resolve({
//                     status: 'OK',
//                     message: 'The schedule is not defined'
//                 })
//             }
//             // update product
//             const updatedSchedule = await Schedule.findByIdAndUpdate(id, data, {new : true})
//                 resolve({
//                     status: 'OK',
//                     message: 'SUCCESS',
//                     // Trả về user mới sau khi update
//                     data: updatedSchedule
//                 })
//             // }
//             // resolve({})
//         }catch(e){
//             reject(e)
//         }
//     })
// }

const updateSchedule = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkSchedule = await Schedule.findOne({
                'workingHours._id': id
            });

            if (!checkSchedule) {
                resolve({
                    status: 'OK',
                    message: 'The schedule is not defined'
                });
                return;
            }

            // Tìm và cập nhật thông tin của workingHour trong mảng workingHours
            const updatedSchedule = await Schedule.findOneAndUpdate(
                { 'workingHours._id': id },
                {
                    $set: {
                        'workingHours.$.doctor': data.doctor,
                        'workingHours.$.startTime': data.startTime,
                        'workingHours.$.endTime': data.endTime,
                        'workingHours.$.isAvailable': data.isAvailable
                        // Thêm các trường cập nhật khác nếu cần
                    }
                },
                { new: true }
            ).populate('workingHours.doctor', 'name'); // Populate lại thông tin bác sĩ

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedSchedule
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getAllSchedule = () =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
           
            // get all user
            const allSchedule = await Schedule.find().populate({
                path: 'workingHours.doctor',
                select: 'name' // Chỉ chọn trường name của bác sĩ
            });
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data:  allSchedule
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}

// const  getDetailsSchedule = (id) =>{
//     return new Promise(async(resolve, reject) =>{
//         try{
      
//             const schedule = await Schedule.findOne({ _id: id })
//             .populate('workingHours.doctor', 'name'); // Populate thông tin bác sĩ chỉ với trường name
//             // console.log('user',schedule)
//             if(schedule===null){
//                 resolve({
//                     status: 'OK',
//                     message: 'The schedule is not defined'
//                 })
//             }
//                 resolve({
//                     status: 'OK',
//                     message: 'SUCCESS',
//                     data: schedule
//                 })
//             // }
//             // resolve({})
//         }catch(e){
//             reject(e)
//         }
//     })
// }

const getDetailsSchedule = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const schedule = await Schedule.findOne({ 'workingHours._id': id })
                .populate('workingHours.doctor', 'name'); // Populate thông tin bác sĩ chỉ với trường name

            if (!schedule) {
                resolve({
                    status: 'OK',
                    message: 'The schedule is not defined'
                });
            } else {
                // Tìm và trả về đúng workingHour có _id như id được truyền vào
                const workingHour = schedule.workingHours.find(wh => wh._id.toString() === id);
                if (!workingHour) {
                    resolve({
                        status: 'OK',
                        message: 'The working hour is not found in the schedule'
                    });
                } else {
                    resolve({
                        status: 'OK',
                        message: 'SUCCESS',
                        data: workingHour
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    createSchedule,
    updateSchedule,
    getAllSchedule,
    getDetailsSchedule
}