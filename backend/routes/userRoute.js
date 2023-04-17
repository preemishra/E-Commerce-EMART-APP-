const express = require("express");
const user = express.Router();
//product controllers imported
const {
  isUserExist,
  createUserFromAddress,
  createUserFromLogin,
  getSavedAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  deleteUser,
  searchUser,
  myProfile,
  editMyProfile,
  changePassword
} = require("../controllers/userController");
/* Read - Post  method  checking user exist or not*/
user.post("/is-exist", isUserExist);
/* write - post  method  for create user from address data*/
user.post("/user-address-login", createUserFromAddress);
/* write - post  method  for create user from login data*/
user.post("/user-login", createUserFromLogin);
/* Read - view user saved address*/
user.get("/:id", getSavedAddress);
/* update - update user address*/
user.patch("/:id", updateAddress);
/* delete - delete user address*/
user.delete("/:id", deleteAddress);
user.get("/view/all",getAllUsers)
user.delete("/admin/:id",deleteUser)
user.get("/admin/search",searchUser)
user.get("/my/profile",myProfile)
user.patch("/my/profile",editMyProfile)
user.patch("/my-profile/change-password",changePassword)

module.exports = user;
