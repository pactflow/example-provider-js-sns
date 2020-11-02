const router = require('express').Router();
const controller = require('./product.controller');

router.post("/products", controller.create);
router.put("/products/:id", controller.update);
router.delete("/products/:id", controller.delete);

module.exports = router;