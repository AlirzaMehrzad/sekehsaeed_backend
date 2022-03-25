const router = require('express').Router()
const cloudinary = require('cloudinary')
const auth = require('../middlewares/auth')
const authAdmin = require('../middlewares/authAdmin')
const fs =require('fs')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})
// upload image
router.post('/image-upload',auth, authAdmin, (req, res) => {
    try {
        // console.log(req.files);
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send({message: 'هیچ فایلی آپلود نشد'})
        }
        const file = req.files.file
        if (file.size > 1024*1024) {
            removeTmp(file.tempFilePath)
            return res.status(400).send({message: 'حجم فایل آپلودی نباید بیشتر از یک مگابایت باشد'})
        }
        if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg') {
            removeTmp(file.tempFilePath)
            return res.status(400).send({message: 'فرمت عکس صحیح نیست'})
        }

        cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "test"}, async(error, result) =>{
            if (error) {
                throw error
            }
            removeTmp(file.tempFilePath)
            res.send({message: 'تصویر آپلود شد', public_id: result.public_id, url: result.secure_url})
        })

    } catch (error) {
        return res.status(500).send({err: error.message})
    }
})

//delete image
router.post('/image-delete',auth, authAdmin, (req, res) =>{
    try {
        const {public_id} = req.body
        if (!public_id) {
            return res.status(400).send({message: 'عکسی انتخاب نشده است'})
        }
        cloudinary.v2.uploader.destroy(public_id, async(err, result) =>{
           return res.status(201).send({message: 'تصویر حذف شد'}) 
        })

    } catch (error) {
        res.status(500).send({err: error.message})
    }
})

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if (err) {
            throw err
        }
    })
}

module.exports = router