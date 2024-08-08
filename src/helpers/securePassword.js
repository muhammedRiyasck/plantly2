
const bcrypt=require('bcrypt')

const securePassword=async(password)=>{
    try {

        const passwordhash=await bcrypt.hash(password,10)
        return passwordhash

    } catch (error) {
        console.log(error.meassage)
    }
} 
module.exports= securePassword
