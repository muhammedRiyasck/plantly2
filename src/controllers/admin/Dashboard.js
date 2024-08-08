const Product = require('../../model/products_model')
const Order = require('../../model/order_model')

const loadDashboard = async(req,res,next)=>{
    try {
        
        const orderData = await Order.find({  $and: [
            { orderStatus: { $ne: 'pending' } },
            { orderAmount: { $gt: 0 } }
        ]}).populate('products.product_id')

        const totalOrderAmount = orderData.reduce((acc,val)=>acc + val.orderAmount,0)
        const overallDiscount = orderData.reduce((acc,val)=>acc+val.totalSaved,0)
      
        const topProducts = await Order.aggregate([
            {$match:{
                orderStatus: { $ne: 'pending' } ,
                orderAmount: { $gt: 0 }
            }},
           
            { $unwind: "$products" },
           
            {
                $group: {
                    _id: "$products.product_id",
                    totalSold: { $sum: "$products.quantity" }
                }
            },
           
            { $sort: { totalSold: -1 } },
           
            { $limit: 5 },
           
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
           
            { $unwind: "$productDetails" },
           
            {
                $project: {
                    _id: 0,
                    product_id: "$_id",
                    name: "$productDetails.name",
                    totalSold: 1,
                    price: "$productDetails.price",
                    images: "$productDetails.images"
                }
            }
        ]);
        const topCategories = await Order.aggregate([
            {$match:{
                orderStatus: { $ne: 'pending' } ,
                orderAmount: { $gt: 0 }
            }},
            
            { $unwind: "$products" },
            
            {
                $lookup: {
                    from: "products", 
                    localField: "products.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            
            { $unwind: "$productDetails" },
            
            {
                $lookup: {
                    from: "categories", 
                    localField: "productDetails.category_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            
            { $unwind: "$categoryDetails" },
            
            {
                $group: {
                    _id: "$categoryDetails._id",
                    categoryName: { $first: "$categoryDetails.name" },
                    totalSold: { $sum: "$products.quantity" }
                }
            },
            
            { $sort: { totalSold: -1 } },
            
            { $limit: 5 },
            
            {
                $project: {
                    _id: 0,
                    category_id: "$_id",
                    categoryName: 1,
                    totalSold: 1
                }
            }
        ]);

       
        res.render('Dashboard',{totalOrderAmount,orderData,overallDiscount,topProducts,topCategories})
    } catch (error) {
        next(error)
    }
}


const monthlyChart=async(req,res)=>{
    try {
        const currentYear = new Date().getFullYear();
        
        const salesData = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lt: new Date(`${currentYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$orderDate" },
                    totalSales: { $sum: "$orderAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    totalSales: 1
                }
            }
        ]);

        // Initialize an array with 0s for each month
        const monthlySales = new Array(12).fill(0);
        
        // Populate the monthly sales data
        salesData.forEach(data => {
            monthlySales[data.month - 1] = data.totalSales;
        });
        console.log(monthlySales);
       res.send({count:monthlySales})
    } catch (error) {
        console.error("Error fetching monthly order counts:", error);
        next(error)
    }
}


const yearlyChart=async(req,res)=>{
    try {
        const currentYear = new Date().getFullYear();
        const pastFiveYears = Array.from({ length: 6 }, (_, i) => currentYear - i).reverse();
        
        const salesData = await Order.aggregate([
          {
            $match: {
              orderDate: {
                $gte: new Date(currentYear - 5, 0, 1),
                $lte: new Date(currentYear, 11, 31)
              }
            }
          },
          {
            $project: {
              year: { $year: '$orderDate' },
              orderAmount: 1
            }
          },
          {
            $group: {
              _id: '$year',
              totalSales: { $sum: '$orderAmount' }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
      
        const salesArray = pastFiveYears.map(year => {
          const yearData = salesData.find(sale => sale._id === year);
          return yearData ? yearData.totalSales : 0;
        });
        console.log(salesArray);
       res.send({count:salesArray})
    } catch (error) {
        console.error("Error fetching monthly order counts for past five years:", error);
        next(error)
    }
}

module.exports={
    loadDashboard,
    monthlyChart,
    yearlyChart
}
