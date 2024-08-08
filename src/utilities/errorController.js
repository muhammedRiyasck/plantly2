module.exports = (error,req,res,next)=>{
        statusCode = error.statusCode || 500
        message=error.message
        status = error.status || 'error';
        // res.status(error.statusCode).json({
        //     status:error.statusCode,
        //     message:error.message
        // })
        res.render('../404',{statusCode,status,message})
    }

