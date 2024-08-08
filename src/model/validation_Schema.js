const joi = require('joi')

const Registration = joi.object({
    // name : joi.string().required(),
    // email : joi. string().email().lowercase().required(),
    // mobile : joi.string().length(10).pattern(/^[0-9]+$/).required(),
    // password: joi.string().length(5).pattern(/^[0-9]+$/).required(),
    // cpassword: joi.string().valid(joi.ref('password')).required()
})



module.exports = {
    Registration,
   
}
