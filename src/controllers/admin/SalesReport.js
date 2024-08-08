const Order = require('../../model/order_model');

//  Sales Report (Get Method) :-  

const loadReport = async (req, res, next) => {

    try {

        const reportVal = req.params.id;
        console.log(reportVal)
        if (reportVal == "Week") {

            const crrDate = new Date();

            const weeStart = new Date(

                crrDate.getFullYear(),
                crrDate.getMonth(),
                crrDate.getDate() - crrDate.getDay()

            );

            const weekEnd = new Date(weeStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            console.log(weeStart, weekEnd);

            const report = await Order.find({ orderDate: { $gte: weeStart, $lte: weekEnd }, products: { $elemMatch: { productStatus: 'delivered' } } });

            console.log(report);

            res.render("SalesReport", { report, data: "Week", reportVal: req.params.id });

        } else if (reportVal == "Month") {

            const crrDate = new Date();
            const crrMonth = crrDate.getMonth();
            const startDate = new Date(crrDate.getFullYear(), crrMonth);
            const endDate = new Date(crrDate.getFullYear(), crrMonth + 1, 0);

            const report = await Order.find({ orderDate: { $gte: startDate, $lte: endDate }, products: { $elemMatch: { productStatus: 'delivered' } } });
            res.render("SalesReport", { report, data: "Month", reportVal: req.params.id, });

        } else if (reportVal == "Year") {

            const crrDate = new Date();
            const yearStart = new Date(crrDate.getFullYear(), 0, 1);
            const yearEnd = new Date(crrDate.getFullYear() + 1, 0, 0);

            const report = await Order.find({ orderDate: { $gte: yearStart, $lte: yearEnd }, products: { $elemMatch: { productStatus: 'delivered' } } });

            res.render("SalesReport", { report, data: "Year", reportVal: req.params.id });

        } else if ((reportVal == "Custom")) {

            res.render("SalesReport", {

                custom: true,
                reportVal: req.params.id,
                data: "costum",

            });

        } else {

            res.redirect("/admin");
        }

    } catch (error) {

        next(error, req, res);

    }

};

//  Sales Custom Report :-

const customReport = async (req, res, next) => {

    try {

        const startDate = new Date(req.body.startDatee);

        const endDate = new Date(req.body.endDatee);
        console.log(startDate, endDate);

        const getData = await Order.find({ orderDate: { $gte: startDate, $lte: endDate },'products.productStatus':'delivered' });
        console.log(getData);
        
        res.send({ getData });

    } catch (error) {
console.log(error.message);

        next(error, req, res);

    }

};

module.exports = {

    loadReport,
    customReport

};
