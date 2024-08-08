const Users=require('../../model/user_model')

const loadUsers=async(req,res,next)=>{

    try {

        const page = parseInt(req.query.page)||1
        const limit = 10
        const skip = (page-1)*limit
        const [user,usersCount] = await Promise.all([
            Users.find({is_admin:{$ne:true}}).skip(skip).limit(limit),
            Users.countDocuments({is_admin:{$ne:true}})
    ]);
        const totalPages = Math.ceil(usersCount/limit)
        res.render('Users' , {
            user,
            totalPages,
            currentPage:page,
            skip
        })


    } catch (error) {
        next(error)
    }
}

const statusUpdation = async(req , res, next)=>{

    try {

        const userId = req.query.id

        const userData = await Users.find({_id:userId})

        if(userData[0].is_blocked==true){

         const userBlocking = await Users.findOneAndUpdate({_id : userId},{$set:{is_blocked:false}});


        }else{

        const blocking = await Users.findOneAndUpdate({_id:userId},{$set:{is_blocked:true}})


        }

    } catch (error) {

        next(error)
        
    }

}


module.exports={
    loadUsers,
    statusUpdation
}
