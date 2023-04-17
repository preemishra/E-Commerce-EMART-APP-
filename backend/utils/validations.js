const validator = require("validator");

class Validation {

  async validatePostBody(body) {
    if (
      body.user_id === "" ||
      body.created_by === "" ||
      body.updated_by === ""||
      body.cart_product_qty === "" ||
      body.product_id === ""
    ) {
      return true;
    } else {
      return false;
    }
  }

  async validateCartDeleteBody(body) {
    if (
      body.user_id === "" ||
      body.cart_id === "" ||
      body.cart_details_id === ""
    ) {
      return true;
    } else {
      return false;
    }
  }

  
  async validateCartPostBody(body) {
    if (
      body.user_id === "" ||
      body.created_by === "" ||
      body.updated_by === ""||
      body.cart_product_qty === "" ||
      body.unit_price === ""||
      body.product_id === ""
    ) {
      return true;
    } else {
      return false;
    }
  }
  


  async validateUserBody(body) {
    if (
      body.full_name===""||
      !/^[a-zA-Z ]*$/.test(body.full_name)||
      body.email===""||
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(body.email)||
      body.pwd === "" ||
      body.created_by === "" ||
      body.updated_by === ""||
      body.pin_code === ""
    ) {
      return true;
    } else {
      return false;
    }
  }

  async validateAddressBody(body) {
    if (
      body.contact===""||
      body.state===""||
      body.updated_by === ""||
      body.pin_code === ""
    ) {
      return true;
    } else {
      return false;
    }
  }
  
  async validateOrderBody(body) {
    if (
      body.user_id === "" ||
      body.created_by === "" ||
      body.updated_by === ""||
      body.ordered_qty === "" ||
      body.product_id === ""||
      body.order_status===""||
      !/^[a-zA-Z ]*$/.test(body.order_status)
    ) {
      return true;
    } else {
      return false;
    }
  }

  async validatePaymentBody(body) {
    if (
      body.pay_method === "" ||
      body.created_by === "" ||
      body.updated_by === ""||
      body.total_amount === "" ||
      body.payment_status === ""||
      body.order_id===""
    ) {
      return true;
    } else {
      return false;
    }
  }

  async validateProductBody(body) {
    if (
      body.user_id === "" ||
      body.created_by === "" ||
      body.updated_by === ""||
      body.product_name === "" ||
      body.descriptions === ""||
      body.price===""||
      body.product_qty === ""||
      body.picture===""
    ) {
      return true;
    } else {
      return false;
    }
  }
}

const { user } = require("../models");
exports.checkForAdmin = async (email) => {
  const response = await user.findOne({ where: { email: email } });
  if ((await response) === null) {
    return false;
  } else if ((await response.role) === "Admin") {
    return true;
  }
};
exports.Validation = Validation;
