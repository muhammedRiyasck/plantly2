const express = require('express');
const adminControllers = require('../../controllers/admin/Controller');
const adminCategory=require('../../controllers/admin/Categories')
const adminProducts=require('../../controllers/admin/Products')
const adminUsers=require('../../controllers/admin/Users')
const adminOrders= require('../../controllers/admin/Orders')
const adminOfferController = require('../../controllers/admin/OfferModule')
const adminCoupenController = require('../../controllers/admin/Coupen')
const salesReportController = require('../../controllers/admin/SalesReport')
const dashboardController = require('../../controllers/admin/Dashboard')
const adminRoute = express()

const admin_auth = require('../.././middleware/admin_auth')

const path = require('path');
adminRoute.use(express.static(path.join(__dirname, 'src/public/admin')));
adminRoute.set('views', './src/views/admin');  

const multer = require('../../utilities/multer')

adminRoute.get('/',admin_auth.isLogout, adminControllers.loadLogin)
adminRoute.get('/login',admin_auth.isLogout, adminControllers.loadLogin)
 
adminRoute.post('/verifylogin',adminControllers.verifyLogin)

adminRoute.get('/dashboard',admin_auth.isLogin,dashboardController.loadDashboard);

adminRoute.get('/users',admin_auth.isLogin,adminUsers.loadUsers)
adminRoute.put('/userAction', adminUsers.statusUpdation);

adminRoute.get('/products',admin_auth.isLogin,adminProducts.loadProducts)
adminRoute.get('/addProducts',admin_auth.isLogin,adminProducts.loadAddProducts)

adminRoute.get('/category',admin_auth.isLogin,adminCategory.loadCategory)
adminRoute.post('/addCategory',adminCategory.addCategory)
adminRoute.put('/categoryList',adminCategory.categoryAction)
adminRoute.post('/valSet' , adminCategory.valSett);
adminRoute.post('/categoryEdit',adminCategory.categoryEdit)
adminRoute.post('/categoryDelete',adminCategory.categoryDelete)

adminRoute.post('/addProduct',multer.upload.array('images', 3), adminProducts.addProducts);
adminRoute.put('/productAction',adminProducts.productAction)
adminRoute.get('/editProduct',admin_auth.isLogin,adminProducts.loadEditProduct)

adminRoute.post('/editProduct/:id',multer.upload.fields([{ name: 'image0', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]),adminProducts.editProduct)

adminRoute.get('/orders',admin_auth.isLogin,adminOrders.loadOrders)
adminRoute.get('/orderDetails',admin_auth.isLogin,adminOrders.loadOrdersDetails)
adminRoute.get('/cancelOrders',admin_auth.isLogin,adminOrders.loadCancelOrders)
adminRoute.get('/returnOrders',admin_auth.isLogin,adminOrders.loadReturnOrders)
adminRoute.put('/orderStatusHandling',adminOrders.orderProductStatus)

adminRoute.route('/offerModule').get(admin_auth.isLogin,adminOfferController.loadOffer).post(adminOfferController.addOffer)
adminRoute.put('/offerRemove',adminOfferController.offerRemove)

adminRoute.route('/coupen').get(admin_auth.isLogin,adminCoupenController.loadAdminCoupen).post(multer.upload.array('image',1),adminCoupenController.addCoupen)
adminRoute.post('/copenAction',adminCoupenController.coupenAction)
adminRoute.put('/deleteCoupen',adminCoupenController.deleteCoupen)

adminRoute.post('/returnManage',adminOrders.returnManage)

adminRoute.get('/salesReport/:id', admin_auth.isLogin, salesReportController.loadReport);

adminRoute.put('/monthChart',dashboardController.monthlyChart)
adminRoute.put('/chartYear',dashboardController.yearlyChart)
adminRoute.put('/customReport',salesReportController.customReport)


adminRoute.post('/logout',adminControllers.logOut)

module.exports = adminRoute
