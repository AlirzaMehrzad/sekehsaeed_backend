const router = require('express').Router()
const auth = require('../middlewares/auth')
const authAdmin = require('../middlewares/authAdmin')
const uploadControll = require('../controllers/uploadControllers')


router.post('/image-upload',auth, authAdmin, uploadControll.uploadImage)

router.post('/image-delete',auth, authAdmin, uploadControll.deleteImage)



module.exports = router