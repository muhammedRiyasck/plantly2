const Category=require('../../model/category_model')

const loadCategory=async(req,res,next)=>{
    try {
        const page = parseInt(req.query.page)||1
        const limit = 4
        const skip = (page-1)*limit

        const [category,categoryCount] = await Promise.all([
            Category.find({}).skip(skip).limit(limit),
            Category.countDocuments()
        ])   
        const totalPages = Math.ceil(categoryCount/limit)

        const messages =req.flash('flash')      

        res.render('Category' , {
            category,
            messages,
            totalPages,
            currentPages:page,
            skip
        })
    } catch (error) {
        next(error)
    }
}

const addCategory=async(req,res,next)=>{

    try {
        
        const categoryName = req.body.name
        const radio = req.body.radio

        const category = await Category.findOne({name : {$regex: new RegExp('^' + categoryName + '$','i')}})

        if(!category){

            const data = new Category({

                name : categoryName,
                is_Listed : radio

            })

            data.save()

            if(data){

                req.flash('flash' , "goood")
                res.redirect('/admin/category')

            }

    }else{

        req.flash('flash','bad')
        res.redirect('/admin/category')
    }
   
 }
catch (error) {

    next(error)
}
  
}

const categoryAction = async(req , res,next)=>{
   
    try {
        
        const categoryId = req.body.id
    
        const findCategory = await Category.findOne({_id:categoryId})
        
        findCategory.Listed = !findCategory.Listed;
    
        findCategory.save()
    } catch (error) {
        next(error)
    }

}

const categoryDelete = async(req,res,next)=>{
    try {
        
        const userId = req.query.userId
       
        const deleteCategory = await Category.deleteOne({_id:userId})
       
         console.log(deleteCategory)
       
           if(deleteCategory){
       
               res.send({succ:true})
             
           }
    } catch (error) {
         next(error)
    }

}

const categoryEdit = async (req, res , next) => {
    
    try {

        const id = req.body.CateID

        const CategoryName = req.body.name

        const category = await Category.findOne({name : {$regex: new RegExp('^' + CategoryName+ '$','i')}})

        if(!category){

            const categoryDataa = await Category.findByIdAndUpdate({ _id: id }, { $set: { name: CategoryName } });

            categoryDataa.save();
            req.flash('flash','good')
            res.redirect('/admin/category')

        }else{

            req.flash('flash' , 'bad')
            res.redirect('/admin/category')

        }
    } catch (error) {

        next(error,req,res);
        
    }

};

const valSett = async(req , res,next)=>{

    try {

        const cId = req.query.id

        const cate = await Category.findOne({_id : cId});

        if(cate){

            res.send({succ : cate})

        }
        
    } catch (error) {

        next(error)
        
    }

}

module.exports={
    loadCategory,
    addCategory,
    categoryAction,
    categoryDelete,
    categoryEdit,
    valSett

}
