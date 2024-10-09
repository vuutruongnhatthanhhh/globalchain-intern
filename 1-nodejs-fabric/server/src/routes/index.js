const UserRouter = require('./UserRouter')
const ProductRouter = require('./ProductRouter')
const OrderRouter = require('./OrderRouter')
const PaymentRouter = require('./PaymentRouter')
const ScheduleRouter = require('./ScheduleRouter')
const AppointmentRouter = require('./AppointmentRouter')

const routes = (app) => {
    app.use('/api/user', UserRouter)
    app.use('/api/product', ProductRouter)
    app.use('/api/order', OrderRouter)
    app.use('/api/payment', PaymentRouter)
    app.use('/api/schedule', ScheduleRouter)
    app.use('/api/appointment', AppointmentRouter)
}

module.exports = routes