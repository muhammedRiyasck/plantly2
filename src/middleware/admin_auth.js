

const isLogin = async (req, res, next) => {
    
    try {

        if (req.session.admin) {
            
            next();

        } else {

            res.redirect("/admin");

        }
        
    } catch (error) {

        console.log(error.message);
        next(error)
        
    }

};

const isLogout = async (req, res, next) => {

    try {

        if (req.session.admin) {
            
            res.redirect("/admin/dashboard");

        } else {

            next();

        }
        
    } catch (error) {

        console.log(error.message);
        next(error)
    }

};

module.exports = {

    isLogin,
    isLogout,

}
