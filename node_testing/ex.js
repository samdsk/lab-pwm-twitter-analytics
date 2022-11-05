// const express = require('express')
// const app = express()

// app.get('/',(res,req) => {
//     res.send("Test")
// })

// var server = app.listen(()=>{
//     console.log(server.address())
// })

const person = {
    name : "Mario",
    surname : "Super",
    fun : function(cb){return cb()}
}

async function prova(p,c) {
    return p.fun(c)
}
function mycall(){
    console("inside callback "+test.name)
}
var test = prova(person,mycall)

console.log(test)

