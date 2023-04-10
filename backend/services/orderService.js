const db = require("../models/index");
 const { Op, Sequelize, QueryTypes } = require("sequelize");

// exports.createOrderServices = async (userData,productData) => {
//   console.log(userData)
//   console.log(productData)
//   try {
//     let orderResp;
//     if (bodyData.order_id===undefined) {
//       const result = await db.sequelize.transaction(async (t) => {
//         order = {
//           user_id: bodyData.user_id,
//           created_by: bodyData.created_by,
//           updated_by: bodyData.updated_by,
//         };
//         const respOrder = await db.order.create(order, { transaction: t });
//         orderDetail = {
//           created_by: bodyData.created_by,
//           updated_by: bodyData.updated_by,
//           ordered_qty: bodyData.ordered_qty,
//           unit_price: bodyData.unit_price,
//           order_status: bodyData.order_status,
//           order_id: await respOrder.order_id,
//           product_id: bodyData.product_id,
//           address_id: bodyData.address_id,
//         };
//         const order_detailsResp = await db.orderDetail.create(orderDetail, {
//           transaction: t,
//         });
//         orderResp = order_detailsResp;
//       });
//       return {
//         success: true,
//         data: { order_id: orderResp.order_id },
//         message: "order created with single product successfully",
//       };
//     } else {
//       orderDetail = {
//         created_by: bodyData.created_by,
//         updated_by: bodyData.updated_by,
//         ordered_qty: bodyData.ordered_qty,
//         unit_price: bodyData.unit_price,
//         order_status: bodyData.order_status,
//         order_id: bodyData.order_id,
//         product_id: bodyData.product_id,
//         address_id: bodyData.address_id,
//       };
//       const order_detailsResp = await db.orderDetail.create(orderDetail);
//       return {
//         success: true,
//         data: { order_id: orderResp.order_id },
//         message: "order created with multiple product successfully",
//       };
//     }
//   } catch (e) {
//     throw Error(e);
//   }
// };

exports.createOrderServices = async (userDetail, productData) => {
  try {
    let userData = [userDetail];
    console.log(userData);
    let returnUnitPrice = 0;
    let orderResp;
    let result = Array.isArray(productData);
    if (result === false) {
      const result = await db.sequelize.transaction(async (t) => {
        order = {
          user_id: userData[0].user_id,
          created_by: userData[0].created_by,
          updated_by: userData[0].updated_by,
        };
        const respOrder = await db.order.create(order, { transaction: t });
        orderDetail = {
          created_by: userData[0].created_by,
          updated_by: userData[0].updated_by,
          address_id: userData[0].address_id,
          ordered_qty: userData[0].ordered_qty,
          unit_price: userData[0].unit_price,
          // order_status: bodyData[0].order_status,
          order_id: await respOrder.order_id,
          product_id: userData[0].product_id,
        };
        const order_detailsResp = await db.orderDetail.create(orderDetail, {
          transaction: t,
        });
        orderResp = order_detailsResp;
        returnUnitPrice = userData[0].unit_price;
      });
      return {
        success: true,
        data: {
          order_id: orderResp.order_id,
          returnUnitPrice: returnUnitPrice,
        },
        message: "order created with single product successfully",
      };
    } else {
      let order_detailsResp;
      order = {
        user_id: userData[0].user_id,
        created_by: userData[0].created_by,
        updated_by: userData[0].updated_by,
      };
      let orderResp = await db.order.create(order);

      let order_id = orderResp.order_id;

      for (let i = 0; i < (await productData.length); i++) {
        orderDetail = {
          created_by: userData[0].created_by,
          updated_by: userData[0].updated_by,
          address_id: userData[0].address_id,
          ordered_qty: productData[i].qty,
          unit_price: productData[i].price * productData[i].qty,
          // order_status: await bodyData[i].order_status,
          order_id: order_id,
          product_id: productData[i].product_id,
        };
        order_detailsResp = await db.orderDetail.create(orderDetail);
        returnUnitPrice =
          returnUnitPrice + productData[i].price * productData[i].qty;
      }
      console.log(returnUnitPrice);
      return {
        success: true,
        data: {
          order_id: orderResp.order_id,
          returnUnitPrice: returnUnitPrice,
        },
        message: "order created with multiple product successfully",
      };
    }
  } catch (e) {
    console.log(e);
    throw Error(e);
  }
};

exports.viewOrdersServices = async (id) => {
  try {
   let query=`select order_details_id,ordered_qty,unit_price,order_status,product_name,descriptions,picture,contact,apartment,city,street,pin_code,state,address_type from orders inner join order_details on orders.order_id=order_details.order_id inner join products on order_details.product_id=products.product_id inner join addresses on order_details.address_id=addresses.address_id where orders.user_id=${id} order by addresses.address_id DESC`

    const result = await db.sequelize.query(query,
      { type:QueryTypes.SELECT  }
    );
    // const result = await db.order.findAll({
    //   where: { user_id: id },
    //   include: [
    //     {
    //       model: db.orderDetail,
    //       required: true,
    //       include: [
    //         {
    //           model: db.product,
    //           model: db.address,
    //           required: true,
    //         },
    //       ],
    //     },
    //   ],
    // });
    console.log(await result);
    return await result;
  } catch (e) {
    console.log(e);
    throw Error(e);
  }
};

exports.cancelOrderServices = async (bodyData) => {
  try {
    let orderResp;
    const result = await db.sequelize.transaction(async (t) => {
      orderDetail = {
        updated_by: bodyData.updated_by,
        order_status: bodyData.order_status,
      };
      const order_detailsResp = await db.orderDetail.update(
        orderDetail,
        { where: { order_id: bodyData.order_id } },
        {
          transaction: t,
        }
      );
      orderResp = order_detailsResp;
    });
    return {
      success: true,
      data: { order_id: bodyData.order_id },
      message: "order canceled successfully",
    };
  } catch (e) {
    throw Error(e);
  }
};

exports.paymentDetailsServices = async (bodyData) => {
  try {
    let paymentStatus;
    const result = await db.sequelize.transaction(async (t) => {
      paymentDetail = {
        created_by: bodyData.created_by,
        updated_by: bodyData.updated_by,
        pay_method: bodyData.pay_method,
        total_amount: bodyData.total_amount,
        payment_status: bodyData.payment_status,
        order_id: bodyData.order_id,
      };
      const respOrder = await db.payment.create(paymentDetail, {
        transaction: t,
      });
      orderDetail = {
        updated_by: bodyData.updated_by,
        order_status: bodyData.order_status,
      };
      const order_detailsResp = await db.orderDetail.update(
        orderDetail,
        { where: { order_id: bodyData.order_id } },
        {
          transaction: t,
        }
      );
      paymentStatus = respOrder;
    });
    return {
      success: true,
      data: {
        order_id: bodyData.order_id,
        payment_id: paymentStatus.payment_id,
      },
      message: `payment done successfully with payment id ${paymentStatus.payment_id} of order ${bodyData.order_id}`,
    };
  } catch (e) {
    throw Error(e);
  }
};
