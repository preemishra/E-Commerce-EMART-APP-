const {
  getAllProduct,
  getSingleProduct,
  getAllProductByPagination,
  searchProduct,
  createProductServices,
  deleteProductService,
  getSellerProductsService,
  editProductService,
} = require("../services/productService");
//get all products for getting all products with name,price and img
const Validation = require("../utils/validations");
const validationClass = new Validation.Validation();

exports.getAll = async (req, res, next) => {
  if (req.query.page === undefined) {
    try {
      let products = await getAllProduct();
      return res.status(200).json({
        status: true,
        data: products,
        message: "Successfully product Retrieved",
      });
    } catch (e) {
      return res.status(500).json({ status: false, message: e.message });
    }
  } else {
    try {
      let products = await getAllProductByPagination(
        req.query.page,
        req.query.limit
      );
      return res.status(200).json({
        status: true,
        data: products,
        message: "Succesfully product Retrieved",
      });
    } catch (e) {
      return res.status(500).json({ status: false, message: e.message });
    }
  }
};

//get single products
exports.getSingle = async (req, res, next) => {
  let id = req.params.id;
  try {
    let products = await getSingleProduct(id);
    return res.status(200).json({
      status: true,
      data: products,
      message: "Successfully product Retrieved",
    });
  } catch (e) {
    return res.status(500).json({ status: false, message: e.message });
  }
};

//get searched product
exports.searchProduct = async (req, res, next) => {
  let searchByName = req.params.name;
  try {
    if (searchByName === "") {
      return res.status(400).send("please enter valid search input");
    } else {
      let products = await searchProduct(searchByName);
      if (products.length === 0) {
        return res.status(404).json({
          status: false,
          data: products,
          message: "No searched item found",
        });
      } else {
        return res.status(200).json({
          status: true,
          data: products,
          message: "Succesfully product Retrieved",
        });
      }
    }
  } catch (e) {
    return res.status(500).json({ status: false, message: e.message });
  }
};

//create user cart here we added data in cart and cart details model
exports.createProduct = async (req, res, next) => {
  try {
    const body = await req.body;
    if (await validationClass.validateProductBody(body)) {
      return res.status(400).send("please enter valid user details");
    } else {
      const productResp = await createProductServices(body);
      if (productResp.success === true) {
        return res.status(200).json({
          status: true,
          data: productResp,
          message: `product created successfully with product id is ${productResp.data.product_id}`,
        });
      } else {
        return res.status(400).json({
          status: false,
          message: productResp,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error });
  }
};

exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const deleteProduct = await deleteProductService(id);
    if (deleteProduct) {
      return res
        .status(200)
        .json({ status: true, message: "Successfully Deleted Product" });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Product delete failed" });
    }
  } catch (error) {
    return res.status(500).json({ status: false, message: error });
  }
};

exports.getSellerProducts = async (req, res) => {
  //Check is seller and get seller id here
  try {
    const id = req.params.id;
    const sellerProducts = await getSellerProductsService(id);
    if (sellerProducts) {
      return res.status(200).json({
        status: true,
        message: "Products Found",
        data: await sellerProducts,
      });
    } else if (sellerProducts === []) {
      return res
        .status(404)
        .json({ status: false, message: "Product Not Found" });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Product search failed" });
    }
  } catch (error) {
    return res.status(500).json({ status: false, message: error });
  }
};

exports.editProduct = (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .json({ status:false, message: "Product name cannot be empty" });
  }
  if (!req.body.product_name || req.body.product_name.length ===0) {
    return res
      .status(400)
      .json({ status:false, message: "Product name cannot be empty" });
  }
  if (!req.body.descriptions || req.body.descriptions.length ===0) {
    return res
      .status(400)
      .json({ status:false, message: "Description cannot be empty" });
  }
  if (!Number.isInteger(parseInt(req.body.price))) {
    return res
      .status(400)
      .json({ status:false, message: "Price must be an integer" });
  }
  if (!Number.isInteger(parseInt(req.body.product_qty))) {
    return res
      .status(400)
      .json({ status:false, message: "Product quantity must be an integer" });
  }
  const productId = req.params.productId;
  try {
    const userId = 5;
    const editProductResponse = editProductService(userId, productId, req.body);
    if (editProductResponse) {
      return res
        .status(200)
        .json({ status: true, message: "Successfully Updated" });
    } else {
      return res
        .status(400)
        .json({ status:false, message: "Product update failed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error });
  }
};
