// 404 message
const not_found = (req,res) => {
    res.status(404).send("404 - These are uncharted waters...")
}

module.exports = not_found