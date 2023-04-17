const express = require("express");
const {} = require("../controllers/orderController");
const order = express.Router();
//cart controllers imported
const {
  createOrder,
  viewOrders,
  cancelOrder,
  paymentDetails,
  sellerOrders,
  updateOrderStatus
} = require("../controllers/orderController");
/* create - create order*/
order.post("/", createOrder);
/* Read - GET method  for all viewing orders*/
order.get("/:id", viewOrders);
/* Read - GET method  for getting order of seller  */
order.get("/seller/:id", sellerOrders);
/* update - update order status from seller*/
order.patch('/seller', updateOrderStatus)
// cancel order by user
order.delete("/", cancelOrder);
/* create - create payment*/
order.post("/pay", paymentDetails);
module.exports = order;
