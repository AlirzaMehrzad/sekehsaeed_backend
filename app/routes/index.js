const userRouter = require('./userRouter')
const categoryRouter = require('./categoryRouter')

module.exports = (app) =>{

    app.use('/api/v1/user', userRouter)
    app.use('/api/v2/category', categoryRouter)

}