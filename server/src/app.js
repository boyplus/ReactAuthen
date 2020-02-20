const express = require('express')
const router = require('./routes/router')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express();

if(process.env.NODE_ENV != 'jest'){
  const connection_string = `mongodb+srv://admin:${process.env.ATLAS_PASSWORD}@cluster0-eozim.gcp.mongodb.net/test?retryWrites=true&w=majority`
  mongoose.connect(connection_string, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false
  })
}


app.use(cors({
  exposedHeaders: ['Content-Type','Date','token'],
}))
app.use(bodyParser.json())
router(app)

module.exports = app