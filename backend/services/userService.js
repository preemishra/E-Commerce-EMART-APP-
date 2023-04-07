const db = require("../models");
const { Op } = require("sequelize");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");
const saltRounds = 10;
const { response } = require("express");
//create user from address
exports.createUserFromAddressServices = async (addressData) => {
  try {
    let isEmailExist = await db.user.findOne({
      where: {
        email: addressData.email,
      },
    });
    //if email not exist after entered address then create user with email only
    if ((await isEmailExist) === null) {
      let userResp;
      let addressResp;
      const result = await db.sequelize.transaction(async (t) => {
        user = {
          full_name: addressData.full_name,
          email: addressData.email,
          created_by: addressData.email,
          updated_by: addressData.email,
        };
        const userRespData = await db.user.create(user, { transaction: t });
        //create address
        address = {
          contact: addressData.contact,
          apartment: addressData.apartment,
          street: addressData.street,
          landmark: addressData.landmark,
          city: addressData.city,
          state: addressData.state,
          pin_code: addressData.pin_code,
          address_type: addressData.address_type,
          user_id: await userRespData.user_id,
          created_by: addressData.email,
          updated_by: addressData.email,
        };
        const createAddress = await db.address.create(address, {
          transaction: t,
        });
        userResp=userRespData
        addressResp=createAddress
      });
      return {
        success: true,
        data: { email: await userResp.email, user_id: await userResp.user_id ,address_id:addressResp.address_id},
        message: "new user created with address",
      };
    } else if (isEmailExist.email !== null) {
      let addressResp;
      //if email already exist after entered address then update user with full name where email ==enterd email only
      const result = await db.sequelize.transaction(async (t) => {
        user = {
          full_name: addressData.full_name,
          updated_by: addressData.email,
        };
        const createUser = await db.user.update(
          { user },
          { where: { email: addressData.email } }
        );
        //create address
        address = {
          contact: addressData.contact,
          apartment: addressData.apartment,
          street: addressData.street,
          landmark: addressData.landmark,
          city: addressData.city,
          state: addressData.state,
          pin_code: addressData.pin_code,
          address_type: addressData.address_type,
          user_id: await isEmailExist.user_id,
          created_by: addressData.email,
          updated_by: addressData.email,
        };
        const createAddress = await db.address.create(address, {
          transaction: t,
        });
       addressResp=createAddress
      });
      return {
        success: true,
        data: { email: isEmailExist.email, user_id: isEmailExist.user_id ,address_id: addressResp.address_id },
        message: "user name updated with address",
      };
    }
  } catch (e) {
    throw Error(e);
  }
};

//create user from Login
exports.createUserFromLoginServices = async (loginData) => {
  try {
    let user = await db.user.findOne({
      where: {
        email: loginData.email,
      },
    });
    //only email found
    if (user!== null && user.pwd === null) {
     
      const createUser = await db.user.update(
        { pwd:bcrypt.hashSync(loginData.pwd,10), updated_by: loginData.email },
        { where: { email: loginData.email } }
      );
      return {
        success: true,
        data: { email: createUser.email, user_id: createUser.user_id },
        message: "user successfully created",
      };
    } else if ((await user) !== null && user.pwd !== null) {
     
      if (bcrypt.compareSync(loginData.pwd, await user.pwd)) {
        return {
          success: true,
          data: { email: user.email, user_id: user.user_id },
          message: "user logged in successfully",
        };
      } else {
        return {
          success: false,
          data: { email: user.email, user_id: user.user_id },
          message: "invalid password",
        };
      }
    } else {
      //if  password is null and email null  then create user with email and password by create
      //no email no password
      const createUser = await db.user.create({
        email: loginData.email,
        pwd:bcrypt.hashSync(loginData.pwd,10),
        created_by: loginData.email,
        updated_by: loginData.email,
      });
      return {
        success: true,
        data: { email: createUser.email, user_id: createUser.user_id },
        message: "user successfully created",
      };
    }
  } catch (e) {
    throw Error(e);
  }
};

//check user before login by checking email and password
exports.isUserExistServices = async (email) => {
  try {
    let user = await db.user.findOne({
      where: {
        email: email,
      },
    });
    //if email found but password is null then
    if (user === null) {
      return {
        success: false,
        data: { email: null, pwd: null },
        message: "User Not found.",
      };
    } else if (user.email !== "" && user.pwd === null) {
      return {
        success: false,
        data: { email: user.email, pwd: user.pwd },
        message: "please create password",
      };
    } else if (user.email !== "" && user.pwd !== null) {
      return {
        success: true,
        data: { email: user.email},
        message: "user existed please login",
      };
    }
  } catch (e) {
    throw Error(e);
  }
};

exports.getSavedAddressServices = async (userId) => {
  try {
    const address = await db.address.findAll({
      where: { user_id: userId },
    });
    return {
      success: true,
      data: address,
      message: "address retrieved successfully ",
    };
  } catch (e) {
    throw Error("Error while getting address");
  }
};
exports.updateAddressServices = async (userId, addressData) => {
  try {
    address = {
      contact: addressData.contact,
      apartment: addressData.apartment,
      street: addressData.street,
      landmark: addressData.landmark,
      city: addressData.city,
      state: addressData.state,
      pin_code: addressData.pin_code,
      address_type: addressData.address_type,
      updated_by: addressData.email,
    };
    const updateResp = await db.address.update(address, {
      where: { user_id: userId },
    });
    return {
      success: true,
      data: updateResp,
      message: "address updated successfully ",
    };
  } catch (e) {
    throw Error("Error while getting single product");
  }
};

exports.deleteAddressServices = async (addressId) => {
  try {
    const addressResp = await db.address.destroy({
      where: { address_id: addressId },
    });
    return {
      success: true,
      data: addressResp,
      message: "address deleted successfully ",
    };
  } catch (e) {
    throw Error("Error while getting single product");
  }
};

//get all data services
exports.getAllUsersServices = async () => {
  try {
    const result = await db.user.findAll({ where: { is_active: "True" } });
    return await result;
  } catch (e) {
    throw Error(e);
  }
};
exports.deleteUserService = async (id) => {
  try {
    const result = await db.user.update(
      {
        is_active: "False",
      },
      { where: { user_id: id } }
    );
    if ((await result[0]) === 0) {
      return false;
    } else {
      return true;
    }
  } catch (e) {
    throw Error(e);
  }
};
exports.searchUserService = async (email) => {
  try {
    const result = await db.user.findAll({
      where: {
        email: {
          [Op.like]: `%${email}%`,
        },
      },
    });
    if ((await result.length) === 0) {
      return false;
    } else {
      return await result;
    }
  } catch (e) {
    console.log(e);
    throw Error(e);
    
  }
};
exports.myProfileService = async (email) => {
  try {
    const result = await db.user.findOne({ where: { email: email } });
    if ((await result) === null) {
      return false;
    } else {
      return await result;
    }
  } catch (e) {
    console.log(e);
    throw Error(e);
  }
};
exports.editMyProfileService = async (data,email) => {
  try {
    const hash=bcrypt.hashSync(data.pwd,10);
    data.pwd=hash;
    const result = await db.user.update(
      {
        full_name: data.full_name,
        email: data.email,
        pwd:data.pwd,
        updated_by: email,
      },
      { where: { email: email } }
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
exports.changePasswordService=async(email,data)=>{
  try {
    const hashConvert=bcrypt.hashSync(data.newPassword,10)
    const result=await db.user.update({
      pwd:hashConvert,
      updated_by:email
    },{where:{email:email}})
    if(result.length===0){
      return false
    }
    else{
      return true
    }
  } catch (e) {
    console.log(e);
    throw Error(e);
  }
}