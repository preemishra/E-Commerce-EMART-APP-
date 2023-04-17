const {
  createOrderServices,
  viewOrdersServices,
  cancelOrderServices,
  paymentDetailsServices,
  viewSellerOrdersServices,
  updateOrderStatusServices
} = require("../services/orderService");
const Validation = require("../utils/validations");
const validationClass = new Validation.Validation();

//create user cart here we added data in cart and cart details model
exports.createOrder = async (req, res, next) => {
  try {
    let body =  req.body;
    //  console.log(body.userDetail)
    // if (await validationClass.validateOrderBody(body)) {
    //   if(){
    //   return res.status(400).send("please enter valid user details");
    // } else {
      let createOrder = await createOrderServices(body.userDetail,body.buyingProductDetail);
      if (createOrder.success === true) {
        return res.status(200).send({
          status: true,
          data: createOrder.data,
          message: createOrder.message,
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "Invalid order details",
        })
        
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error,
    });
  }
};

exports.viewOrders = async (req, res, next) => {
  let id = req.params.id;
  try {
    let allOrders = await viewOrdersServices(id);
    if (allOrders) {
      return res.status(200).json({
        status: 200,
        data: allOrders,
        message: "Succesfully orders Retrieved",
      });
    }  else {
      return res.status(400).send(allOrders);
    }
  } catch (e) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: e,
    });
    
  }
};


exports.sellerOrders = async (req, res, next) => {
  let sellerId = req.params.id;
  try {
    let allOrders = await viewSellerOrdersServices(sellerId);
    if (allOrders) {
      return res.status(200).json({
        status: 200,
        data: allOrders,
        message: "Succesfully sellers orders Retrieved",
      });
    }  else {
      return res.status(400).send(allOrders);
    }
  } catch (e) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: e,
    });
    
  }
};


exports.cancelOrder = async (req, res, next) => {
  try {
    const body = await req.body;
    const cancelOrder = await cancelOrderServices(body);
    if (cancelOrder.success === true) {
     return res.status(200).send({
        status: true,
        data: cancelOrder.data,
        message: cancelOrder.message,
      });
    } 
    else {
      return res.status(400).send(cancelOrder);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 500,
      success: false,
      message: e,
    });
  }
};


exports.updateOrderStatus= async (req, res, next) => {
  try {
    const body = await req.body;
    const updateOrder = await updateOrderStatusServices(body);
    if (updateOrder.success === true) {
     return res.status(200).send({
        status: true,
        data: updateOrder.data,
        message: updateOrder.message,
      });
    } 
    else {
      return res.status(400).send(updateOrder);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 500,
      success: false,
      message: e,
    });
  }
};

//create user cart here we added data in cart and cart details model
exports.paymentDetails = async (req, res, next) => {
  try {
    const body = await req.body;
    if (await validationClass.validatePaymentBody(body)) {
      res.status(400).send("please enter valid user details");
    } else {
      const paymentResp = await paymentDetailsServices(body);
      if (paymentResp.success === true) {
        res.status(200).send({
          status: true,
          data: paymentResp.data,
          message: paymentResp.message,
        });
      } else {
        return res.status(400).send(paymentResp);
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: error,
    });
  }
};
