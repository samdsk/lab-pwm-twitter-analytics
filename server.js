require('dotenv').config()
const express = require('express')
const app = express()

// ===================== Middleware
require('express-async-errors')
const cookie_parser = require('cookie-parser')
const express_session = require('express-session')
const genid = require('genid')
const helmet = require('helmet')
const MongoStore = require('connect-mongo')(express_session)

// ===================== Modules

// importing DB modules
const db_connect = require('./db/connect')
const db_url = require('./db/db_params')

// importing routes
const signup = require('./routes/signup')
const login = require('./routes/login')
const dashboard = require('./routes/dashboard')
const twitter = require('./routes/twitter')
const results = require('./routes/results')
const forgot_psw = require('./routes/forgot_psw')
const reset_psw = require('./routes/reset_psw')
const contact = require('./routes/contact')

// ========= Custom Middleware
const auth_session = require('./middleware/auth_session')
const not_found = require('./middleware/not_found')
const error_handler = require('./middleware/error_handler')

// ===================== Port
const PORT = process.env.PORT || 3000

// ===================== Middlewares

// CSP rules
// reference -> https://helmetjs.github.io/

const script_src = [
    "'self'",
    "'unsafe-inline'",
    "*.popupsmart.com",
    "unpkg.com",
    "cdn.jsdelivr.net",
    "cdnjs.cloudflare.com",
    "code.jquery.com",
    "*.google.com",
    "*.gstatic.com",
    "'unsafe-hashes'"
]

const img_src = [
    "'self'",
    'data:',
    "pbs.twimg.com",
    '*.gravatar.com',
    "*.popupsmart.com",
]

app.use(helmet({
    contentSecurityPolicy:{
        useDefaults: true,
        directives : {
            "script-src":script_src,
            "img-src":img_src,
            "script-src-attr":["'self'","'unsafe-inline'"],
            "frame-src":["*.google.com"]
        },
    },
    crossOriginEmbedderPolicy: {policy: "credentialless"},
    crossOriginOpenerPolicy: {policy:"same-origin"},
}))

app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookie_parser())

// express session
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
        path:'/'
    },
    store: new MongoStore({
        url: db_url,
        autoRemove:'native'
    })

}))

// ===================== Render Engine EJS
app.set('view engine','ejs')


// ===================== Handling requests
app.get('/',function(req,res){
    if(!req.session.username || !req.session.email) return res.render('pages/index')
    else return res.redirect('/dashboard')
})

app.get('/about',function(req,res){
    if(!req.session.username || !req.session.email)
        res.render('pages/about',{about:true})
    else
        res.render('pages/about',{about:true,logout:true})
})

app.use('/dashboard',auth_session,dashboard)

app.use('/twitter',auth_session,twitter)
app.use('/results',auth_session,results)

app.use('/signup',signup)
app.use('/login',login)
app.use('/contact',contact)

app.get('/terms',function(req,res){
    if(!req.session.username || !req.session.email)
        res.render('pages/terms',{terms:true})
    else
        res.render('pages/terms',{terms:true,logout:true})
})

app.get('/logout',(req,res)=>{
    res.clearCookie('logout')
    req.session.destroy()
    res.redirect('/')
})

app.use('/forgot-password',forgot_psw)
app.use('/reset-password',reset_psw)

app.use(not_found)
app.use(error_handler)

// ===================== Start Server
// connecting to db and starting the server
const start = async (connection_url) => {
    try{
        await db_connect(connection_url)
        app.listen(PORT,()=> console.log('OK: Server is up and running at port',PORT))
    }catch(err){
        console.log(`Error: ${err}`)
    }
}

start(db_url)
