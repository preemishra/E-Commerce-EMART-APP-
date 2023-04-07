const {
  createUserServices,
  isUserExistServices,
  createUserFromAddressServices,
  createUserFromLoginServices,
  getSavedAddressServices,
  updateAddressServices,
  deleteAddressServices,
  getAllUsersServices,
  deleteUserService,
  searchUserService,
  myProfileService,
  editMyProfileService,
  changePasswordService,
} = require("../services/userService");
const validator = require("validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { checkForAdmin } = require("../utils/validations");
const db = require("../models");
const Validation = require("../utils/validations");
const validationClass = new Validation.Validation();
//create user from address data
exports.createUserFromAddress = async (req, res, next) => {
  try {
    const body = await req.body;
    if (await validationClass.validateUserBody(body)) {
      res
        .status(400)
        .send({ status: false, data: "please enter valid user details" });
    } else {
      const createUser = await createUserFromAddressServices(body);
      if (createUser.success === true) {
        res.status(200).send({
          status: true,
          data: createUser.data,
          message: createUser.message,
        });
      }
    }
  } catch (e) {
    return res.status(500).json({ status: false, data: e.message });
  }
};

//create user from login data
exports.createUserFromLogin = async (req, res, next) => {
  try {
    const body = await req.body;
    if (body.email === ""||!validator.isEmail(body.email) ||body.pwd === ""|| body.pwd.length < 8) {
     return  res.status(400).send("please enter valid user details");
    } else {
      const createUser = await createUserFromLoginServices(body);
      if (createUser.success === true) {
        res.status(200).send({
          status: createUser.success,
          data: createUser.data,
          message: createUser.message,
        });
      } else {
        res.status(401).send({
          status: createUser.success,
          data: createUser.data,
          message: createUser.message,
        });
      }
    }
  } catch (e) {
    return res
      .status(500)
      .json({ status:false, message:e.message});
  }
};

exports.isUserExist = async (req, res) => {
  try {
    const email = req.body.email;
    if (email === ""||!validator.isEmail(email)) {
      return res.status(400).send({status:false, message:"please enter valid email details"});
    } else {
      const isUserExist = await isUserExistServices(email);
      if (isUserExist.success === "true") {
        res.status(200).send({
          status: isUserExist.success,
          data: await isUserExist.data,
          message: isUserExist.message,
        });
      } else {
        res.status(401).send({
          status: isUserExist.success,
          data: await isUserExist.data,
          message: isUserExist.message,
        });
      }
    }
  } catch (e) {
    return res.status(500).json({ status:false, message: e.message });
  }
};

//get user address
exports.getSavedAddress = async (req, res, next) => {
  const userId = req.params.id;
  try {if (!userId) {
   return res.status(400).send({status:false, message:"please enter valid user id"});
  } else {
    let address = await getSavedAddressServices(userId);
    if (address.data.length !== 0) {
      return res.status(200).json({
        status: true,
        data: address.data,
        message: `Succesfully address Retrieved for id is ${userId} `,
      });
    }else{
      return res.status(404).json({
        status: false,
        data:[],
        message: `No address Found `,
      });
    }
  }
  } catch (e) {
    return res.status(500).json({ status:false, message: e.message });
  }
};

//update user address
exports.updateAddress = async (req, res, next) => {
  const userId = req.params.id;
  const body = req.body;
  try {if (await validationClass.validateAddressBody(body)) {
    res
        .status(400)
        .send({ status: false, message: "please enter valid address details" });
  } else {
    let address = await updateAddressServices(userId, body);
    if (address.success === true) {
      return res.status(200).json({
        status: true,
        data: address.data,
        message: `Successfully address updated for id is ${userId} `,
      });
    }
  }
  } catch (e) {
    return res.status(500).json({ status:false, message: e.message });
  }
};

//delete user address
exports.deleteAddress = async (req, res, next) => {
  const addressId = req.params.id;
  try {
    let address = await deleteAddressServices(addressId);
    if (address.success === true) {
      return res.status(200).json({
        status: true,
        data: address.data,
        message: `Successfully address deleted for id is ${addressId} `,
      });
    }
  } catch (e) {
    return res.status(500).json({ status:false, message: e.message });
  }
};

exports.getAllUsers = async (req, res) => {
  if (!(await checkForAdmin("preetim@indx.ai"))) {
    return res.status(401).json({
      status: false,
      message: "Only Admin Is Allowed",
    });
  }
  try {
    const response = await getAllUsersServices();
    if (response) {
      return res.status(200).json({
        status: true,
        data: await response,
      });
    } else {
      return res.status(400).json({
        status: false,
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      status:false,
      message: error,
    });
  }
};
exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Invalid Id",
    });
  }
  try {
    const response = await deleteUserService(id);
    if (response) {
      return res.status(200).json({
        status: true,
        success: true,
        message: "Successfully Deleted",
      });
    } else {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Invalid Id",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status:false,
      success: false,
      message: error,
    });
  }
};
exports.searchUser = async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Invalid Email",
    });
  }
  try {
    const response = await searchUserService(email);
    if (response) {
      return res.status(200).json({
        status: true,
        success: true,
        data: await response,
      });
    } else {
      return res.status(400).json({
        status: 400,
        success: false,
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status:false,
      success: false,
      message: error,
    });
  }
};
exports.myProfile = async (req, res) => {
  const email =req.body.email;
  try {
    const response = await myProfileService(email);
    if (await response) {
      return res.status(200).json({
        status: true,
        success: true,
        data: await response,
      });
    } else {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Something went wrong",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status:false,
      success: false,
      message: error,
    });
  }
};
exports.editMyProfile = async (req, res) => {
   const email = "preetim@indx.ai";
  if (!req.body) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Please enter valid data",
    });
  } else if (
    req.body.full_name.length === 0 ||
    !validator.isEmail(req.body.email) ||
    req.body.pwd.length < 8
  ) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Please enter valid data",
    });
  }
  try {
    const response = await editMyProfileService(req.body, email);
    if (response) {
      return res.status(200).json({
        status: true,
        success: true,
        message: "Successfully Updated",
      });
    } else {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Please enter valid data",
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status:false,
      success: false,
      message: error,
    });
  }
};
exports.changePassword = async (req, res) => {
  const email =req.body.email;
  if (req.body.newPassword !== req.body.confirmPassword) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "New Password & Confirm Password Should Match",
    });
  } else if (req.body.currentPassword === req.body.newPassword) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "New Password & Current Password Cannot Be Same",
    });
  } else if (
    req.body.newPassword.trim().length < 8 ||
    req.body.confirmPassword.trim().length < 8
  ) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Password should be greater than 8 digits",
    });
  }
  const oldPassword = await db.user.findOne({
    attribute: ["pwd"],
    where: { email: email },
  });
  if (!bcrypt.compareSync(req.body.currentPassword, await oldPassword.pwd)) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Old Password Doesn't Match",
    });
  }
  try {
    const response = changePasswordService(email, req.body);
    if (response) {
      return res.status(200).json({
        status: true,
        success: true,
        message: "Password Changed Successfully",
      });
    } else {
      return res.status(200).json({
        status: true,
        success: true,
        message: "Password Changed Failed",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status:false,
      success: false,
      message: error,
    });
  }
};
