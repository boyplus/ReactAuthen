const redis = require("redis");
const bluebird = require("bluebird");
require('dotenv').config()

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
let redisClient

if(process.env.NODE_ENV == 'jest' || process.env.NODE_ENV == 'dev'){
    redisClient = redis.createClient()
}
else {
    redisClient = redis.createClient(6380, process.env.REDISCACHE_HOST, {
        auth_pass: process.env.REDISCACHE_KEY,
        tls: { servername: process.env.REDISCACHE_HOST }
    })
}

module.exports = redisClient