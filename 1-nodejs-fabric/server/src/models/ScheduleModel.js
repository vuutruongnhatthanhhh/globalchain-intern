const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
    {
        
        dayOfWeek: { type: Number, required: true },  // Ngày trong tuần (ví dụ: 0 cho Chủ nhật, 1 cho Thứ hai, ..., 6 cho Thứ bảy)
        workingHours: [
            {
                doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Tham chiếu tới User làm bác sĩ
                startTime: { type: String, required: true }, // Giờ bắt đầu làm việc (ví dụ: "08:00")
                endTime: { type: String, required: true },   // Giờ kết thúc làm việc (ví dụ: "17:00")
                isAvailable: { type: Boolean, default: true } // Trạng thái có sẵn hay không
            }
        ]
    },
    {
        timestamps: true // Tự động thêm các trường createdAt và updatedAt
    }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
