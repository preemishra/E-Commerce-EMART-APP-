const db = require("../models");
let product = db.product;
const { Op } = require("sequelize");

exports.getAllProduct = async () => {
  try {
    const allProduct = await db.product.findAll();
    return allProduct;
  } catch (e) {
    throw Error("Error while getting all products");
  }
};

exports.getAllProductByPagination = async (pageNO, limitValue) => {
  let page = parseInt(pageNO);
  let limit = parseInt(limitValue);
  let off = (page - 1) * limit;
  try {
    const { count, rows } = await product.findAndCountAll({
      attributes: [
        "product_id",
        "product_name",
        "descriptions",
        "price",
        "product_qty",
        "picture",
        "created_by",
        "updated_by",
      ],
      offset: off,
      limit: limit,
    });
    console.log(count);
    let totalRecords = await count;
    let paginationData = await rows;
    let totalPages = await Math.ceil(totalRecords / limit);
    return {
      paginationData,
      totalRecords,
      totalPages,
    };
  } catch (e) {
    throw Error("Error while getting Paginate products");
  }
};

exports.getSingleProduct = async (id) => {
  let productId = id;
  try {
    const singleProduct = await db.product.findOne({
      where: { product_id: productId },
    });
    return singleProduct;
  } catch (e) {
    throw Error("Error while getting single product");
  }
};

exports.searchProduct = async (searchByName) => {
  try {
    const searchedProduct = await product.findAll({
      attributes: ["product_id", "product_name", "price", "picture"],
      where: {
        product_name: {
          [Op.iLike]: `%${searchByName}%`,
        },
      },
    });
    return searchedProduct;
  } catch (e) {
    throw Error("Error while searching product");
  }
};

exports.createProductServices = async (bodyData) => {
  try {
    productDetails = {
      user_id: bodyData.user_id,
      created_by: bodyData.created_by,
      updated_by: bodyData.updated_by,
      product_name: bodyData.product_name,
      descriptions: bodyData.descriptions,
      price: bodyData.price,
      product_qty: bodyData.product_qty,
      picture: bodyData.picture,
    };
    const respProduct = await db.product.create(productDetails);

    return { success: true, data: await respProduct };
  } catch (e) {
    throw Error(e);
  }
};

exports.viewSellerProductServices = async (sellerId) => {
  try {
    const allProduct = await db.product.findAll({
      attributes: [
        "product_id",
        "product_name",
        "price",
        "picture",
        "descriptions",
      ],
      where: { user_id: sellerId },
    });
    return allProduct;
  } catch (e) {
    throw Error("Error while getting all products");
  }
};

exports.deleteProductService = async (id) => {
  try {
    const result = await db.product.destroy(
      { where: { product_id: id } }
    );
    if ((await result[0]) === 0) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};
exports.getSellerProductsService = async (id) => {
  try {
    const result = await db.product.findAll({ where: { user_id: id } });
    if ((await result.length) === 0) {
      return false;
    } else {
      return result;
    }
  } catch (e) {
    console.log(e);
    throw Error(e);
  }
};

exports.editProductService = async (userId, productId, data) => {
  try {
    const result = await db.product.update(
      {
        product_name: data.product_name,
        description: data.description,
        price: data.price,
        product_qty: data.product_qty,
        picture: data.picture,
        updated_by: "John",
      },
      {
        where: { user_id: userId, product_id: productId },
      }
    );
    if ((await result[0]) === 0) {
      return false;
    } else {
      return true;
    }
  } catch (e) {
    console.log(e);
    throw Error(e);
  }
};
