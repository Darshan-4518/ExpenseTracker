let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'darshanvirani010@gmail.com',
    pass: 'yjwa gozy cwxd lita'
  }
});

function sendMail(from,to,subject,text) {
  let mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: text
  };
  
  transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}

module.exports = {sendMail:sendMail}