
const Address = require("../../model/address_model");

//  Import User Modal :-
const User = require("../../model/user_model");

//  Import Product Modal :-
const Product = require("../../model/products_model");

//  Import Category Modal :-
const Category = require("../../model/category_model");

//  Import Order Modal :-
const Order = require("../../model/order_model");

//  Import Cart Modal :-
const {cart} = require("../../model/cartandwishlist_model");

//  Import Wallet Model :-
const Wallet = require("../../model/wallet_model");

//  Coupen Modal :-
const Coupen = require('../../model/coupen_model');

const crypto = require('crypto');




const loadAdminCoupen = async (req, res , next) => {
    
    try {

        const page = parseInt(req.query.page)||1
        const limit = 4
        const skip = Math.ceil(page-1)*limit
        
        const [coupenData,coupenCount] = await Promise.all([
            Coupen.find().skip(skip).limit(limit),
            Coupen.countDocuments()
        ]);
        const totalPages = coupenCount/limit

        const msg = req.flash("good");
        res.render("Coupen", {
            coupenData,
            msgg : msg,
            totalPages,
            currentPage:page
        });
        
    } catch (error) {

        next(error,req,res);

        
    }

};

const addCoupen = async (req, res , next) => {
    
    try {

        const { coupon, min, max, discount } = req.body;
        console.log(req.body)

        const uniqueId = crypto.randomUUID();
        console.log(uniqueId)
        const createCoupen = new Coupen({

            name: coupon,
            discount: discount,
            // from: min,
            // to: max,
            coupen_id: uniqueId,
            image: req.files[0].filename

        })
        
        if (createCoupen) {
            console.log('haii')
           await createCoupen.save();
            req.flash("flash", "coupen added successfuly");
            res.redirect("/admin/coupen");

        }

    } catch (error) {

        next(error,req,res);

        
    }

};

const coupenAction = async (req, res , next) => {
    
    try {

        const copenId = req.body.id
        console.log(req.body)

        const changeStatus = await Coupen.findOne({ _id: copenId });

        changeStatus.status = !changeStatus.status
        await changeStatus.save()
        
    } catch (error) {

        next(error, req, res);
        
    }
}

const deleteCoupen = async (req, res , next) => {
    
    try {

        const coupenId = req.query.id

        const deletCoupen = await Coupen.deleteOne({ _id: coupenId });

        if (deletCoupen) {
            
            res.send({ success: true });

        } 
                
    } catch (error) {

        next(error,req,res);

        
    }

};

module.exports={
    loadAdminCoupen,
    addCoupen,
    coupenAction,
    deleteCoupen
}
