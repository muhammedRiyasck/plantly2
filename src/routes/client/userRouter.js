const userRoute = require('express').Router()


const user_middilware = require('../../middleware/user_auth');

const userController = require('../../controllers/client/UserController');
const ShopController = require('../../controllers/client/ShopController')
const userProfile = require('../../controllers/client/ProfileController')
const cartController = require('../../controllers/client/CartController')
const wishlistController = require('../../controllers/client/WishlistController')
const checkoutController = require('../../controllers/client/CheckoutController')
const addressController = require('../../controllers/client/AddressController')
const orderController = require('../../controllers/client/OrderController')
const coupenController = require('../../controllers/client/CoupenController')
const PaymentController = require('../../controllers/client/PaymentController')

userRoute.get('/',userController.loadHome)
userRoute.get('/home',user_middilware.isBlocked,userController.loadHome)
userRoute.get('/shop',user_middilware.isBlocked,ShopController.loadShop)
userRoute.get('/blog',user_middilware.isBlocked,userController.loadBlog)
userRoute.get('/aboutUs',user_middilware.isBlocked,userController.loadAbout)
userRoute.get('/contactUs',user_middilware.isBlocked,userController.loadContactUs)
userRoute.get('/login', user_middilware.login ,userController.loadLogin)
userRoute.post('/verifylogin',userController.verifyLogin)
userRoute.post('/logout' , userController.logout);
userRoute.get('/registration', user_middilware.login ,userController.loadRegisteration)

userRoute.post('/registration',userController.insertUser)
userRoute.put('/refferal-cheking',userController.validateRefferral)
userRoute.get('/otp', user_middilware.login,userController.loadOtp)
userRoute.post('/verifyotp',userController.verifyOtp)

userRoute.put('/emailCheck',userController.existEmail)

userRoute.get('/resendOtp',userController.ResendOtp)
userRoute.route('/forgotPassword').get(user_middilware.login,userController.loadForgetPassword).post(userController.forgetPassword)

userRoute.route('/resetPassword').get(userController.loadResetPassword).post(userController.ResetPassword)

userRoute.get('/single-blog',user_middilware.isBlocked,userController.loadSingleBlog)
userRoute.get('/single-product',user_middilware.isBlocked,userController.loadSingleProduct)

userRoute.route('/profile').get(user_middilware.user,userProfile.loadUserProfile).post(userProfile.editProfile)

userRoute.route('/changePassword').post(userProfile.changePassword)

userRoute.route('/cart').get(user_middilware.isBlocked,cartController.loadCart).post(cartController.addToCart)

userRoute.route('/cartItemRemove').post(cartController.removeItem)
userRoute.route('/cartUpdate').post(cartController.cartUpdate)

userRoute.route('/wishlist').get(user_middilware.isBlocked,wishlistController.loadWishList).post(wishlistController.addWishlist)
userRoute.post('/removewishlist',wishlistController.removeWishlist)

userRoute.route('/wallet').get(user_middilware.isBlocked,userController.loadWallet)
userRoute.route('/address').get(user_middilware.user,addressController.loadAddress).put(addressController.addAddress)
userRoute.route('/checkout').get(user_middilware.isBlocked,checkoutController.loadChekout)
userRoute.route('/editAddress').put(addressController.editAddress)
userRoute.route('/addEditAddress').post(addressController.addEditAddress)
userRoute.route('/deleteAddress').delete(addressController.deleteAddress)

userRoute.post('/sortAndFilterAndSearch',ShopController.sortAndFilterAndSearch)

userRoute.route('/orders').get(user_middilware.isBlocked,orderController.loadOrders).post(orderController.setOrders)
userRoute.route('/orderdetails').get(user_middilware.isBlocked,orderController.loadOrderDetail)

userRoute.post('/cancelOrder',orderController.orderCancel)
userRoute.put('/returnOrder',orderController.returnOrder)

userRoute.route('/coupen').get(coupenController.loadCoupen).post(coupenController.useCoupen)
userRoute.route('/checkCoupen').post(coupenController.checkValidCoupen)
userRoute.put('/removeCop', coupenController.removeCop);
userRoute.get('/invoice/:id',user_middilware.isBlocked,userController.invoice);

userRoute.post('/razorpay',PaymentController.verifyPayment)
userRoute.put('/retry-payment',PaymentController.retryPayment)
userRoute.route('/success').get(userController.loadSuccess)
userRoute.route('/failuer').get(userController.loadFailurePage)

module.exports = userRoute
