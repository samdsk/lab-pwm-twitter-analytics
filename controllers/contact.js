const fetch = require('node-fetch')
const sendEmail = require('../utils/sendEmail')

const getContact = async (req,res,next) =>{
    res.render('pages/contact',{contact:true})
}

const postContact = async (req,res,next) =>{
    const {name,email,subject,message} = req.body
    const captcha = req.body['g-recaptcha-response']
    if(captcha){
        if(captcha != ''){
            const SECRET_KEY = process.env.CAPTCHA_SECRET;
            const VERIFY_URL = `https://google.com/recaptcha/api/siteverify`;

            // Make a request to verifyURL
            const body = await fetch(VERIFY_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `secret=${SECRET_KEY}&response=${captcha}`
              }).then(res => res.json());

            if (body.success !== undefined && !body.success)
                return res.json(JSON.stringify({ error: 'Failed captcha verification' }));

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
    }else{
        return res.json(JSON.stringify({ error: 'Invalid capture' }));
    }

}


module.exports = {getContact,postContact}