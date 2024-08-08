
const User = require('../../model/user_model')
const bcrypt=require('bcrypt')


const loadLogin=async(req,res,next)=>{
    try {
        const msg=req.flash('passError')
        res.render('Login.ejs',{msg})
    } catch (error) {
        next(error)
    }
}


const verifyLogin = async (req, res , next) => {
    
    try {
        
            const Email = req.body.email;
            const Password = req.body.password;
            console.log(Email,Password)

        const userDataa = await User.findOne({ email: Email });
        // console.log(userDataa,'logged in admin')
        
        if (userDataa && ( userDataa.is_admin == true )) {

            const passMatch = await bcrypt.compare(Password, userDataa.password);

            if(passMatch ) {

                req.session.admin = userDataa; //  Add User Data in the dbs to session
               
                res.redirect("/admin/dashboard");

            } else {
              
                req.flash('passError', 'Password or Username is wrong');      //  Password Wrong (Flash)
                res.redirect('/admin/login');

            } 

        } else {

            // res.render('Login', { msg: "Unauthorized User" });
            req.flash('passError', "Unauthorized User" );      //  Password Wrong (Flash)
            res.redirect('/admin/login');

        }

    } catch (error) {

        next(error)
        
    }
};


// const loadDashboard = async (req, res) => {
//     try {
//         res.render('Dashboard')
//     } catch (error) {
//         console.log(error.message)
//     }
// }


const logOut = async (req,res,next)=>{
    try {
        req.session.admin = undefined
        req.flash('passError', "Logout Successfully...")
        res.redirect('/admin/login')
    } catch (error) {

        next(error)
        
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    logOut
}
