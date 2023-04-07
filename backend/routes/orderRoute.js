const express = require("express");
const {} = require("../controllers/orderController");
const order = express.Router();
//cart controllers imported
const {
  createOrder,
  viewOrders,
  cancelOrder,
  paymentDetails,
} = require("../controllers/orderController");
/* create - create order*/
order.post("/", createOrder);
/* Read - GET method  for all viewing orders*/
order.get("/:id", viewOrders);
// /* update - update product from user cart here we update quantity of product*/
// cart.patch('/:id', updateProduct)
// cancel order by user
order.delete("/", cancelOrder);
/* create - create payment*/
order.post("/pay", paymentDetails);
module.exports = order;
