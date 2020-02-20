const userController = require('../controllers/user_controller')
const stockController = require('../controllers/stock_controller')
const jwtAuth = require('../utils/jwt-auth')
const cors = require('cors')

const router = (app) => {
    app.options('/api/user/stock', cors())
    app.options('/api/stock', cors())

    app.get('/', (req, res) =>{
        res.send('hello')
    })

    app.get('/api/test', jwtAuth.verifyJWT, (req, res) => {
        res.send(req.sub)
    })

    app.post('/api/signup', userController.createUser)

    app.post('/api/signin', userController.signInUser)

    app.get('/api/user', jwtAuth.verifyJWT, userController.getUser)


    app.get('/api/user/stock', jwtAuth.verifyJWT, userController.getOwnedStock)

    app.post('/api/user/stock', jwtAuth.verifyJWT, userController.buyStock)
    
    app.put('/api/user/stock', cors(), jwtAuth.verifyJWT, userController.sellStock)


    app.get('/api/allstocks', jwtAuth.verifyJWT, stockController.getAllStocks)

    app.get('/api/stock', jwtAuth.verifyJWT, stockController.getStock)

    app.post('/api/stock', stockController.createStock)
    
    app.put('/api/stock', cors(), jwtAuth.verifyJWT, stockController.endDay)

    
}

module.exports = router