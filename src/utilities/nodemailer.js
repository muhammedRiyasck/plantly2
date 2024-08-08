const nodemailer= require('nodemailer')
const otp = require('../model/otp_model')

const sendOTPmail = async (username, email, Otp,req,content='Welcome To plantly') => { 

    try {

      const transporter = nodemailer.createTransport({

        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },

      }); 
  
      // compose email

      const mailOption = {

        from: process.env.EMAIL,
        to: email,
        subject: "For Otp Verification",
        html:  `Dear <h2>${username},</h2><br>
        
        ${content}.<br> Please use the One-Time Password (OTP) below to complete the verification process:<br><br>
        
        <h3>**Your OTP:**<h3> <h2>${Otp}</h2><br>
        
        This OTP is valid for the next some minutes<br> For security reasons, please do not share this code with anyone.<br>
        
        If you did not request this verification, please ignore this email or contact our support team immediately.<br>

        If you have any concerns or didn't request this, contact us at <h4>plantlyplant@gmailcom<h4><br>
        
        Kind regards,<br>
        PLANTLY<br>
   
        
        Note: This is an automated message, please do not reply to this email.`
        
      };
  
      //send mail

      transporter.sendMail(mailOption, function (error, info) {

        if (error) {

          console.log("Error sending mail :- ", error.message);

        } else {

          console.log("Email has been sended :- ", info.response);

        }

      });

      // otp schema adding

      const userOTP = new otp({

        emailId: email,
        otp: Otp,

      });

      if(userOTP){

        userOTP.save()
        const createdAt = Date.now();
        req.session.time = createdAt

      }

    } catch (error) {

      console.log(error.message);

    }

};

module.exports= sendOTPmail
