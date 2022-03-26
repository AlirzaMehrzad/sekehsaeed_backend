const router = require('express').Router()
const auth = require('../middlewares/auth')
const authAdmin = require('../middlewares/authAdmin')
const uploadControll = require('../controllers/uploadControllers')


router.post('/image-upload', uploadControll.uploadImage)

router.post('/image-delete', uploadControll.deleteImage)



module.exports = router