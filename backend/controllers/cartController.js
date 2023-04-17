const {
  createCartServices,
  getAllProductFromCartServices,
  deleteCartProductServices,
} = require("../services/cartService");
const Validation = require("../utils/validations");
const validationClass = new Validation.Validation();

exports.createCart = async (req, res, next) => {
  try {
    const body = await req.body;
    if (await validationClass.validateCartPostBody(body)) {
      return res.status(400).send("please enter valid cart details");
    } else {
      const cart = await createCartServices(body);
      if (cart) {
        res.status(200).send({
          status: true,
          data: body.user_id,
          message: "cart created successfully",
        });
      } else {
        return res.status(400).send(cart);
      }
    }
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAllProductFromCart = async (req, res, next) => {
  let id = req.params.id;
  try {
    let allCartProduct = await getAllProductFromCartServices(id);
    return res.status(200).json({
      status: true,
      data: allCartProduct,
      message: "Successfully product Retrieved",
    });
  } catch (e) {
    return res.status(500).json({ status: false, message: e.message });
  }
};

//delete  one record form json file
exports.deleteCartProduct = async (req, res) => {
  try {
    let body = req.body;
    if (await validationClass.validateCartDeleteBody(body)) {
      return res.status(400).send("please enter valid cart details");
    } else {
      const cart = await deleteCartProductServices(body);
      if (cart) {
        return res.status(200).send({
          status: true,
          data: req.body.cart_id,
          message: `cart deleted successfully with cart_id ${req.body.cart_id}`,
        });
      } else {
       return  res.status(400).send(cart);
      }
    }
  } catch (e) {
    return res.status(500).json({ status: false, message: e.message });
  }
};
