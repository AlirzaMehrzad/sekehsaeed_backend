const companyModel = require('../models/companyModel')
const userModel = require('../models/userModel')
const bcrypt = require("bcrypt");

const companyControll = {
    getCompenies: async(req, res, next) =>{
        try {
            const categories = await categoryModel.find()
            res.send({categories})
        } catch (error) {
            next(error)
        }
    },

    createCompany: async(req, res, next) =>{
        try {
            const {companyName, mobile, expireDate, fname, lname, password} = req.body
            const company = await companyModel.findOne({mobile})
            if (company) {
                return res.status(400).send({message: 'برای این شماره همراه قبلا پنل ایجاد شده است'})
            }

            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!regex.test(password)) {
                return res.status(400).send({
                message:
                    "رمز عبور باید حداقل 8 کاراکتر باشد و شامل حروف کوچک و بزرگ و یک عدد و یک حرف و نکته خاص باشد",
                });
            }
            
            const newCompany = new companyModel({companyName, mobile, expireDate})
            await newCompany.save()

            const passwordHash = await bcrypt.hash(password, 10);

            const firstUser = new userModel({fname, lname, mobile, password: passwordHash})
            await firstUser.save()

            res.status(201).send({
                success: true,
                message: 'کسب و کار جدید اضافه شد'
            })

        } catch (error) {
            next(error)
        }
    },

    deleteCompany: async (req, res, next) => {
        try {
            await categoryModel.findByIdAndDelete(req.params.id)
            res.status(201).send({
                message: 'دسته بندی با موفقیت حذف شد'
            })
            
        } catch (error) {
            next(error)
        }
    },

    updateCompany: async (req, res, next) => {
        try {
          const {en_name , pe_name} = req.body
          await categoryModel.findOneAndUpdate({_id: req.params.id},{en_name},{pe_name})
          res.status(201).send({
              message: 'دسته بندی با موفقیت ویرایش شد'
          })
          
        } catch (error) {
            next(error)
        }
    }
}

module.exports = companyControll