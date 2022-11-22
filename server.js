const express = require('express')
const app = express()
require('dotenv').config()


app.use(express.static(__dirname + '/public'))

app.set('view engine','ejs')

app.get('/',function(req,res){
    res.render('pages/index')

})

app.get('/signup',function(req,res){
    res.render('pages/singup')
})

app.get('/about',function(req,res){
    res.render('pages/about')
})


app.get('/dashboard',function(req,res){
    res.render('pages/dashboard')
})

app.listen(3000)

