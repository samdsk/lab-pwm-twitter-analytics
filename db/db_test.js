const Auth = require('../models/Auth')
const User = require('../models/User')
const mongoose = require('mongoose')
require('dotenv').config()
const db_connect = require('./connect')
const db_url = require('./db_params')

const {MongoClient} = require("mongodb")

const delete_sessions = async () => {
    const client = new MongoClient(db_url, { useUnifiedTopology: true })
    await client.connect()
    try {
        const db = await client.db('Twitter_Analytics')
        const sessions = await db.collection('sessions')

        const res = await sessions.deleteMany();
        console.log("Deleted " + res.deletedCount + " documents");
    } catch (error) {
        console.log("Error: ",error)
    }finally{
        await client.close();
    }
}


const db_Test = async () => {
    console.log("starting db test")

    // try{
    //     await db_connect(db_url).then( async()=>{
    //         console.log("connected")
    //         try {
    //

    //         } catch (error) {
    //             console.log(error);
    //         }


    //         process.exit(0)

    //     })

    // }catch(err){
    //     console.log(`Db test : Error: ${err}`)
    // }
}

db_Test()


const test_delete_all = () => {
    Auth.deleteMany()
    User.deleteMany()
    console.log("cleaned the db");

}

async function test_find(){
    const r = await Auth.find({}).exec()
    console.log('eh beh?')
    console.log(r);
}

const test_create_populate = ()=>{
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
}