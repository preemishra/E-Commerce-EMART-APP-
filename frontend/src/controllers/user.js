import User from "../services/user";
import { userDetail } from "../controllers/store";
const userServicesClass = new User();
// get all products
class UserController {
  async saveAddressController(address) {
    try {
      let addressResp = await userServicesClass.saveAddressServices(address);

      return await addressResp;
    } catch (error) {
      console.log(error);
    }
  }

  // async editProfileController(fullName, email) {
  //   try {
  //     const response = await userServicesClass.editProfileService(
  //       fullName,
  //       email
  //     );
  //     console.log(response);
  //     return await response;
  //   } catch (error) {}
  // }

  async changePasswordController(oldPassword, newPassword, confirmNewPassword) {
    console.log(oldPassword, newPassword);
    console.log(confirmNewPassword);
    try {
      const response = await userServicesClass.changePasswordService(
        oldPassword,
        newPassword,
        confirmNewPassword
      );
      console.log(response);
      return await response;
    } catch (error) {}
  }

  async createUserController(userData) {
    try {
      let userResp = await userServicesClass.createUserServices(userData);
      console.log(userResp);
      let userDetails = {
        user_id: userResp.data.user_id,
        full_name: userResp.data.email,
      };
      userDetail.set(userDetails);
      sessionStorage.setItem("user", JSON.stringify(userDetail));
      return await userResp;
    } catch (error) {
      console.log(error);
    }
  }

  async getAddressController(userId) {
    try {
      let address = await userServicesClass.getAddressServices(userId);
      return await address;
    } catch (error) {
      console.log(error);
    }
  }

  async checkUserExistController(email) {
    try {
      let userStatus = await userServicesClass.checkUserExistServices(email);
      return await userStatus;
    } catch (error) {
      console.log(error);
    }
  }

  async placeOrderController(orderDetails) {
    try {
      let orderResp = await userServicesClass.placeOrderServices(orderDetails);
      console.log(orderResp);
      return await orderResp;
    } catch (error) {
      console.log(error);
    }
  }

  async paymentDetailController(paymentDetail) {
    try {
      let paymentResp = await userServicesClass.paymentDetailServices(
        paymentDetail
      );
      console.log(paymentResp);
      return await paymentResp;
    } catch (error) {
      console.log(error);
    }
  }
}

export default UserController;
