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


// router.get('/userslist' ,usersControllers.usersList)
router.post('/register' ,usersControllers.register)
router.post('/login' ,usersControllers.login)
router.get('/refresh_token' ,usersControllers.refreshtoken)

// router.get('/:id', usersControllers.getUser)
// router.delete('/:id', usersControllers.deleteUser)
// router.patch('/:id', usersControllers.updateUser)


module.exports = router