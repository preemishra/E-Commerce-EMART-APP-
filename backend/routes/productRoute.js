const express = require("express");
const product = express.Router();
//product controllers imported
const {
  getAll,
  getSingle,
  getAllByPagination,
  searchProduct,
  createProduct,
  deleteProduct,
  getSellerProducts,
  editProduct
} = require("../controllers/productController");
/* Read - GET method  for all data*/
product.get("/", getAll);
/* Read - GET method  for single product*/
product.get("/:id", getSingle);
/* Read - GET method  for all pagination data*/
// product.get('/data', getAllByPagination)
/* Read - GET method  for searched product */
product.get("/search/:name", searchProduct);
/* create - seller product*/
product.post("/", createProduct);
/* Read - GET method  for all data*/
product.get("/seller/:id", getSellerProducts);
product.delete("/:id", deleteProduct);
product.patch("/seller/edit/:productId", editProduct);
module.exports = product;
