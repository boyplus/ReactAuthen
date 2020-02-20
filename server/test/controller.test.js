const request = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const User = require('../src/models/user')
const Stock = require('../src/models/stock')
const jwt = require('jsonwebtoken')
const SECRET = 'secretwithplaceholder'
const mongoose = require('mongoose')
const { generateJWT } = require('../src/utils/jwt-auth')
let token, stock_F, stock_G, testUser
const redisClient = require('../src/utils/redis-client')
require('dotenv').config()

beforeAll( async (done) => {
    //const connection_string = `mongodb+srv://admin:${process.env.ATLAS_PASSWORD}@cluster0-eozim.gcp.mongodb.net/jest?retryWrites=true&w=majority`
    const connection_string = `mongodb://localhost:27017/stock-test`
    mongoose.connect(connection_string, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    mongoose.connection.once('open', async () => {
        //Create Test Stock
        stock_F = await Stock.create({
            name: 'Facebook',
            price: 50
        })
        stock_G = await Stock.create({
            name: 'Google',
            price: 100
        })

        //Create Tets user
        testUser = await User.create({
            email: 'test@test.com',
            password: 'password'
        })
        token = generateJWT(testUser._id)
        done()
    })
    .on('error', err => {
        console.log('Warnning' + err)
        done()
    })
})

afterAll(async (done) => {
    const { users, stocks } = mongoose.connection.collections
    try{
        //console.log(mongoose.connection.collections);
        await stocks.drop()
        await users.drop()
        mongoose.disconnect()
        redisClient.end(true)
        done()
    }
    catch(err){
        console.log(err) 
        done()
    }
});

describe('User Controller TEST', () => {
    it('should signUp an user', async (done) => {
        try{
            const res = await request(app)
            .post('/api/signup')
            .send({
                email: "signin@test.com",
                password: "password"
            })
            const user = await User.findOne({ email: "signin@test.com" })
            expect(user.email).toBe('signin@test.com')
            expect(user.funds).toBe(50000)
            expect(await bcrypt.compare("password", user.password)).toBe(true)
            done()
        }
        catch(err){
            console.log(err);
            done()
        }
        
    })

    it('should not signup existing user', async (done) => {
        const res = await request(app).post('/api/signup').send({
            email: testUser.email,
            password: 'password'
        })
        expect(res.status).toBe(400)
        done()
    })

    it('should signin the user', async (done) => {
        const res = await request(app).post('/api/signin').send({
            email: 'test@test.com',
            password: 'password'
        })
        const decoded = jwt.verify(res.header.token, SECRET)
        const user = await User.findById(decoded.sub)
        expect(user.email).toBe('test@test.com')
        expect(decoded.exp - decoded.iat).toBe(3600)
        expect(decoded.iss).toBe('stocks-server')
        //token = res.header.token
        done()
    })

    it('should not signin the user', async (done) => {
        const res = await request(app).post('/api/signin').send({
            email: 'test@test.com',
            password: 'somewrongpassword'
        })
        expect(res.status).toBe(401)
        done()
    })

    it('should get user infomation', async done => {
        const res = await request(app).get('/api/user').set('token', token)
        expect(res.body.email).toBe('test@test.com')
        done()
    })

    it('should get user stocks own', async (done) => {
        const res = await request(app).get('/api/user/stock').set('token', token).set('Accept', 'application/json')
        expect(res.body[0].stock.name).toBe('Facebook')
        expect(res.body[1].quantity).toBe(0)
        done()
    });

    it('should buy stocks for user', async (done) => {
        await request(app).post('/api/user/stock').set('token', token).send({
            "stockID": stock_F._id,
	        "quantity": 100
        })
        await request(app).post('/api/user/stock').set('token', token).send({
            "stockID": stock_F._id,
	        "quantity": 50
        })
        const user = await User.findById(testUser._id).populate('stocks.stock')
        expect(user.stocks[0].stock.name).toBe('Facebook')
        expect(user.stocks[0].quantity).toBe(150)
        expect(user.funds).toBe(50000 - (150*stock_F.price))
        done()
    })

    it('should sell stocks for user', async (done) => {
        await request(app).put('/api/user/stock').set('token', token).send({
            stockID: stock_F._id,
            quantity: 25
        })
        const user = await User.findById(testUser._id).populate('stocks.stock')
        expect(user.stocks[0].quantity).toBe(125)
        expect(user.funds).toBe(50000 - (150*stock_F.price) + (25*stock_F.price))
        done()
    })
});

describe('Stock Controller TEST', () => {
    it('should create new stock', async (done) => {
         await request(app).post('/api/stock').send({
            name: 'Apple',
            price: 300
        })
        const stock = await Stock.findOne({ name: 'Apple' })
        expect(stock.name).toBe('Apple')
        expect(stock.price).toBe(300)
        done()
    })

    it('should get all stocks in db', async (done) => {
        const stocks = await request(app).get('/api/allstocks').set('token', token)
        expect(stocks.body[0].name).toBe('Facebook')
        expect(stocks.body[2].name).toBe('Apple')
        expect(stocks.body[2].price).toBe(300)
        done()
    })

    it('should endday and random new price for stocks', async (done) => {
        await request(app).put('/api/stock').set('token', token)
        const stocks = await Stock.find()
        expect(stocks[0].name).toBe('Facebook')
        expect(stocks[0].price).not.toBe(50)
        expect(stocks[1].price).not.toBe(100)
        done()
    })
});