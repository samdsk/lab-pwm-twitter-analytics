const recaptcha = require('../utils/recaptcha')
const sendEmail = require('../utils/sendEmail')

// render contact page
const getContact = async (req,res,next) =>{
    if(!req.session.username || !req.session.email)
        res.render('pages/contact',{contact:true})
    else
        res.render('pages/contact',{contact:true,logout:true})
}

// post message to webmaster
const postContact = async (req,res,next) =>{
    console.log("Contact: new message received.");

    const {name,email,subject,message} = req.body
    let catpcha = await recaptcha(req.body['g-recaptcha-response'])
    if(!catpcha) return res.json({error:"Invalid captcha!"})

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
        return res.json({success:"Your message has been sent!"})
    }).catch((err)=>{
        return res.json({error:"Failed to send message!"})
    })
}

module.exports = {getContact,postContact}