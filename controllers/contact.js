const fetch = require('node-fetch')

const getContact = async (req,res,next) =>{
    res.render('pages/contact',{logout:true})
}

const postContact = async (req,res,next) =>{
    console.log(req.body);

    if(req.body['g-recaptcha-response']){
        let captcha = req.body['g-recaptcha-response']
        if(captcha != ''){
            const SECRET_KEY = '6LelT0olAAAAACKtedp_dGhG0ge714942Nik1-Sn';
            const VERIFY_URL = `https://google.com/recaptcha/api/siteverify`;

              // Make a request to verifyURL
            const body = await fetch(VERIFY_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `secret=${SECRET_KEY}&response=${req.body['g-recaptcha-response']}`,
              }).then(res => res.json());

            console.log(body);
            if (body.success !== undefined && !body.success)
                return res.json(JSON.stringify({ error: 'Failed captcha verification' }));

            return res.json(JSON.stringify({success:"Your message has been sent!"}))
        }
    }

    return res.json(JSON.stringify({ error: 'Invalid capture' }));
}


module.exports = {getContact,postContact}