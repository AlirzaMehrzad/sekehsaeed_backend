const categoryModel = require('../models/categoryModel')

const categoryControll = {
    getCategories: async(req, res, next) =>{
        try {
            const categories = await categoryModel.find()
            res.send({categories})
        } catch (error) {
            next(error)
        }
    },

    createCategory: async(req, res, next) =>{
        try {
            const {en_name, pe_name} = req.body
            const category = await categoryModel.findOne({en_name})
            if (category) {
                return res.status(400).send({message: 'این دسته بندی از قبل وجود دارد'})
            }
            const newCategory = new categoryModel({en_name, pe_name})
            await newCategory.save()
            res.status(201).send({
                success: true,
                message: 'دسته بندی جدید ایجاد شد'
            })

        } catch (error) {
            next(error)

        }
    },

    deleteCategory: async (req, res, next) => {
        try {
            await categoryModel.findByIdAndDelete(req.params.id)
            res.status(201).send({
                message: 'دسته بندی با موفقیت حذف شد'
            })
            
        } catch (error) {
            next(error)
        }
    },

    updateCategory: async (req, res, next) => {
        try {
          const {en_name , pe_name} = req.body
          await categoryModel.findOneAndUpdate({id: req.params.id},{en_name},{pe_name})
          res.status(201).send({
              message: 'دسته بندی با موفقیت ویرایش شد'
          })
          
        } catch (error) {
            next(error)
        }
    }
}

module.exports = categoryControll