const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Tham chiếu tới User làm khách hàng
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Tham chiếu tới User làm khách hàng
        workingHour: { type: mongoose.Schema.Types.ObjectId, required: true }, // Tham chiếu tới phần tử trong mảng workingHours
        status: { type: String, enum: ['Confirmed', 'Cancelled', 'Completed'], default: 'Confirmed' }
    },
    {
        timestamps: true // Tự động thêm các trường createdAt và updatedAt
    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
