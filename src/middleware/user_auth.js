const User = require('../model/user_model');

const user = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
};

const login = async (req, res, next) => {
    try {
        if (req.session.user) {
            return res.redirect('/');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
};

const isBlocked = async (req, res, next) => {
    try {
        if (req.session.user) {
            const userData = await User.findOne({ _id: req.session.user._id });
            if (userData?.is_blocked) {
                delete req.session.user;
                return res.redirect('/login');
            }
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    login,
    user,
    isBlocked,
};
