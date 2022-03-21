const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const usersControllers = require('../controllers/usersControllers')
const multer = require('multer')
const { storage, fileFilter} = require('../middlewares/uploadFile')

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 2
    },
    fileFilter: fileFilter
})


router.get('/' ,usersControllers.usersList)
router.post('/', upload.single('userImage') ,usersControllers.createUser)

router.get('/:id', usersControllers.getUser)
router.delete('/:id', usersControllers.deleteUser)
router.patch('/:id', usersControllers.updateUser)


module.exports = router