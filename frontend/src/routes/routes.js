import Router from "svelte-spa-router";
import {wrap} from 'svelte-spa-router/wrap'
import Cart from "../components/Cart.svelte";
import Login from "../components/Login.svelte";
import About from "../components/About.svelte";
import NotFound from "../components/NotFound.svelte";
import Dashboard from "../views/Dashboard.svelte";
import OrderSummary from "../views/OrderSummary.svelte";
import Payment from "../views/Payment.svelte";
import Address from "../views/AddAddressForm.svelte";
// import EmailForm from "../components/Login/EmailForm.svelte"
 import EmailPasswordForm from "../components/Login/EmailPasswordForm.svelte"
 import PasswordForm from "../components/Login/PasswordForm.svelte"
 import SellerDashboard from "../views/SellerDashboard.svelte";
 import SellerOrders from "../views/SellerOrders.svelte";
import MyProfile from "../views/MyProfile.svelte";
import MyOrders from "../views/MyOrders.svelte";
import ChangePassword from "../views/ChangePassword.svelte";

// import AddProduct from "../views/AddProduct.svelte";
import PaymentSuccess from "../views/PaymentSuccess.svelte";
import Search from "../components/Search.svelte";
import SingleProduct from "../components/singleProduct/SingleProduct.svelte"
import Invoice from "../views/Invoice.svelte";
export const routes = {
    "/" : Dashboard,
    "/login/seller/dashboard" : SellerDashboard,
    "/login/seller/dashboard/orders" : SellerOrders,
    "/about" : About,
    "/cart" : Cart,
    "/cart/buy" : OrderSummary,
    "/cart/buy/address": Address,
    "/cart/buy/payment":Payment,
    "/cart/buy/payment/success":PaymentSuccess,
    "/login/user" : Login,
    "/login/user/myprofile": MyProfile,
    "/login/user/myorders": MyOrders,
    "/login/user/myorders/invoice": Invoice,
    "/login/user/changepassword": ChangePassword,
     "/login/EmailPasswordForm" : EmailPasswordForm,
     "/login/PasswordForm" :PasswordForm,
    "/login/seller" : Login,
    "/search" : Search,
    "/product" : SingleProduct,
    "*" : NotFound
};
export default routes