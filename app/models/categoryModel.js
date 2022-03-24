const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({
    en_name:{type: String, require: true, trim: true, unique: true},
    pe_name:{type: String, require: true}
    
}, {
    timestamps: true
})

module.exports = mongoose.model("Category", categorySchema)