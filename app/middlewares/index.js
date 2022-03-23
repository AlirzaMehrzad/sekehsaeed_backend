const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')

module.exports = (app) =>{
    app.use(cookieParser())
    app.use(cors())
    app.use(bodyParser.json())
    app.use(fileUpload({
        useTempFiles: true
    }))

}