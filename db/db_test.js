const Auth = require('../models/Auth')
const User = require('../models/User')
const mongoose = require('mongoose')
require('dotenv').config()
const db_connect = require('./connect')
const db_url = require('./db_params')


const db_Test = async () => {
    console.log("starting db test")
    try{
        await db_connect(db_url).then(()=>{
            console.log("connected")

            const auth = new Auth({
                _id: new mongoose.Types.ObjectId,
                email:"test@test.com",
                password:"asdasdasd"
            })

            Auth.create(auth).then(()=>{
                console.log("db_test: auth done")

                const user = new User({
                    _id: auth.id,
                    name: "Test name"
                })

                User.create(user).then(()=>{
                    console.log("db_test: user done")
                    User.findOne({_id:auth._id}).populate('name').exec((err,u)=>{
                        if(err) return console.log(err)
                        console.log(u)
                    })
                })
            })

            
            
        })
        
    }catch(err){
        console.log(`Db test : Error: ${err}`)
    }
}

db_Test()