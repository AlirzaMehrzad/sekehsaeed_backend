const userRouter = require('./userRouter')
const sessionRouter = require('./session')
module.exports = (app) =>{

    app.use('/api/v1/user', userRouter)
    app.use('/api/v1/session', sessionRouter)

}