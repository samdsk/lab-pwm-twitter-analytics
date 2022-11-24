require("dotenv").config()

const password = encodeURIComponent(process.env.Db_Password)
const username = process.env.Db_Username
const cluster = process.env.Db_Cluster
const db_name_auth = process.env.Db_Name_Auth
const db_name = ""

const connectionString =  
 `mongodb+srv://${username}:${password}@${cluster}/${db_name}?retryWrites=true&w=majority`

    

module.exports = connectionString