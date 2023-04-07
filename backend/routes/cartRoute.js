const express = require("express");
const cart = express.Router();
//cart controllers imported
const {createCart,getAllProductFromCart,deleteCartProduct} = require("../controllers/cartController");
/* create - create user cart*/
cart.post('/', createCart)
//  /* Read - GET method  for all cart data of user*/
cart.get('/:id', getAllProductFromCart)
/* delete -single product from user cart*/
cart.delete('/', deleteCartProduct)


module.exports = cart;
