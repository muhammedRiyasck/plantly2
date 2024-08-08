const User = require('../../model/user_model')
const Product = require('../../model/products_model')
const bcrypt = require('bcrypt')
const securePassword = require('../../helpers/securePassword')

const loadUserProfile = async(req,res,next)=>{
    try {
        if(req.session.user){
        const userData =await User.findById({_id:req.session.user._id})

        const swal = req.flash('swal')
        // const swalError = req.flash('swal-error')
        

        res.render('Profile',{userData, userlogdata : req.session.user,swal})

        }else{
            res.redirect('/login')
        }

    } catch (error) {
        next(error)
    }
}



const editProfile = async(req,res,next)=>{

    try {
        
        const {name,email}= req.body
        const userId = req.query.userId
        // const exist = await User.findOne({email:email})
        // if(!exist){

        const user = await User.findByIdAndUpdate({_id:userId},{$set:{fullName:name.trim(),email:email.trim()}})
        if(user){
            req.session.user.fullName=name
            req.flash('swal','profile edited')
            res.redirect('/profile')
        }else{
            console.log('something went wrong editProfile')
            res.redirect('/profile')
        }
    // }else{
    //     req.flash('swal','email already exist')
    //     console.log('alreday exist')
    //     res.redirect('/profile')
    // }
        
    } catch (error) {
        next(error)
    }
}

const changePassword = async(req,res,next)=>{

    try {
       const {CurrentPassword,NewPassword,ConfirmPassword}=req.body
       
      const userId = req.query.userId

      const user = await User.findById({_id:userId})
      
      const passwordMatch = await bcrypt.compare(CurrentPassword,user.password)
      
      if(passwordMatch){

        if(NewPassword === ConfirmPassword){

        const hassedPass = await securePassword(NewPassword)
        console.log(hassedPass)

      const passwordUpdated =  await User.updateOne({_id:userId},{$set:{password:hassedPass}})

      if(passwordUpdated){
        console.log('password changed succesfuly')
        req.flash('swal','password updated')
        res.redirect('/profile')
      }

      }else{
            console.log('password is not match')
            res.redirect('/profile')
        }

      }else{
        console.log('current password is wrong')
        req.flash('swal','current passwordwrong')
        res.redirect('/profile')
      }

    } catch (error) {
        next(error)
    }

}


module.exports={
    loadUserProfile,
    editProfile,
    changePassword,
    editProfile
}
