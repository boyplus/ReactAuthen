const User = require('../models/user')
const Stock = require('../models/stock')
const { generateJWT } = require('../utils/jwt-auth')
const bcrypt = require('bcryptjs')
const redisClient = require('../utils/redis-client')

const createUser = async (req, res, next) => {
    try{
        const userProps = req.body
        const existingUser = await User.findOne({ email: userProps.email })
        if(existingUser) return res.status(400).send('User is already exist')
        const user = await User.create(userProps)
        const token = generateJWT(user._id)
        await redisClient.setexAsync(user._id.toString(), 300, JSON.stringify(user))
        res.set('token', token).status(201).send(user)
    }
    catch(err){
        console.log(err);
        res.status(500).send(err)
    }
}

const signInUser = async (req, res, next) =>{
    try{
        const userProps = req.body
        const user = await User.findOne({ email: userProps.email }).populate('stocks.stock')
        const match = await bcrypt.compare(userProps.password, user.password)
        if(match){
            const token = generateJWT(user._id)
            await redisClient.setexAsync(user._id.toString(), 300, JSON.stringify(user))
            res.set('token', token).send(user)
        }
        else res.status(401).send("Wrong username and password")
    }
    catch(err){
        res.status(500).send(err)
    }
}

const getUser = async (req, res, next) => {
    try{
        const sub = req.sub
        const cached = await redisClient.getAsync(sub)
        let user
        if(cached){
            user = JSON.parse(cached)
        }
        else {
            user = await User.findById(sub).populate('stocks.stock')
            await redisClient.setexAsync(sub, 300, JSON.stringify(user))
        }
        //user = await User.findById(sub).populate('stocks.stock')
        res.send(user)
    }
    catch(err){
        res.status(500).send(err)
    }
}

const buyStock = async (req, res, next) => {
    try{
        const sub = req.sub
        const user = await User.findById(sub).populate('stocks.stock')
        //Find stock in redis cache
        const stockCache = await redisClient.getAsync(req.body.stockID)     
        let targetStock
        if(stockCache) targetStock = JSON.parse(stockCache)
        else {
            targetStock = await Stock.findById(req.body.stockID)
            await redisClient.setAsync(targetStock._id.toString(), JSON.stringify(targetStock))
        }
        user.funds = user.funds - (req.body.quantity * targetStock.price)
        //search if the stock is alreay exist
    
        let added = false;
        user.stocks.forEach(element => {
            if(element.stock._id  == req.body.stockID){
                element.quantity = element.quantity + req.body.quantity
                added = true
            }
        });
        if(!added){
            user.stocks.push({
                stock: targetStock._id,
                quantity: req.body.quantity
            })
        }
        const updatedUser = await user.save()
        await redisClient.setexAsync(updatedUser._id.toString(), 300, JSON.stringify(updatedUser))
        res.send(updatedUser)
    }
    catch(err){
        res.status(500).send(err)
    }

    
}

const sellStock = async (req, res, next) => {
    try{
        const sub = req.sub
        let user = await User.findById(sub).populate('stocks.stock')
        const targetStock = await Stock.findById(req.body.stockID)

        user.stocks.find((ele, index) => {
            if(ele.stock._id == req.body.stockID){
                user.stocks[index].quantity -= req.body.quantity
                if(user.stocks[index].quantity < 0) user.stocks[index].quantity =0
                return true
            }
        })
        user.funds += (targetStock.price * req.body.quantity)

        await user.save()
        await redisClient.setexAsync(user._id.toString(), 300, JSON.stringify(user))
        res.send(user)

    }
    catch(err){
        res.status(500).send(err)
    }
    
}

const getOwnedStock = async (req, res, next) => {
    try{
        const sub = req.sub
        const cached = await redisClient.getAsync(sub)
        let user
        if(cached) user = JSON.parse(cached)
        else user = await User.findById(sub).populate('stocks.stock')
        res.send(user.stocks)
    }
    catch(err){
        res.status(500).send(err)
    }

}




module.exports = {
    createUser,
    signInUser,
    getUser,
    getOwnedStock,
    buyStock,
    sellStock
}


