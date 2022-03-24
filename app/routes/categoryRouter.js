const  router = require('express').Router()
const categoryControll = require('../controllers/categoryControllers')
const auth = require('../middlewares/auth')
const authAdmin = require('../middlewares/authAdmin')


router.route('/')
    .get(categoryControll.getCategories)
    .post(auth, authAdmin, categoryControll.createCategory)

module.exports = router