const express = require('express')
const app = express()

app.set('view engine','ejs')

app.get('/',function(req,res){
    res.sendStatus(200)

})

app.listen(3000)

