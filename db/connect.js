const mongoose = require('mongoose')
mongoose.set('strictQuery', true)

const connectDB = (db_connection_url) => {
    return mongoose.connect(db_connection_url).then(()=>console.log('OK: successfully connected to db')).catch((e)=>console.log(e) )
}

module.exports = connectDB