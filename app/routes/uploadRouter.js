const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '../uploads/pics');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const upload = multer({ storage: storage });

const router = require('express').Router()
const auth = require('../middlewares/auth')
const authAdmin = require('../middlewares/authAdmin')
const uploadControll = require('../controllers/uploadControllers')


router.post('/image_upload', upload.any(), uploadControll.uploadImage)

router.post('/image_delete', uploadControll.deleteImage)



module.exports = router