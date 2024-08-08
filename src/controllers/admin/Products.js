
const Product = require('../../model/products_model.js')
const Category = require('../../model/category_model.js')

const fs = require("fs");

const path = require("path");


const loadProducts=async(req,res,next)=>{
    
    try {
    
            let page = parseInt(req.query.page)||1
            let limit = 10
            let skip = (page-1)*limit
        const [products,productsCount] = await Promise.all([
            Product.find({}).populate('category_id').skip(skip).limit(limit),
            Product.countDocuments({})
        ])
        let totalPages = productsCount/limit

        const messages = req.flash('swal')
       
        res.render('Products',{
            products,
            messages,
            totalPages,
            currentPage:page,
            skip
        })
   
    } catch (error) {

        next(error)
    }
}

const loadAddProducts = async(req,res,next)=>{
    try {

        const category = await Category.find({ Listed: true })

       

        res.render('Add_Products',{category})

    } catch (error) {
        next(error)
    }
}

const addProducts = async(req , res , next)=>{

    try {

        let {name,price,category_name,stock,radio,discription,discount} = req.body;
        if(!discount){
            discount=0
        }
        console.log(discount)
        const offerPrice = Math.round((price / 100) * (100 - discount));
        
        let img = [];
        const images = req.files;

        // console.log(images);

        images.forEach((file) => {
            
            img.push(file.filename);

        });

       const category= await Category.findOne({name:category_name})
        
        const productData =await Product.create({
            

            name:name.trim(),
            description: discription,
            price : price,
            category_id : category._id,
            status: radio,
            stock:stock,
            discount_price: offerPrice,
            discount:discount ,
            images : img,
        })

        

        if(productData){
           
            req.flash('swal','product added')
            res.redirect('/admin/products')
 
            
        }

        
        
    } catch (error) {

        next(error)
        
    }

}

const productAction = async(req,res,next)=>{
    try {
        const productId = req.query.id
        const productData = await Product.findOne({ _id: productId });

        productData.status = !productData.status;

        productData.save();
        
        req.flash('message', `SORRY. '${productData.name}' PLANT IS OUT OF STOCK`);
        res.send({set : true});
        

    } catch (error) {
        next()
    }
}

const loadEditProduct = async(req,res,next)=>{
    try {

        const productId = req.query.id

        const productData = await Product.findOne({_id:productId})

        const currentCategory = await Category.findOne({_id:productData.category_id})

        const category = await Category.find({ Listed: true,_id: { $ne: productData.category_id} })

        res.render('Edit_product',{productData,category,currentCategory})

    } catch (error) {

        next(error)
    }
}

const editProduct = async (req, res,next) => {
    try {
        const productId = req.params.id;
        const editProductt = await Product.findOne({ _id: productId });

        let { name, price, stock, discription,category_name,discount } = req.body;
        console.log(req.body)
        if(!discount){
            discount=0
        }
        console.log(discount)
        const offerPrice = Math.round((price / 100) * (100 - discount));
        

        let category_id
        if(category_name){
            category_id = await Category.findOne({name:category_name},{_id:1})
        }
      console.log(category_id)

        let imag = [];

        for (let i = 0; i < 3; i++) {
            const key = `k${i}`;

            if (req.body[key]) {
                imag.push(editProductt.images[i]);
            } else {
                imag.push(req.files[`image${i}`][0].filename);
                const imagePath = path.join(__dirname, '../../assets/productImages', editProductt.images[i]);
                
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                } else {
                    console.warn(`File not found: ${imagePath}`);
                }
            }
        }

        editProductt.images = imag;

        await Product.findOneAndUpdate({ _id: productId }, {
            $set: {
                name: name.trim(),
                price: price,
                stock: stock,
                category_id: category_id,
                description: discription,
                discount_price: offerPrice,
                discount:discount
            }
        });

        req.flash('swal', "product eddited");
        await editProductt.save();
        res.redirect("/admin/products");
        console.log('product eddited');
    } catch (error) {
        next(error)
    }
};

module.exports={
    loadProducts,
    loadAddProducts,
    addProducts,
    productAction,
    loadEditProduct,
    editProduct
}
