require('dotenv').config()
//require('express-async-errors')

const express = require('express')
const app = express()

const cookie_parser = require('cookie-parser')

//importing project modules
const db_connect = require('./db/connect')
const db_url = require('./db/db_params')
const signup = require('./routes/signup')
const login = require('./routes/login')

const auth = require('./middleware/auth')

const not_found = require('./middleware/not_found')
const error_handler = require('./middleware/error_handler')

//port
const PORT = process.env.PORT || 3000

//middlewares
app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookie_parser())

//setting render engine ejs
app.set('view engine','ejs')

//handling requests
app.get('/',function(req,res){
    res.render('pages/index')
})

app.get('/about',function(req,res){
    res.render('pages/about')
})

app.get('/dashboard',auth,function(req,res){
    res.render('pages/dashboard')
})

app.use('/signup',signup)
app.use('/login',login)

//todo
app.use('/logout',login)

app.use(not_found)
app.use(error_handler)

//conecting to db and starting the server
const start = async (connection_url) => {
    try{
        await db_connect(connection_url)
        app.listen(PORT,()=> console.log('OK: Server is up and running at port:3000 '))
    }catch(err){
        console.log(`Error: ${err}`)
    }
}

start(db_url)
