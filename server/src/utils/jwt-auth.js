const jwt = require('jsonwebtoken')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const SECRET = 'secretwithplaceholder'

module.exports = {
    generateJWT(userID){
        const payload = {
            sub: userID
        }

        const token = jwt.sign(payload, SECRET, {
            algorithm: 'HS256',
            issuer: 'stocks-server',
            expiresIn: '1h'
        })
        return token
    },

    async verifyJWT(req, res, next){
        try{
            const token = req.headers.token
            const decoded = jwt.verify(token, SECRET, {
             algorithms: ['HS256'],
             issuer: 'stocks-server'
            })
            req.sub = decoded.sub
            next()
        }
        catch(err){
            res.status(401).send({ error: err.message})
        }
        
    }

}