
const Address = require('../../model/address_model')
const User = require('../../model/user_model')
const Product = require('../../model/products_model')
const Category = require('../../model/category_model')

const loadAddress = async(req,res,next)=>{

    try {
        if(req.session.user){
            
            let userId = req.session.user._id
            let address = await Address.findOne({user_id:userId})
            const message = req.flash('flash')
           res.render('Address',{userId,address,message,userlogdata:req.session.user})
        }else{
            console.log('login first for address')
            res.redirect('/login')
        }

    } catch (error) {
        next(error)
    }

}

const addAddress = async(req,res,next)=>{

    try {

        const userId = req.query.id
        const escapeRegex = (text) => {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
          };
       const addressRegex = new RegExp(`^${escapeRegex(req.body.addressData.address.trim())}$`, 'i');
        const exist = await Address.findOne({user_id:userId,'addressData.address':addressRegex},{'addressData.$':1})
  

      console.log(exist,'undd..........................')

        if(!exist){
            const verifyAddress = await Address.findOneAndUpdate(
                {user_id:req.query.id},
                {
                    $addToSet:{
                        addressData:{
                            name:req.body.addressData.name,
                            city:req.body.addressData.city,
                            state:req.body.addressData.state,
                            pincode:req.body.addressData.pincode,
                            phone:req.body.addressData.phone,
                            locality:req.body.addressData.locality,
                            address:req.body.addressData.address.trim(),
                            status:req.body.addressData.status
                        },
                    },
                },
                {new:true,upsert:true}
            )

            if(verifyAddress){
                res.send({success:true})
            }else{
                console.log('error from add address')
            }
        }else{
            res.status(400).send({exist:true})
           
        }

    } catch (error) {
        next(error)
    }

}

const editAddress = async(req,res,next)=>{
    try {
        const id = req.body.addressId
        console.log(id)
        const editAddress = await Address.findOne({'addressData._id':id},{'addressData.$' : 1})
        res.json({editAddress})
    } catch (error) {
        next(error)
    }
}

const addEditAddress = async(req,res,next)=>{

    try {
        const userId = req.session.user._id
        const {name,phone,locality,pincode,address,city,state,id} = req.body

        const editAddress = await Address.findOneAndUpdate({user_id:userId,'addressData._id':id},{$set:{'addressData.$.name':name,'addressData.$.phone':phone,'addressData.$.locality':locality,'addressData.$.pincode':pincode,'addressData.$.address':address,'addressData.$.city':city,'addressData.$.state':state}})
        const from = req.query.from
      
        if(editAddress&&from){
           res.send(true)
        }
        else if(editAddress){
            req.flash('flash','Address Edited')
            res.redirect('/address')
        }
    } catch (error) {
        next(error)
    }

}

const deleteAddress = async(req,res,next)=>{

    try {
        const userId = req.query.id
        const addressId = req.body.addressId
        console.log(userId,addressId,'kittin')

        const deleteAddress = await Address.updateOne({user_id:userId},{$pull:{addressData:{_id:addressId}}})
        if(deleteAddress){
            res.send(true)
        }
    } catch (error) {
        next(error)
    }

}

module.exports={
    loadAddress,
    addAddress,
    editAddress,
    addEditAddress,
    deleteAddress
}
