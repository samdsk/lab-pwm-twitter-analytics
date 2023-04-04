const recaptcha = require('../utils/recaptcha')
const sendEmail = require('../utils/sendEmail')

const getContact = async (req,res,next) =>{
    if(!req.session.username || !req.session.email)
        res.render('pages/contact',{contact:true})
    else
        res.render('pages/contact',{contact:true,logout:true})

}

const postContact = async (req,res,next) =>{
    const {name,email,subject,message} = req.body
    let catpcha = await recaptcha(req.body['g-recaptcha-response'])
    if(!catpcha) return res.json(JSON.stringify({error:"Invalid captcha!"}))

    const mail_opt = {
        from:name+" : "+email,
        to:process.env.EMAIL,
        subject:name+" "+subject,
        text:`message from ${name}
            email: ${email}
            subject:${subject}:
            message:${message}`,
        html:`
            <h4 class="h4">Contact form</h4>
            <h5 class="h5">Name: ${name} Email: ${email}</h5>
            <h5 class="h5">Subject: ${subject}</h5>
            <p>Message: ${message}</p>
            `
    }

    await sendEmail(mail_opt).then(()=>{
        return res.json(JSON.stringify({success:"Your message has been sent!"}))
    }).catch((err)=>{
        return res.json(JSON.stringify({error:"Failed to send message!"}))
    })
}


module.exports = {getContact,postContact}