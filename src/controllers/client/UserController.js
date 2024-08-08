
const User = require('../../model/user_model')
const otp = require('../../model/otp_model')
const Product = require('../../model/products_model')//category poppulating
const Wallet = require('../../model/wallet_model')
const otp_generator = require('otp-generator');
const generateOTP = require('../../helpers/generateOtp')
const securePassword = require('../../helpers/securePassword')
const sendOTPmail = require('../../utilities/nodemailer')
const Order=require('../../model/order_model')
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';


// const validation = require('../../model/validation_Schema') 

const bcrypt = require('bcrypt')
const session = require('express-session')

const loadHome = async (req, res,next) => {

    try {

        if (req.session.user) {

            res.render('Home' , {userlogdata : req.session.user})

        } else {
          res.render('Home')

        }
        
    } catch (error) {
    
       next(error)
    }
}

const loadBlog=async(req,res,next)=>{
    try{
        if(req.session.user){

            res.render('Blog' , {userlogdata : req.session.user})


        } else {

            res.render('Blog')

        }
    }catch(error){
        next(error)
    }
}

const loadAbout=async (req,res,next)=>{
    try {
        if(req.session.user){

            res.render('About' , {userlogdata : req.session.user})
        } else {
            res.render('About')
        }
    } catch (error) {
        next(error)
    }
}

const loadContactUs=async(req,res,next)=>{
    try {
        if(req.session.user){

            res.render('Contact' , {userlogdata : req.session.user})
        } else {

            res.render('Contact')

        }
    } catch (error) {
        next(error)
    }
    
}

const loadLogin = async(req,res,next)=>{
    try {
        const message = req.flash('message')
        const swal = req.flash('swal')
        const email = req.flash('email')

        delete req.session.otp
        
        res.render('Login',{message,email,swal})
        
    } catch (error) {
        next(error)
    }
   
}

const loadRegisteration = async(req,res,next)=>{
    try {
        const msg=req.flash('msg')
        res.render('Registration',{msg})
    } catch (error) {
        next(error)
    }
   
}

const loadForgetPassword = async(req,res,next)=>{
    try {
        let message = req.flash('message')
        res.render('ForgotPassword',{message})
    } catch (error) {
        next(error)
    }
    
}

const loadResetPassword = async(req,res,next)=>{
    try {
        const message = req.flash('message')
        const email = req.query.email || req.session.user.email
        const changePassword = req.query.change || null
        console.log(email,'email setdded to body')
        res.render('ResetPassword',{message,email,changePassword})
    } catch (error) {
        next(error)
    }
}

const loadSingleBlog = async(req,res,next)=>{
    try {
        res.render('SingleBlog') 
    } catch (error) {
        next(error,req,res)
    }
}

const loadSingleProduct = async(req,res,next)=>{
    try {
        const id = req.query.id

        const singleProduct = await Product.findOne({_id:id,status:true}).populate('category_id')
        if(singleProduct){
            
            res.render('SingleProduct',{singleProduct,userlogdata:req.session.user})
        }else{
            
            res.redirect('/shop')
        }
       
    } catch (error) {
        next(error)
    }
    
}

const loadOtp = async(req,res,next)=>{

    try {

        if(req.session.otp){

        const emailQuery = req.query.email;
        
        const token = req.query.token || null;
        console.log('tokken ',token)
        const time = req.query.time || null

        const otpError = req.flash('otpError')

        res.render('Otp' , {emailQuery,otpError,time,token})

        }else{
            res.redirect('/registration')
        }
        
    } catch (error) {

        next(error)

    }

}

const loadWallet = async (req, res, next) => {
    try {
        if (req.session.user) {
            const page = parseInt(req.query.page) || 1;
            const limit = 10; // Number of transactions per page

            const walletData = await Wallet.findOne({ user_id: req.session.user._id });

            if (walletData) {
                const totalTransactions = walletData.transaction.length;
                const totalPages = Math.ceil(totalTransactions / limit);

                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;

                const paginatedTransactions = walletData.transaction.slice().reverse().slice(startIndex, endIndex);

                res.render('Wallet', {
                    userlogdata: req.session.user,
                    walletData: {
                        ...walletData.toObject(),
                        transaction: paginatedTransactions
                    },
                    currentPage: page,
                    totalPages: totalPages,
                    startIndex
                });
            } else {
                res.render('Wallet', {
                    userlogdata: req.session.user,
                    walletData: null,
                    currentPage: 1,
                    totalPages: 1,
                });
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        next(error, req, res);
    }
};


const existEmail = async(req,res,next)=>{
   
    const user = await User.findOne({email:req.body.email})

    if(user) {
        
     
        res.send({exist:true});}
    else {
     
        res.send({exist:false});}

}

const validateRefferral = async(req,res,next)=>{
    try {
        const refferal_code = req.body.refferal_code
        const query = req.query.id
        const findRefferalCode = await User.findOne({refferal:query})
        if(findRefferalCode){
            res.json({success:true,refferedUser:findRefferalCode.fullName})
        }else{
            res.json({success:false})
        }
    } catch (error) {
        next(error)
    }
}

const insertUser = async (req, res, next) => {
    
    try {
        
        // --------------joi validation---------------------------------
        
        // const value = await validation.Registration.validateAsync(req.body)
       //const bodyEmail = value.email;
       
       
       const {name,email,mobile,password,c_password,refferal_code:ref_c} = req.body
       const generateReferralCode = customAlphabet(alphabet, 16);
       const refferal_code = generateReferralCode()
       console.log(refferal_code)
        const user = new User({
            
            fullName: name,
            email: email,
            mobile: mobile,
            password: password,
            is_admin: false,
            is_blocked: false,
            is_verified:false,
            refferal : refferal_code
            
        });
        
        req.session.ref_c=ref_c;
        req.session.UserData = user;
        
        if (password == c_password) {
            
            if (req.session.UserData) {

            const OTP = generateOTP();
            console.log(OTP,'user otp')
            req.session.otp = OTP

            let content = 'Welcome To plantly'
         
            await sendOTPmail(name, email, OTP,req, content); // passing data as argument
            
            let createdAt =req.session.time
           
            let time = 180//180

            res.redirect(`/otp?email=${email}&time=${createdAt}&existing=${time}`);

  
            setTimeout(async () => {

              await otp.findOneAndDelete({ otp: req.session.otp });
              console.log('first otp deleted')
            },180000  );//180000 

          } else {

            res.redirect("/registration");

          }

        } else {

          req.flash("passflash", "password not match");
          
          res.redirect("/registration");

        }

      } catch (error) {

      next(error)

    }

  };

const verifyOtp=async(req,res,next)=>{

    try {

        const getQueryEMail = req.body.email;
        const getToken = req.body.token
        const userSession = req.session.UserData  //  Assign Session in Variable
     
        const bodyOtp = req.body.inp1 + req.body.inp2 + req.body.inp3 + req.body.inp4;

        if (getToken && getQueryEMail) {
            
            const verifyForgotEmail = await otp.findOne({ otp: bodyOtp, emailId: getQueryEMail });
            
            if (verifyForgotEmail) {
                
                res.redirect(`/resetPassword?email=${getQueryEMail}`);

            } else {
                let time = 60
                req.flash('otpError', "Invalid OTP");
                res.redirect(`/otp?email=${getQueryEMail}&&token=${getToken}&&time=${req.session.time}&&existing=${time}`);

            }

        } else {
            
            const verifiedOtp = await otp.findOne({ otp: bodyOtp, emailId: getQueryEMail });

            if (verifiedOtp) {
                
                if (userSession.email == getQueryEMail) {
               console.log('instert user worked')
               console.log(req.session.UserData.password)
                    // console.log('nested inside to it'+userSession.password)
                    const hashPassword = await securePassword(req.session.UserData.password);
                  
                    const userSessionData = new User({  

                        fullName: req.session.UserData.fullName,
                        email: req.session.UserData.email,
                        mobile: req.session.UserData.mobile,
                        password: hashPassword,
                        is_admin: false,
                        is_blocked: false,
                        refferal:req.session.UserData.refferal
                        
                    });

                  await userSessionData.save();
                  if(req.session.ref_c){
                    console.log('inddiii')
                    const user=await User.findOne({refferal:req.session.ref_c});
                    if(user){
                        console.log(user);
                        
                        console.log('ullkum kerri')
                        const transaction=[{amount:50,creditOrDebit:'credit'}]
                        await Wallet.findOneAndUpdate({user_id:user._id},{$inc:{balance:50},$push:{transaction}},{new:true,upsert:true})
                    }
                  }

                    // req.session.otp = undefined;    //  Deleting The otp after login user

                    req.session.user = userSessionData; //  Save User Data in Session (Orginal)

                    await User.findByIdAndUpdate({ _id: userSessionData._id }, { $set: { is_verified: true } });

                    req.flash("otpError", "Verified Successfully");    //  Sweet Alert
                    res.redirect('/home');
                    
                }
                
            } else {
                const time = 180
                req.flash('otpError', "Invalid OTP");      //  Sweet Alert
                res.redirect(`/otp?email=${getQueryEMail}&time=${req.session.time}&existing=${time}`);

            }

        }

    } catch (error) {

       next(error)

        
    }

};

const ResendOtp = async (req, res ,next ) => {
    
    try {

        const queryEmaill = req.query.email;   //  Query Email

        const user = await User.findOne({ email: queryEmaill });     //Finding Data

          console.log(req.session.token)

        if (req.session.token) {

            if(user){
            const generatedotp = generateOTP();

            req.session.otp = generatedotp
            console.log(generatedotp + " Forgott Re-send Otp");
        
        let content = 'We received a request for resent OTP';
        
        // req.session.saveUser.fullName || req.session.user.name
        
        await sendOTPmail( user.fullName , user.email ,generatedotp , req, content,req.session.token);

        setTimeout(async () => {   

            await otp.findOneAndDelete({ otp: req.session.otp });
                
        }, 60000);

        let createdAt = Date.now()
        let token = req.session.token
        let time = 60;//60
    
        res.redirect(`/otp?email=${user.email}&time=${createdAt}&existing=${time}&token=${token}`);
      }else{
        // req.flash('passError','Invalid OTP')
        console.log('something went wrong in resent password , user not existing in dbs')//never happen
        res.redirect(`/otp?email=${user.email}&time=${createdAt}&existing=${time}&token=${token}`);
      }
       
   }else{
            let createdAt = Date.now()
         
            let time = 60;

        let content = 'We received a request for resent OTP';
        
            const user = req.session.UserData;  //  Session User Data
            // console.log('resent',user)
            const generatedotp = generateOTP();
                
            console.log(generatedotp + " Re-send Otp");

            req.session.otp = generatedotp

            await sendOTPmail(user.fullName, user.email, generatedotp, req,content );
            
            setTimeout(async () => {    //  This One also Deleting the Otp in Dbs 
                
                await otp.findOneAndDelete({ otp: req.session.otp });
                console.log('resend otp deleted')
            }, 60000);
           
            res.redirect(`/otp?email=${user.email}&time=${createdAt}&existing=${time}`);
        }
    }
    catch (error) {

        next(error)
        
    }

};

const verifyLogin = async (req, res, next) => {
    
    try {
        const Email = req.body.email;
        const Password = req.body.password;

        const userDataa = await User.findOne({ email: Email });


        if (userDataa && ( userDataa.is_blocked == false ) && (userDataa.is_admin == false)) {

            const passMatch = await bcrypt.compare(Password, userDataa.password);

            if(passMatch ) {

                req.session.user = userDataa; //  Add User Data in the dbs to session
                
                res.redirect('/home');
            

            } else {

            const email = req.body.email

            req.flash('email',email)

                req.flash('message', "Incorrect username or password entered. Please try again");      //  Password Wrong (Flash)

                res.redirect('/login');

            } 

        }
        
        else if(userDataa && ( userDataa.is_blocked == true ) && (userDataa.is_admin == false)){

            req.flash('message','Your account has been blocked by an administrator.')

            res.redirect('/login')

        }

        else {
            
            const email = req.body.email

            req.flash('email',email)

            req.flash('message','Incorrect username or password entered Please try again')

            res.redirect('/login');

        }

    } catch (error) {

        next(error)
        
    }
};



const forgetPassword = async(req,res,next)=>{
    try {

        const email = req.body.email
        
        const user = await User.findOne({email:email,is_admin:false})
       
        req.session.forgetUserData = user
        
        if(user){
         
            
            const Otp = generateOTP()

            req.session.otp = Otp
            // console.log('email geted',email )
            const token = otp_generator.generate(8)
            req.session.token = token
            // console.log(token,req.session.token,'form forgetpassword')
            
            let content = 'We received a request to reset your password'
            
            // req.flash('message','A One Time OTP Sended To your Mail')
            sendOTPmail(user.fullName,user.email,Otp,req,content)
            
            let createdAt = req.session.time
            let time = 60 //60
            
            setTimeout(async() => {
                await otp.findOneAndDelete({otp:req.session.otp})
                
                console.log(req.session.otp+ ' ' + "forget password otp deleted from dbs")
            },60000 );//60000
            
            res.redirect(`/otp?email=${email}&time=${createdAt}&existing=${time}&token=${token}`);

    
        }else{
            req.flash('message','*The email address you entered is not associated with any account. Please try again.*')
            res.redirect('/forgotPassword')
        } 

    } catch (error) {
        next(error)
    }
}

const ResetPassword = async(req,res,next)=>{
    try {
        
        if(req.body.password === req.body.confirm_password){

            const email = req.body.email
            let passwordd = await securePassword(req.body.password)
            console.log(email,'restpassword')
            
            const user = await User.findOneAndUpdate({email:email},{$set:{
                password :passwordd

            }})

            if(user){

            console.log('password updated')

            req.flash('swal','password updated')

            res.redirect('/login')

            }else{

                req.flash('message','something went wrong')
               return res.redirect('/restPassword')

            }
        }else{

            req.flash('message','your password and confirm password is missmatch')
            res.redirect('/resetPassword')

        }

    } catch (error) {
        nextt(error)
    }
}

const loadSuccess = async(req,res,next)=>{
    try {
        res.render('Payment_Success')
    } catch (error) {
        console.log(error.message)
    }
}
const loadFailurePage= async(req,res,next)=>{
    try {
        let order_Id = req.session.user.order_Id
        let amount = req.session.user.amount
        res.render('Payment_Failuer',{order_Id,amount})
    } catch (error) {
        next(error)
    }
}



const invoice=async(req,res,next)=>{
    try{
        const {id}=req.params;
        const orderData=await Order.find({_id:id}).populate('products.product_id user_id');
        res.render('Purchase_Invoice',{orderData})
    }catch(err){
        console.log(err.message)
        next(err.message,req,res)
    }
}

const logout = async(req , res , next)=>{

    try {

        req.session.user = undefined
        req.flash('message', "Logout Successfully...")
        res.redirect('/login')
        
    } catch (error) {
        
        next(error)

    }

}


module.exports = {
    loadHome,
    loadBlog,
    loadAbout,
    loadContactUs,
    loadLogin,
    loadRegisteration,
    loadForgetPassword,
    loadResetPassword,
    loadSingleBlog,
    loadSingleProduct,
    loadOtp,
    validateRefferral,
    insertUser,
    verifyOtp,
    ResendOtp,
    verifyLogin,
    forgetPassword,
    ResetPassword,
    logout,
    existEmail,
    loadSuccess,
    loadFailurePage,
    loadWallet,
    invoice
    
   
}
