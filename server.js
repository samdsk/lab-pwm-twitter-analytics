require('dotenv').config()
//require('express-async-errors')

const express = require('express')
const app = express()

const cookie_parser = require('cookie-parser')
const express_session = require('express-session')
//const cookie_signature = require('cookie-signature')
const genid = require('genid')
const helmet = require('helmet')
const MongoStore = require('connect-mongo')(express_session)


//importing project modules
const db_connect = require('./db/connect')
const db_url = require('./db/db_params')
const signup = require('./routes/signup')
const login = require('./routes/login')
const dashboard = require('./routes/dashboard')

const auth_session = require('./middleware/auth_session')
const not_found = require('./middleware/not_found')
const error_handler = require('./middleware/error_handler')


//port
const PORT = process.env.PORT || 3000

//middlewares
app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(helmet())
app.use(cookie_parser())

app.use('/',express_session({
    name:process.env.Session_name,
    secret:process.env.Session_secret,
    resave:false,
    saveUninitialized:true,
    genid: function(req){
        return genid()
    },
    cookie:{
        httpOnly:true,
        secure:false,
        sameSite:true,
        path:'/'
    },
    store: new MongoStore({
        url: db_url
    })

}))
//setting render engine ejs
app.set('view engine','ejs')

//handling requests
app.get('/',function(req,res){
    res.render('pages/index')
})

app.get('/about',function(req,res){
    res.render('pages/about')
})

app.use(/^\/dashboard.*/,auth_session,dashboard)
//app.use(,(req,res)=>{

app.use('/signup',signup)
app.use('/login',login)

app.get('/logout',(req,res)=>{
    res.clearCookie('logout')    
    req.session.destroy()
    res.redirect('/')
})

app.use(not_found)
app.use(error_handler)

// connecting to db and starting the server
const start = async (connection_url) => {
    try{
        await db_connect(connection_url)
        app.listen(PORT,()=> console.log('OK: Server is up and running at port:3000 '))
    }catch(err){
        console.log(`Error: ${err}`)
    }
}

start(db_url)
