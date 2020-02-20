const Stock = require('../models/stock')
const User = require('../models/user')
const redisClient = require('../utils/redis-client')

const createStock = async (req, res, next) => {
    try {
        const stockProps = req.body
        const stock = await Stock.create(stockProps)
        await redisClient.setAsync(stock._id.toString(), JSON.stringify(stock))
        res.send(stock)
    } catch (err) {
        res.status(500).send(err)
    }
    
}

const getAllStocks = async (req, res, next) => {
    try{
        const stocks = await Stock.find()
        res.send(stocks)
    }
    catch(err){
        res.status(500).send(err)
    }
}

const getStock = async (req, res, next) => {
    try{
        const cached = await redisClient.getAsync(req.body.stockID)
        let stock
        if(cached) stock = JSON.parse(cached)
        else stock = await Stock.findById(req.body.stockID)
        res.send(stock)
    }
    catch(err){
        res.status(500).send(err)
    }
}

const randomStockPrice = (price) => {
    const addOrSub = Math.random()
    const random = Math.ceil((((Math.random() * 30) +1)/100 * price))
    if(addOrSub >= 0.3){
        return price + random
    }
    if(price - random <= 3) return price + random
    return price - random
}

const endDay = async (req, res, next) => {
    try{
        const sub = req.sub
        const stocks = await Stock.find()
        stocks.forEach(async (stock) => {
            stock.price = randomStockPrice(stock.price)
            const updatedStock = await stock.save()
            await redisClient.setAsync(updatedStock._id.toString(), JSON.stringify(updatedStock))
        })
        const user = await User.findById(sub).populate('stocks.stock')
        //redisClient.SETEX(user._id.toString(), 300, JSON.stringify(user))
        res.send(user.stocks)
        
    }
    catch(err){
        res.status(500).send(err)
    }
}


module.exports = {
    createStock,
    getAllStocks,
    getStock,
    endDay
}