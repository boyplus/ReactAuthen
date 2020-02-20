const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const Stock = require('./stock')

const StockOwnSchema = new Schema({
    stock:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stock'
    },
    quantity:{
        type: Number,
        default: 0
    }
})

const UserSchema = new Schema({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    funds:{
        type: Number,
        default: 50000
    },
    stocks:[StockOwnSchema]
})

UserSchema.pre('save', async function (){
    const user = this
    if(user.isModified('password')){
        const hash = await bcrypt.hash(user.password, 10)
        user.password = hash
    }
    if(user.isNew){
        const allStock = await Stock.find()
        allStock.forEach(ele => {
            user.stocks.push({
                quantity: 0,
                stock: ele._id
            })
        })
    }
})


const User = mongoose.model('user', UserSchema)

module.exports = User