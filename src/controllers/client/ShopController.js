const category_model = require('../../model/category_model')
const Product = require('../../model/products_model')
const Category = require('../../model/category_model')


const loadShop = async (req, res,next) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get the page number from query params
        const limit =8; // Number of products per page
        const skip = (page - 1) * limit;

        const query = { status: true };

        const [productData, totalProducts, category] = await Promise.all([
            Product.find(query)
                .populate('category_id')
                .skip(skip)
                .limit(limit)
                .exec(),
            Product.countDocuments(query).exec(),
            Category.find({ Listed: true })
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        const categoryCounts = await Product.aggregate([
            { $match: query },
            { $group: { _id: '$category_id', count: { $sum: 1 } } },
            { $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category'
            }},
            { $unwind: '$category' },
            { $project: { _id: 0, categoryId: '$_id', categoryName: '$category.name', count: 1 } }
        ]).exec();

        const categoryCountMap = categoryCounts.reduce((map, obj) => {
            map[obj.categoryId] = obj.count;
            return map;
        }, {});

        const data = {
            productData,
            category,
            totalProducts,
            currentPage: page,
            totalPages,
            categoryCountMap
        };

        if (req.session.user) {
            data.userlogdata = req.session.user;
        }

        res.render('Shop', data);
    } catch (error) {
        next(error)
    }
}

// const sortAndFilter = async (req, res) => {

//     try {
//         const { sortby, Price, } = req.body;

//         if (sortby && Price) {
//             const sortedByPrice = await Product.find({ status: true }).sort({ price: sortby })
//             res.send(sortedByPrice)
//         }
//         else if (sortby) {
//             const sortedByName = await Product.find({ status: true }).sort({ name: sortby })
//             console.log(sortby, sortedByName, 'kittin')
//             res.send(sortedByName);
//         } else {
//             const products = await Product.find()
//             res.send(products)

//         }
//     } catch (error) {
//         // next(error,req,res);
//         console.log(error.meassage);


//     }

// };

const sortAndFilterAndSearch = async (req, res,next) => {
    try {

        const { categoryVal, searchQuery, max, min, selectedSort, page = 1 } = req.body
        const limit = 8; // Number of products per page
        const skip = (page - 1) * limit;

        let sortCriteria = {};
        let aAzZ = null
        let zZaA = null
        let LowToHigh = null
        let HighToLow = null
        if (selectedSort === 'AtoZ') {
            sortCriteria = { name: 1 };
            aAzZ = await Product.find().sort(sortCriteria).skip(skip).limit(limit)
        } else if (selectedSort === 'ZtoA') {
            sortCriteria = { name: -1 };
            zZaA = await Product.find().sort(sortCriteria).skip(skip).limit(limit)
        } else if (selectedSort === 'LowToHigh') {
            sortCriteria = { price: 1 };
            LowToHigh = await Product.find().sort(sortCriteria).skip(skip).limit(limit)
        } else if (selectedSort === 'HighToLow') {
            sortCriteria = { price: -1 };
            HighToLow = await Product.find().sort(sortCriteria).skip(skip).limit(limit)
        }

        let productData;
        let totalProducts;

        if (!categoryVal.length == 0 && searchQuery) {
            const search = new RegExp(`.*${searchQuery}.*`, 'i');

            [productData, totalProducts] = await Promise.all([
                Product.find({
                    'category_id': { $in: categoryVal },
                    status: true,
                    $or: [
                        { name: search },
                        { price: Number(searchQuery) || undefined },
                    ],
                }).sort(sortCriteria).skip(skip).limit(limit),
                Product.countDocuments({
                    'category_id': { $in: categoryVal },
                    status: true,
                    $or: [
                        { name: search },
                        { price: Number(searchQuery) || undefined },
                    ],
                })
            ]);
        }
        else if (!categoryVal.length == 0) {
            if (max) {
                [productData, totalProducts] = await Promise.all([
                    Product.find({ 'category_id': { $in: categoryVal }, status: true, price: { $gte: min, $lte: max } }).sort(sortCriteria).skip(skip).limit(limit),
                    Product.countDocuments({ 'category_id': { $in: categoryVal }, status: true, price: { $gte: min, $lte: max } })
                ]);
            } else {
                [productData, totalProducts] = await Promise.all([
                    Product.find({ 'category_id': { $in: categoryVal }, status: true }).sort(sortCriteria).skip(skip).limit(limit),
                    Product.countDocuments({ 'category_id': { $in: categoryVal }, status: true })
                ]);
            }
        } else if (max) {
            [productData, totalProducts] = await Promise.all([
                Product.find({ price: { $gte: min, $lte: max } }).sort(sortCriteria).skip(skip).limit(limit),
                Product.countDocuments({ price: { $gte: min, $lte: max } })
            ]);
        }
        else {
            const search = new RegExp(`.*${searchQuery}.*`, 'i');
            [productData, totalProducts] = await Promise.all([
                Product.find({ $and: [{ $or: [{ name: { $regex: search } },] }, { status: true }] }).sort(sortCriteria).skip(skip).limit(limit),
                Product.countDocuments({ $and: [{ $or: [{ name: { $regex: search } },] }, { status: true }] })
            ]);
            
            if (productData.length === 0) {
                if (aAzZ) {
                    productData = aAzZ;
                    totalProducts = await Product.countDocuments();
                } else if (zZaA) {
                    productData = zZaA;
                    totalProducts = await Product.countDocuments();
                } else if (LowToHigh) {
                    productData = LowToHigh;
                    totalProducts = await Product.countDocuments();
                } else if (HighToLow) {
                    productData = HighToLow;
                    totalProducts = await Product.countDocuments();
                } else if (typeof Number(searchQuery) === 'number' && !isNaN(searchQuery)) {
                    [productData, totalProducts] = await Promise.all([
                        Product.find({ price: Number(searchQuery) }).skip(skip).limit(limit),
                        Product.countDocuments({ price: Number(searchQuery) })
                    ]);
                }
            }
        }

        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            productData,
            currentPage: parseInt(page),
            totalPages,
            totalProducts
        });

    } catch (error) {
       next(error)
    }
}

    

module.exports = {
    loadShop,
    sortAndFilterAndSearch,
    
}
