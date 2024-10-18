var nodemailer = require('nodemailer');

var email = process.env.MAILER_EMAIL_ID || 'abb8@mazosol.com';
var pass = process.env.MAILER_PASSWORD || 'Abb8@mazo';
var smtpTransport = nodemailer.createTransport({
    host: "smtpout.secureserver.net",  
    secure: true,
    secureConnection: false,
    tls: {
        ciphers:'SSLv3'
    },
    requireTLS:true,
    port: 465,
    debug: true,
  auth: {
    user: email,
    pass: pass
  }
});

// const registerHtml = `<html><head><title>Register Successful</title></head><body><div><h3>Dear ${user.fname} ${user.lname},</h3><p>We have created your login to Neural Front application. Kindly use below credentials to login to the application <br><br> User ID: ${user.email} <br/> Password: ${user.password} <br><br>https://www.neuralfront.com<br><br>Please change the password when you first login to the application <br><br> Thanks, <br> Neural Front Admin System <br><br>Note: This is a system generated e-mail, please do not reply to it. <br><br><br>* This message is intended only for the person or entity to which it is addressed and may contain confidential and/or privileged information. If you have received this message in error, please notify the sender immediately and delete this message from your system *</div></body></html>`;
var msg = {
  to: `pabbu.cp@gmail.com`,
  from: 'StatusCheck@mazosol.com',
  html: 'test',
  subject: 'Working Successful',
};
smtpTransport.sendMail(msg, function (err) {
  if (err) { console.log (err) }
  else { "email sent"}
  
});