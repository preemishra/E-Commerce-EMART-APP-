const db = require("../models/index");
const { Op } = require("sequelize");
// exports.createOrderServices = async (bodyData) => {
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

exports.createOrderServices = async (bodyData) => {
  try {
    let orderResp;
    if (bodyData.length == 0) {
      const result = await db.sequelize.transaction(async (t) => {
        order = {
          user_id: bodyData.user_id,
          created_by: bodyData.created_by,
          updated_by: bodyData.updated_by,
        };
        const respOrder = await db.order.create(order, { transaction: t });
        orderDetail = {
          created_by: bodyData.created_by,
          updated_by: bodyData.updated_by,
          ordered_qty: bodyData.ordered_qty,
          unit_price: bodyData.unit_price,
          order_status: bodyData.order_status,
          order_id: await respOrder.order_id,
          product_id: bodyData.product_id,
          address_id: bodyData.address_id,
        };
        const order_detailsResp = await db.orderDetail.create(orderDetail, {
          transaction: t,
        });
        orderResp = order_detailsResp;
      });
      return {
        success: true,
        data: { order_id: orderResp.order_id },
        message: "order created with single product successfully",
      };
    } else {
     
      let order_detailsResp
     
        order = {
          user_id: await bodyData[0].user_id,
          created_by: await bodyData[0].created_by,
          updated_by: await bodyData[0].updated_by,
        };
        let orderResp = await db.order.create(order);
      
        let order_id=orderResp.order_id
        for (let i = 0; i < await bodyData.length; i++) {
        orderDetail = {
          created_by: await await bodyData[i].created_by,
          updated_by: await bodyData[i].updated_by,
          ordered_qty: await bodyData[i].ordered_qty,
          unit_price: await bodyData[i].unit_price,
          order_status: await bodyData[i].order_status,
          order_id: await order_id,
          product_id: await bodyData[i].product_id,
          address_id: await bodyData[i].address_id,
        };
        order_detailsResp = await db.orderDetail.create(orderDetail);
      }
      return {
        success: true,
        data: { order_id: orderResp.order_id },
        message: "order created with multiple product successfully",
      };
    }
  } catch (e) {
    console.log(e)
    throw Error(e);
  }
};

exports.viewOrdersServices = async (id) => {
  try {
    const result = await db.order.findAll({
      where: { user_id: id },
      include: [
        {
          model: db.orderDetail,
          required: true,
          include: [
            {
              model: db.product,
              model: db.address,
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
