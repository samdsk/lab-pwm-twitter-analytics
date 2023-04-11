const fetch = require('node-fetch')

const recaptcha = async(captcha)=>{
    if(!captcha || captcha == '') return false

    const SECRET_KEY = process.env.CAPTCHA_SECRET;
    const VERIFY_URL = `https://google.com/recaptcha/api/siteverify`;

    // Make a request to verifyURL
    const body = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${SECRET_KEY}&response=${captcha}`
    }).then(res => res.json());

    if(!body.success) return false
    return true
}

module.exports = recaptcha