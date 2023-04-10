const db = require("../models/index");
const { Op } = require("sequelize");
exports.createCartServices = async (bodyData) => {
  try {
    const result = await db.sequelize.transaction(async (t) => {
      cart = {
        user_id: bodyData.user_id,
        created_by: bodyData.created_by,
        updated_by: bodyData.updated_by,
      };
      const respCart = await db.cart.create(cart, { transaction: t });
      cart_details = {
        created_by: bodyData.created_by,
        updated_by: bodyData.updated_by,
        cart_product_qty: bodyData.cart_product_qty,
        unit_price: bodyData.unit_price,
        cart_id: await respCart.cart_id,
        product_id: bodyData.product_id,
        created_by: bodyData.created_by,
        updated_by: bodyData.updated_by,
      };
      const cartDetailsResp = await db.cartDetail.create(cart_details, {
        transaction: t,
      });
    });
    return true;
  } catch (e) {
    throw Error(e);
  }
};

exports.getAllProductFromCartServices = async (id) => {
  try {
    const result = await db.cart.findAll({
      where: { user_id: id },
      include: [
        {
          model: db.cartDetail,
          attributes: [ "cart_details_id","cart_product_qty", "unit_price", "product_id"],
          required: true,
          include: [
            {
              model: db.product,
              required: true,
            },
          ],
        },
      ],
    });
    return await result;
  } catch (e) {
    console.log(e);
    throw Error(e);
  }
};

exports.deleteCartProductServices = async (deleteBody) => {
  // const productId = deleteBody.product_id;
  let userId = deleteBody.user_id;
  let cartId = deleteBody.cart_id;
  let cartDetailId = deleteBody.cart_details_id;
  try {
    const result = await db.sequelize.transaction(async (t) => {
      const respCart = await db.cart.destroy(
        {
          where: { cart_id: cartId },
        },
        { transaction: t }
      );
      const cartDetailsResp = await db.cartDetail.destroy(
        {
          where: { cart_details_id: cartDetailId },
        },
        {
          transaction: t,
        }
      );
    });
    return true;
  } catch (e) {
    throw Error(e);
  }
};
