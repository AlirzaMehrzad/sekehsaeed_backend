const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userControll = {
    register: async (req, res, next) =>{
        try {
            const {fname,lname,mobile,password,email} = req.body
            // const userImage = req.file.path
            if(fname === undefined|| lname === "" || lname === ""){
                return res.status(422).send({
                    error: true,
                    data:{
                        message: 'اطلاعات ارسالی معتبر نیست'
                    }
                    
                })
            }
            // validation
            const uniqueMobile = await userModel.findOne({mobile})
            if(uniqueMobile){
                return res.status(400).send({
                    message: 'شماره تلفن قبلا ثبت شده است'
                })
            }
    
            if(password.length < 8){
                return res.status(400).send({
                    message:'پسورد باید حداقل دارای 8 کاراکتر باشد'
                })
            }
            // security
            const passwordHash = await bcrypt.hash(password, 10)
            
            const newUser = new userModel({
                fname,
                lname,
                mobile,
                password: passwordHash,
                email,
                // userImage
            })

            await newUser.save()

            const accesstoken = creatAccessToken({id: newUser._id})         
            const refreshtoken = createRefreshToken({id: newUser._id})
            res.cookie('refreshtoken', refreshtoken, {
                path: '/api/v1/user/refresh_token'
            })

            res.status(201).send({
                success: true,
                message: 'کاربر جدید با موفقیت ایجاد شد',
                token: accesstoken,
                data:{
                    newUser
                }
                
            })
        } 
        catch (error) {
            next(error)
        }
    },

    login: async (req, res, next) => {
        try {
            const {mobile, password} = req.body
            const user = await userModel.findOne({mobile})
            if (!user) {
                return res.status(400).send({
                    message: 'کاربر وجود ندارد'
                })
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).send({
                    message: 'پسورد اشتباه است'
                })
            }

            
            // if login successful, create access token and refresh token
            const accesstoken = creatAccessToken({id: user._id})         
            const refreshtoken = createRefreshToken({id: user._id})
            res.cookie('refreshtoken', refreshtoken, {
                path: '/api/v1/user/refresh_token'
            })

            res.status(201).send({
                success: true,
                message: 'بله! ورود موفقیت آمیز',
                token: accesstoken
            })

        } catch (error) {
            next(error)
        }
    },

    refreshtoken: (req, res, next) => {
        try {
           const rf_token = req.cookies.refreshtoken
           if(!rf_token){
               return res.status(400).send({
                error:true,
                message: 'لطفا وارد حساب کاربری شوید یا ثبت نام کنید'
               })
           }

           jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
               if(err){
                   return res.status(400).send({
                       error:true,
                       message: 'لطفا وارد حساب کاربری شوید یا ثبت نام کنید'
                   })
               }
               const accesstoken = creatAccessToken({id: user.id})
               res.status(201).send({accesstoken})
           })

        } catch (error) {
            return res.status(404).send({
                error:true, message:'token not refreshed'
            })
        }

        res.status(201).send({
            message: rf_token
        })
    }
} 

const usersList = async (req, res, next) => {
    let projection = {}
    if (req.query.hasOwnProperty('fields')) {
        projection = req.query.fields.split(',').reduce((total, current) => {
            return {[current]:1,...total}
        },{})
    }
    // http://localhost:3334/api/v1/users?fields=first_name
    const users = await userModel.find({},projection)
    res.status(201).send({
        success: true,
        message: "نمایش لیست کاربران با موفقیت انجام شد",
        info: users
  
    })
}


const getUser = async (req, res, next) => {

    try {

        const {id} = req.params

        if(!id){
            return res.status(404).send({error:true, message:'no user found'})
        }

        const user = await userModel.findOne({_id:id})
        
        if(!user){
            return res.status(404).send({error:true, message:'no user found'})
        }

        return res.send({
            success:true,
            data:{
                user
            }
        })
    }

     catch (error) {
        next(error)
    }
}

const deleteUser = async (req, res, next) =>{
   try {
    const {id} = req.params

    if(!id){
        return res.status(404).send({error:true, message:'no user found'})
    }
    await userModel.deleteOne({_id:id})
    res.send({
        success: true,
        message: 'deleted successfully'
    })

   } catch (error) {
       next(error)
   } 
}

const updateUser = async (req, res, next) => {
    try {
        const {id} = req.params

        if(!id){
            return res.status(404).send({error:true, message:'no user found'})
        }

        const {n, nModified} = await userModel.updateOne({_id:id},{...req.body})
        if (n ===0 || nModified ===0) {
            throw new Error('not ok to update')
        }
        res.send({
            success: true,
            message: 'updated successfully'
        })
    } catch (error) {
        next(error)
    }
}


const creatAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
}

const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

module.exports = userControll