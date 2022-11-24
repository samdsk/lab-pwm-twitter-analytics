const express = require('express')
const app = express()
require('dotenv').config()
const db_connect = require('./db/connect')
const db_url = require('./db/db_params')

const signup = require('./routes/signup')
//const required_params = require('./middleware/required_params')
const login = require('./routes/login')

app.use(express.static(__dirname + '/public'))
app.use(express.json())
//app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))

app.set('view engine','ejs')

app.get('/',function(req,res){
    res.render('pages/index')

})

app.get('/about',function(req,res){
    res.render('pages/about')
})

app.get('/dashboard',function(req,res){
    res.render('pages/dashboard')
})


app.use('/signup',signup)
app.use('/login',login)

const start = async (connection_url) => {
    try{
        await db_connect(connection_url)
        app.listen(3000,()=> console.log('OK: Server is up and running at port:3000 '))
    }catch(err){
        console.log(`Error: ${err}`)
    }
}

start(db_url)
