const productModel = require('../models/productModel')

const productControll = {
    getProducts: async (req, res) => {
        try {
            const products = await productModel.find()
            res.status(201).send({products})
        } catch (error) {
            return res.status(500).send({err: error.message})
        }
    },

    createProducts: async (req, res) => {
        try {
            
            const {product_id, title, price, description, content, images, category} = req.body
            if (!images) {
                return res.status(400).send({message: 'تصویری برای محصول آپلود کنید'})
            
            }

            const product = await productModel.findOne({product_id})
            if (product) {
                return res.status(400).send({message: 'این محصول قبلا وجود دارد'})
            }

            const newProduct = new productModel({
                product_id, 
                title, 
                price, 
                description, 
                content, 
                images, 
                category
            })

            await newProduct.save()
            res.status(201).send({
                message: 'محصول با موفقیت اضافه شد',
                data: {newProduct}
            })
            

        } catch (error) {
            return res.status(500).send({err: error.message})
        }
    },

    deleteProducts: async (req, res) => {
        try {
            
        } catch (error) {
            return res.status(500).send({err: error.message})
        }
    },

    updateProducts: async (req, res) => {
        try {
            
        } catch (error) {
            return res.status(500).send({err: error.message})
        }
    }
}

module.exports = productControll