const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

mongoose.connect(`mongodb+srv://${process.env.MONGOOSE_LOGIN}@node-rest-shop-w316j.mongodb.net/test?retryWrites=true`, { useNewUrlParser: true });


app.use(morgan('dev'), bodyParser.urlencoded({ extended: false }), bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH, DELTE, GET');
        return res.status(200).json({});
    }
    next();
});

//Routes which should handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

//Route to handle all other requests
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status - 404;
    next(error);
}, (error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

// app.use((error, req, res, next) => {
//     res.status(error.status || 500);
//     res.json({
//         error: {
//             message: error.message
//         }
//     })
// })


module.exports = app;