const mongoose = require('mongoose')
const Address = require('../../model/address_model')
const User = require('../../model/user_model')
const Product = require('../../model/products_model')
const Order = require('../../model/order_model')
const Wallet = require('../../model/wallet_model')
const {cart} = require('../../model/cartandwishlist_model')
const flash = require('express-flash')
const Coupen = require('../../model/coupen_model')
const genretor = require('otp-generator')
const Razorpay = require('razorpay')

require("dotenv").config();
const Instance = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
    
  });

const loadOrders = async (req, res , next) => {
    try {
        if (req.session.user) {
            const page = parseInt(req.query.page)||1;
            const limit = 5;
            const skip = (page-1)*limit
            
            const [addressData,orderedData,totalOrders] = await Promise.all([
                Address.findOne({user_id:req.session.user._id}),
                Order.find({user_id:req.session.user._id})
                .populate('products.product_id')
                .skip(skip)
                .limit(limit)
                .sort({orderDate:-1}),
                Order.countDocuments({user_id:req.session.user._id})
            ])

            const totalPages = Math.ceil(totalOrders/limit)
            res.render('Orderslist', { 
                userlogdata:req.session.user,
                addressData,
                orderedData,
                currentPage:page,
                totalPages,
                skip
             })
        } else {
            req.flash('message', 'please login to see your orders')
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

const loadOrderDetail = async (req, res) => {
    try {
        if(req.session.user){
        const order = await Order.findOne({ _id: req.query.id }).populate('products.product_id')
        res.render('OrderDetails', { userlogdata: req.session.user, order})
        }else{
            req.flash('message', 'please login to see your orderDetails')
            res.redirect('/login')   
        }
    } catch (error) {
        console.log(error.message)
    }
}

const setOrders = async (req, res , next) => {
    try {
        
        const userId = req.session.user._id;
        const addressId = req.body.selectedAddressId
        const paymentMethod = req.body.selectedpayment
        const coupenIdd = req.body.coupenIdd
        console.log(coupenIdd,'coupen Id')
        console.log(paymentMethod,'method')
        if (!userId) {
            return res.redirect('/login');
        }

        const totalAmount = Math.round(req.body.amount);
        req.session.user.amount = totalAmount
        const addressData = await Address.aggregate([
            { $unwind: "$addressData" },
            { $match: { "addressData._id": new mongoose.Types.ObjectId(addressId) } },
            { $replaceRoot: { newRoot: "$addressData" } }
        ]);

        let cartData = await cart.findOne({user_id:userId}).populate('products.product_id')
            const unlistProduct = cartData.products.filter(val => val.product_id.status === false)
            console.log(unlistProduct.length>0,'unlisted product')
            if(unlistProduct.length>0){ 
                console.log('product is unlisted')
            return res.json({ listed:true, message: ` sorry.some products are out of stock,please double check your cart` });
            //
            
            }
        
                for (const item of cartData.products) {
                    
                        if (item.product_id.stock < item.quantity) {
                            return res.json({ quantity:false, message: "Sorry.insufficient stock." });
                            throw new Error(`Insufficient stock for ${item.product_id.name}`);
                          }
                  
            }
     
    
        //backend address checking
        if (!addressData) {
            return res.send(false)
        }else if(!paymentMethod){
            return res.send(false)
        }
        let orderID = genretor.generate(12, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: true,
            specialChars: false
        });
        
        req.session.user.order_Id= orderID
        
        const { name, phone, address, pincode, locality, state, city, } = addressData[0];
       const totalSaved=cartData.coupenDiscount+cartData.totalSaved
       const perce=cartData.percentage|| 0;
       const order_products=cartData.products.map(e=>({product_id:e.product_id._id,quantity:e.quantity,price:Math.round(e.price-(perce/100)*e.price)}));
        const orderedData = await Order.create({
            user_id: userId,
            products:order_products ,
            deliveryAddress: {
                name, phone, address, locality, city, state, pincode
            },
            quantity:'cartData.products.quantity',
            orderDate: Date.now(),
            orderAmount: totalAmount,
            order_Id : orderID,
            payment: paymentMethod,
            percentage:perce,
            totalSaved
        });

        await Coupen.findOneAndUpdate({coupen_id:coupenIdd},{$set:{used:true}})

        cartData.coupenDiscount = 0;
        cartData.percentage = 0;
        cartData.totalSaved=0;

        await cartData.save()
        req.session.order = orderedData;

        if (orderedData) {
            for (const elem of orderedData.products) {
                const product = await Product.findOne({ _id: elem.product_id });
                const newStock = product.stock - elem.quantity;

                await Product.findOneAndUpdate({ _id: elem.product_id }, { $set: { stock: newStock } });
            }

            await cart.updateOne({ user_id: userId }, { $unset: { products: 1 }, $set: { totalCartPrice: 0 } });

            if(paymentMethod == 'online'){
                var options = {
                    amount:totalAmount * 100,
                    currency: 'INR',
                    receipt: ''+orderedData._id,
                  }
            //    console.log('X',options);
               Instance.orders.create(options, async function (err, order) {
                    if(err){
                      console.log("error:",err);
                  }
                  return res.json({razorpay:true,order})
                 
                  })
                }
            else if(paymentMethod=='wallet'){
                let walletBalance = await Wallet.findOne({user_id: req.session.user._id},{_id:0,balance:1})
                console.log(walletBalance,totalAmount)
                if(walletBalance.balance >= totalAmount){
                
                const balancee = walletBalance.balance - totalAmount

                const debitAmount = totalAmount
                
               let success = await Wallet.findOneAndUpdate(
                
                    { user_id: req.session.user._id },
                  
                    {
                      
                        $set: { balance: balancee },
                        
                        $push: {
                        
                            transaction: { amount: debitAmount, creditOrDebit: 'debit' },
                            
                        },
                        
                    }
                );
                if(success){
                    await Order.findOneAndUpdate({user_id:userId,order_Id:req.session.order.order_Id},{$set:{orderStatus:'placed','products.$[].productStatus': 'placed'}})
                    res.send({success:true})
                }else{
                    console.log('something went wrong')
                }
            }else{
                console.log('something balacace issue')
                res.send({insuficent:true})
            }

            }else{

                await Order.findOneAndUpdate({user_id:userId,order_Id:req.session.order.order_Id},{$set:{orderStatus:'placed','products.$[].productStatus': 'placed'}})
               
            return res.status(200).json({success:true,message: 'Order placed successfully' });

            }

        } else {
            console.log('Order creation failed');
            // return res.redirect('/checkout');
        }
    
    } catch (error) {
        console.log(error.message);
        
        next(error)
    }
    
};
         
const loadThanks = async (req, res, next) => {

    try {

        if (req.session.user && req.session.order) {


            res.render("Success", { login: req.session.user, categoryData });

        } else {

            res.redirect('/')

        }

    } catch (error) {

        next(error, req, res);


    }

};

//  orderCancel (Post Method) :-

const orderCancel = async (req, res , next) => {
    
    try {
       
        const { proId, ordId, price, reason } = req.body;

        console.log(req.body)

        const userIdd = req.session.user._id

        const cancelOrder = await Order.findOneAndUpdate(
        
            { order_Id: ordId, 'products.product_id': proId },
          
            {
              
                $set: {
                
                    'products.$.productStatus': 'canceled',
                    'products.$.canceled': true,
                    'products.$.reason': reason,
                
                },
                
            },

            { new: true }
            
        )

        //  Adding Stock Back :-
      
     

        if (cancelOrder) {
            
            var Quantity = cancelOrder.products[0].quantity;     //  Find Pro Quantity
    
            await Product.findOneAndUpdate({_id: proId }, { $inc: { stock: Quantity } });

                await Order.findOneAndUpdate({ order_Id: ordId, 'products.product_id': proId }, { $inc: { orderAmount:-price } });
                if (cancelOrder.payment != 'cod') {
                    console.log('not coodd')
                    await Wallet.findOneAndUpdate({ user_id: userIdd },
                    
                        {
                            $inc: { balance: price },
                            $push: { transaction: { amount: price, creditOrDebit: 'credit' } }
                        },
                        
                        { new: true, upsert: true })
                    
                }

                
                            res.send({ succ: true });

        }

        //  CancelProduct Amount Adiing The Wallet :-

      

         else {
            console.log('it cod')
            res.send({ fail: true });
        }
    
    }catch (error) {

        next(error,req,res);

        
    }

};
const returnOrder = async (req, res , next) => {
    
    try {

        const { proId, ordId, price, reason } = req.body;
        console.log(req.body)
        const userIdd = req.session.user._id

        
        
        const returnOrder = await Order.findOneAndUpdate(
        
            { order_Id: ordId, "products.product_id": proId },
          
            {
                $set: {
                    'products.$.productStatus': 'returned',
                    "products.$.retruned": true,
                    "products.$.reason": reason,
                  
                },
            }
          
        );

        if (returnOrder) {
            var Quantity = returnOrder.products[0].quantity;     //  Find Pro Quantity
    
            await Product.findOneAndUpdate({_id: proId }, { $inc: { stock: Quantity } });

                await Order.findOneAndUpdate({ order_Id: ordId, 'products.product_id': proId }, { $inc: { orderAmount:-price } });
              
                   
                    await Wallet.findOneAndUpdate({ user_id: userIdd },
                    
                        {
                            $inc: { balance: price },
                            $push: { transaction: { amount: price, creditOrDebit: 'credit' } }
                        },
                        
                        { new: true, upsert: true })
                            
                     res.send({ succ: true });

        }
         
       

    } catch (error) {

        next(error,req,res);

        
    }

};


    
module.exports = {
    loadOrders,
    loadOrderDetail,
    setOrders,
    loadThanks,
    orderCancel,
    returnOrder
}
