const Product = require("../../model/products_model");

//  Import Category Modal :-
const Category = require("../../model/category_model");

//  Import Order Modal :-
const Order = require("../../model/order_model");

//  Import Offer Model :-
const Offer = require('../../model/offer_model');

//  loadOffer (Get Method) :-

const loadOffer = async (req, res , next) => {
    
    try {

        const page = parseInt(req.query.page)||1
        const limit = 5
        const skip = (page-1)*limit
        const category = await Category.find({ Listed: true })

        const[offer,offerCount] = await Promise.all([
            Offer.find().populate('category_id').skip(skip).limit(limit),
            Offer.countDocuments()
        ]) 
        const totalPages = offerCount/limit
        const message = req.flash('message')
        res.render('OfferModule' , {
            offer,
            category,
            message,
            totalPages,
            currentPage:page,
            skip
        });
        
    } catch (error) {

        next(error,req,res);
        
    }

};

//  addOffer (Post Method) :-

const addOffer = async (req, res , next) => {
    
    try {

        const { offername, category, offer } = req.body;

        const findedCategory = await Category.findOne({ name: category})

        const findedProduct = await Product.find({'category_id': findedCategory._id }).populate('category_id');

        function escapeRegex(string) {
            return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
        
        const exist = await Offer.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${escapeRegex(offername)}$`, 'i') } },
                { category_id: findedCategory._id }
            ]
        }).populate('category_id');
        
        if (!exist) {
            
            findedProduct.forEach(async (val) => {
            
                const offerPrice = Math.round((val.price / 100) * (100 - offer));
                await Product.findOneAndUpdate({ _id: val._id }, { $set: { discount: offer, discount_price: offerPrice } });

            })
            
            const offerAdd = new Offer({

                name: offername,
                offer: offer,
                category_id: findedCategory._id

            })

            offerAdd.save();
            res.redirect("/admin/offerModule");

        } else {
            console.log('offer alredy exist',exist)
            req.flash('message','This offer alredy exists')
            res.redirect('/admin/offerModule')

        }

    } catch (error) {

        next(error,req,res);

        
    }

};

//  offerRemove (Put Method) :-

const offerRemove = async (req, res , next) => {
    
    try {

        const offerId = req.query.id
        
        const removed = await Offer.findOneAndDelete({ _id: offerId });

        const cateId = removed.category_id._id

        if (removed) {

             await Product.updateMany({ category_id: cateId }, { $set: { discount: 0, discount_price: 0 } });

            res.send({ succ: true })

        } else {

            res.send({ fail: true })

        }

    } catch (error) {

        next(error,req,res);

    }

};

module.exports = {

    loadOffer,
    addOffer,
    offerRemove
}
