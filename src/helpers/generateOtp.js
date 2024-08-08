
const generateOTP = () => {
    
    const digits = '0123456789';

    let OTP = '';

    for (let i = 0; i < 4; i++) {

        OTP += digits[Math.floor(Math.random() * 10)];
    };  
    
    console.log(OTP)
    
    return OTP;

};

module.exports= generateOTP
