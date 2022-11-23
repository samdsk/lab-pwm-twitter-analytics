require("dotenv").config()

const password = encodeURIComponent(process.env.Db_Password)
const username = process.env.Db_Username
const cluster = process.env.Db_Cluster
const connectionString = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`

module.exports = connectionString

