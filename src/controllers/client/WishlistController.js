const {wishlist}= require('../../model/cartandwishlist_model')
const User = require('../../model/user_model')
const Product = require('../../model/products_model')
const Category = require('../../model/category_model')

const loadWishList = async(req,res,next)=>{
    try {
        
        if (req.session.user) {


            const wishlistData = await wishlist.findOne({ user_id: req.session.user._id }).populate('products.product_id');
            console.log(wishlistData)
            if (wishlistData) {
                
                const Unlisted = wishlistData.products.filter(val => 'val.product_id.status' === false);

                if (Unlisted.length >= 1) {
                    
                    for (const product of Unlisted) {
                        
                        var newData = await wishlist.findOneAndUpdate({ userId: req.session.user._id }, { $pull: { products: { product_id: product.product_id._id } } }, { new: true }).populate('product.product_id');
    
                    }
                    
                    res.render("WishList", { userlogdata: req.session.user, wishlistData: newData });
                    
                } else {
                
                    res.render("WishList", { userlogdata: req.session.user, wishlistData });
                }
                
            } else {
                
                res.render("WishList", { userlogdata: req.session.user,wishlistData });

            }
            
        } else {

            res.redirect('/login');

        }
        
    } catch (error) {
        
        next(error)


    }

}

const addWishlist = async (req, res , next) => {
    
    try {

    if(req.session.user){
        const proIdd = req.query.idd
        console.log(proIdd)
        const userIdd = req.session.user._id

        const exist = await wishlist.findOne({ user_id: userIdd, products: { $elemMatch: { product_id: proIdd } } }).exec();

        if (!exist) {
             
            let s = await wishlist.findOneAndUpdate({ user_id: userIdd }, { $addToSet: { products: { product_id: proIdd } } }, { upsert: true });
            
            res.send({ success: true });
           
        } else {

            res.send({ success: false });
        }
    }else{
         req.flash('')
    }
    } catch (error) {

        next(error,req,res);

        // res.status(500).send({ suc: false, message: 'Internal Server Error' });
        
    }

};

const removeWishlist = async (req, res , next) => {
    
    try {

        const proId = req.query.id
        console.log(proId)
        const removeWishlistt = await wishlist.findOneAndUpdate({ user_id: req.session.user._id }, { $pull: { products: { product_id : proId } } });

        console.log(removeWishlistt);

        if (removeWishlistt) {
            
            res.send({ success: true })

        } else {

            res.send({ success: false })

        }
        
    } catch (error) {

       next()

        
    }

};


module.exports={
    loadWishList,
    addWishlist,
    removeWishlist
}
