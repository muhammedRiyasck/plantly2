const { cart } = require('../../model/cartandwishlist_model')
const User = require('../../model/user_model')
const Product = require('../../model/products_model')
const Category = require('../../model/category_model')



const loadCart = async (req, res, next) => {

    try {

        if (req.session.user) {


            const userId = req.session.user._id

            let cartData = await cart.findOne({ user_id: userId }).populate('products.product_id')
            cartData.percentage=0;
            cartData.coupenDiscount=0;
            await cartData.save();
            let querymessage = req.query.message
            if (cartData) {

                const unlistProduct = cartData.products.filter(val => val.product_id.status === false)

                if (unlistProduct) {

                    for (const product of unlistProduct) {

                        var UpdatedCartData = await cart.findOneAndUpdate({ user_id: userId }, { $pull: { products: { product_id: product.product_id._id } } }, { new: true })

                    }

                }

                cartData = UpdatedCartData ? UpdatedCartData : cartData

                let productPrice = cartData.products.reduce((acc, curr) => acc + curr.price, 0)

                //  if(cartData.coupenDiscount>=0){
                //     price -= cartData.coupenDiscount
                //  }

                await cart.findOneAndUpdate({ user_id: userId }, { $set: { totalCartPrice: productPrice } }, { new: true, upsert: true }).exec();

                const updatedCartData = await cart.findOne({ user_id: userId }).populate('products.product_id')


                let amount = await cart.findOne({ user_id: userId }, { totalCartPrice: true })

                let taxAmount = 0

    

                const message = req.flash('message')
                

                
                res.render('Cart', { userlogdata: req.session.user, message, cartData: updatedCartData, productPrice, totalAmount: Math.round(productPrice + taxAmount), querymessage })


            } else {
                const message = req.flash('message')

                return res.render('Cart', { userlogdata: req.session.user, message, querymessage })
            }

        } else {

            res.redirect('/login')
            req.flash('message', 'Please Login. To See Your Cart')
        }

    } catch (error) {
        next(error)
    }
}

const addToCart = async (req, res, next) => {

    try {

        if (req.session.user) {

            const productId = req.body.id
            const quantiyy = req.body.qtyValue || 1

            const userId = req.session.user._id

            const cartProduct = await Product.findOne({ _id: productId })

            const exist = await cart.findOne({ user_id: userId, products: { $elemMatch: { product_id: productId } } })
            // exist.percentage=0;
            // exist.coupenDiscount=0;
            // await exist.save();
            if (!exist) {

                const total = cartProduct.discount > 0 ? cartProduct.discount_price * quantiyy : cartProduct.price * quantiyy
                const totalSaved = cartProduct.discount > 0 ? (cartProduct.price * quantiyy) - (cartProduct.discount_price * quantiyy) : 0
    

                const addedd = await cart.findOneAndUpdate({ user_id: userId }, {
                    $addToSet: {
                        products: {
                            product_id: productId,
                            price: total,
                            offerPrice: total,
                            quantity: quantiyy

                        },

                    },
                    coupenDiscount: 0,
                    percentage: 0,
                    $inc:{totalSaved}
                }, { new: true, upsert: true });

                if (addedd) {

                    res.send({ success: true })

                }

            } else {

                res.send({ exist: true })

            }

        } else {

            res.send({ login: false })
            // req.flash('message','please login first')
            // res.redirect('/login')


        }

    } catch (error) {
        next(error)
    }
}

const removeItem = async (req, res, next) => {

    try {

        const userId = req.session.user._id
        const itemId = req.body.id
        const qty=req.body.qty

        const cartProduct = await Product.findOne({ _id: itemId })
        const totalSaved = cartProduct.discount > 0 ? (cartProduct.price * qty) - (cartProduct.discount_price * qty) : 0;
        const removeCart = await cart.updateOne({ user_id: userId }, { $pull: { products: { 'product_id': itemId } },$inc:{totalSaved:-totalSaved},$set:{coupenDiscount:0,percentage:0} });


        const removeItem = await cart.deleteOne({ 'products.product_id._id': itemId })


        if (removeItem) {

            res.send(true)

        } else {


        }

    } catch (error) {
        
        next(error)
    }
}

const cartUpdate = async (req, res, next) => {

    try {

        const productId = req.body.productId;
        const cartId = req.body.cartId
        const quantiy = req.body.quantity
        const Tprice = req.body.price
        const {products}=await cart.findOne({_id:cartId, 'products.product_id': productId},{"products.$":1})
        // return
        const product = await Product.findOne({ _id: productId })
        
        //   const updatedPrice= product.price*quantiy
        const updatedPrice = product.discount > 0 ? product.discount_price * quantiy : product.price * quantiy
        let new_totalSaved = product.discount > 0 ? (product.price * quantiy) - (product.discount_price * quantiy) : 0
        let old_totalSaved = product.discount > 0 ? (product.price * products[0].quantity) - (product.discount_price * products[0].quantity):0

        new_totalSaved-=old_totalSaved
        // return

        const updatedCart = await cart.findOneAndUpdate({ _id: cartId, 'products.product_id': productId },
            {
                $set: {
                    'products.$.price': updatedPrice,
                    'products.$.quantity': quantiy,
                    coupenDiscount:0,
                    percentage:0
                },
                $inc:{totalSaved:new_totalSaved}
            },
            { new: true }
        )

        const totalCartPrice = updatedCart.products.reduce(
            (acc, curr) => acc + curr.price, 0)

        await cart.findOneAndUpdate({ _id: cartId }, { $set: { totalCartPrice: totalCartPrice } })

        let taxAmount = 0

        res.send({ success: totalCartPrice, productPrice: updatedPrice, taxAmount })


    } catch (error) {
        next(error)
    }

}

const loadWishList = async (req, res, next) => {

    try {

        if (req.session.user) {

            res.render('WishList', { userlogdata: req.session.user })

        } else {

            res.redirect('/login')

        }

    } catch (error) {
        next(error)
    }

}

module.exports = {
    loadCart,
    addToCart,
    loadWishList,
    removeItem,
    cartUpdate
}
