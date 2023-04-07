class User {
  async saveAddressServices(address) {
    console.log(address);
    try {
      const res = await fetch(
        `http://localhost:4000/api/user/user-address-login`,
        {
          method: "Post",
          headers: {
            "content-type": "application/json",
            // "x-access-token": sessionStorage.getItem("authorization"),
          },
          body: JSON.stringify(address),
        }
      );
      const result = await res.json();
      return await result;
    } catch (error) {
      console.log(error);
      return await error;
    }
  }

  async createUserServices(userData) {
    console.log(userData);
    try {
      const res = await fetch(`http://localhost:4000/api/user/user-login`, {
        method: "Post",
        headers: {
          "content-type": "application/json",
          // "x-access-token": sessionStorage.getItem("authorization"),
        },
        body: JSON.stringify(userData),
      });
      const result = await res.json();
      return await result;
    } catch (error) {
      console.log(error);
      return await error;
    }
  }

  async getAddressServices(userId) {
    console.log(userId);
    try {
      const res = await fetch(`http://localhost:4000/api/user/${userId}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          // "x-access-token": sessionStorage.getItem("authorization"),
        },
      });
      const result = await res.json();
      return await result;
    } catch (error) {
      console.log(error);
      return await error;
    }
  }

  async checkUserExistServices(email) {
    console.log(email);
    try {
      const res = await fetch(`http://localhost:4000/api/user/is-exist`, {
        method: "Post",
        headers: {
          "content-type": "application/json",
          // "x-access-token": sessionStorage.getItem("authorization"),
        },
        body: JSON.stringify({ email: email }),
      });
      const result = await res.json();
      return await result;
    } catch (error) {
      console.log(error);
      return await error;
    }
  }

  async placeOrderServices(orderDetails) {
    console.log(orderDetails);
    try {
      const res = await fetch(`http://localhost:4000/api/order`, {
        method: "Post",
        headers: {
          "content-type": "application/json",
          // "x-access-token": sessionStorage.getItem("authorization"),
        },
        body: JSON.stringify(orderDetails),
      });
      const result = await res.json();
      return await result;
    } catch (error) {
      console.log(error);
      return await error;
    }
  }

  async paymentDetailServices(paymentDetail) {
    console.log(paymentDetail);
    try {
      const res = await fetch(`http://localhost:4000/api/order/pay`, {
        method: "Post",
        headers: {
          "content-type": "application/json",
          // "x-access-token": sessionStorage.getItem("authorization"),
        },
        body: JSON.stringify(paymentDetail),
      });
      const result = await res.json();
      return await result;
    } catch (error) {
      console.log(error);
      return await error;
    }
  }

  // async editProfileService(
  //   fullName,email
  // ) {
  //   try {
      
  //     console.log(res);
  //     return await res.json();
  //   } catch (error) {
  //     return error;
  //   }
  // }

  async changePasswordService(
    oldPassword,
    newPassword,
    confirmNewPassword
  ) {
    try {
      const res = await fetch(
        `http://localhost:4000/api/user/my-profile/change-password`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            // "x-access-token": sessionStorage.getItem("authorization"),
          },
          body: JSON.stringify({
            currentPassword: oldPassword,
            newPassword: newPassword,
            confirmPassword: confirmNewPassword,
            email: JSON.parse(localStorage.loggedInDetails).email,
          }),
        }
      );
      console.log(res);
      return await res.json();
    } catch (error) {
      return error;
    }
  }
}

export default User;
