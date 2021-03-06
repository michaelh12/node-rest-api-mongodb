const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('./middleware/check-auth');
const ProductsController = require('../controllers/products');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})




const fileFilter = (req, file, cb) => {
    //reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false)
    }
};

const upload = multer({
    storage: storage, limits: {
        fileSize: 1024 * 1024 * 5
    }, fileFilter: fileFilter
});



const Product = require('../models/product');

router.get('/', checkAuth, ProductsController.products_get_all);



router.post('/', checkAuth, upload.single('productImage'), async (req, res, next) => {
    console.log(req.file);
    const name = req.body.name;
    const price = req.body.price;
    // console.log("HELLOOO!")
    console.log(req.file.path)
    try {
        const product = new Product({
            _id: new mongoose.Types.ObjectId(),
            name: name,
            price: price,
            productImage: 'http://localhost:3000' + req.file.destination.slice(1) + req.file.filename
        });

        let result = await product.save()
        console.log(result);
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                productImage: result.productImage,
            },
            request: {
                type: 'GET',
                url: `http://localhost:3000/products/${result._id}`
            }
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }



    //     product.save().then(result => {
    //         console.log(result);
    //         return result;
    //     }).then((result) => {
    //         res.status(201).json({
    //             message: 'Handling GET requests to /products',
    //             createdProduct: result
    //         })
    //     })
    //         .catch(err => {
    //             console.log(err);
    //             res.status(500).json({
    //                 error: err
    //             });
    //         })

    // } catch (err) {
    //     console.log(err);
    //     res.status(500).json({
    //         error: err
    //     });
    // }



})

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    // if (id === 'special') {
    //     res.status(201).json({
    //         message: 'You discovered the special ID',
    //         id: id
    //     })
    // } else {
    //     res.status(200).json({
    //         message: 'You passed an ID'
    //     })
    // }
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log(`from database ${doc}`);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products' + doc._id
                    }
                });
            } else {
                res.status(404).json({
                    message: "No valid entry found for provided ID"
                })
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
})

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (let ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Product.update({
        _id: id
    }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product updated!',
                request: {

                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }

            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: err
            })
        })

    // res.status(200).json({
    //     message: 'updated producet!'
    // })
})

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({
        _id: id
    }).exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products',
                    data: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                err
            })
        })

    // res.status(200).json({
    //     message: 'delted product!'
    // })
})


module.exports = router;