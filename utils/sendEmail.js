const nodemailer = require('nodemailer')

// sends email using nodemailer
// requires: mail_option object
module.exports = async function (mail_opt){
    return new Promise((resolve,reject)=>{
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.EMAIL,
                pass:process.env.EMAIL_PSW
            }
        })

        transporter.sendMail(mail_opt,function(err,data){
            if(err){
                console.log("Nodemailer: ",err)
                return reject(err)
            }

            return resolve(true)
        })
    })

}
