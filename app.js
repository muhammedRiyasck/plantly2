
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');
const nocache = require('nocache');

require('dotenv').config()

const userRoute = require('./src/routes/client/userRouter');
const adminRoute = require('./src/routes/admin/adminRouter');
const googleAuth = require('./src/utilities/googleAuth');
const customError = require('./src/utilities/error_handling')
const golobalErrorHandler = require('./src/utilities/errorController')

const mongoose = require('mongoose');
const { number } = require('joi');
mongoose.connect(process.env.MONGO_URL);
const port = process.env.PORT

app.set('views', path.join(__dirname, '/src/views/client'));
app.set('view engine', 'ejs');

app.use("/assets", express.static(path.join(__dirname, '/src/public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(nocache())
app.use(flash());
app.use(session({

    secret: '$%#',
    resave: false,
    saveUninitialized: true

}))

app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use('/', googleAuth);



app.all('*', (req, res, next) => {
    // res.render('../404')
    const err = new customError(`Can't find ${req.originalUrl} on the server!`,404)
    next(err)
})

app.use(golobalErrorHandler)

app.listen(4000, () => {
    console.log(`Server is running on http://localhost:${port}`);
});





