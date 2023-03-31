const getContact = async (req,res,next) =>{
    res.render('pages/contact',{logout:true})
}
const postContact = async (req,res,next) =>{

}


module.exports = {getContact,postContact}