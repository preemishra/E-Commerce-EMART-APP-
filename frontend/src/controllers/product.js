import {
  getProductFromDb,
  searchProductFromDb,
  getSingleProductFromDb,
  viewSellerProductFromDb,
  viewSellerOrdersFromDb,
  updateOrderServices
} from "../services/product";
import { CartItemsStore } from "./store";
// get all products
class Product {
  async allProduct() {
    try {
      let productData = await getProductFromDb();
      return await productData;
    } catch (error) {
      console.log(error);
    }
  }


  async viewSellerProduct(sellerId) {
    try {
      let productData = await viewSellerProductFromDb(sellerId);
      return await productData;
    } catch (error) {
      console.log(error);
    }
  }
  async sellerOrders(sellerId) {
    try {
      let productData = await viewSellerOrdersFromDb(sellerId);
      return await productData;
    } catch (error) {
      console.log(error);
    }
  }
  

  async updateOrder(updateOrderDetail) {
    try {
      let productData = await updateOrderServices(updateOrderDetail);
      return await productData;
    } catch (error) {
      console.log(error);
    }
  }

  async searchProduct(searchData) {
    try {
      let search = await searchProductFromDb(searchData);
      return await search;
    } catch (error) {}
  }

  async singleProductData(id) {
    try {
      let singleProduct = await getSingleProductFromDb(id);
      return await singleProduct;
    } catch (error) {
      console.log(error);
    }
  }

  async addToCartInLocal(cartData) {
    try {
      let totalCart = JSON.parse(localStorage.getItem("userCart")) || [];
      cartData.qty = 1;
      if (totalCart.length === 0) {
        totalCart.push(await cartData);
        localStorage.setItem("userCart", JSON.stringify(totalCart));
        return;
      } else {
        for (let index = 0; index < totalCart.length; index++) {
          if (totalCart[index].product_id === cartData.product_id) {
            totalCart[index].qty = totalCart[index].qty + 1;
            localStorage.setItem("userCart", JSON.stringify(totalCart));
            break;
          } else if (index === totalCart.length - 1) {
            totalCart.push(await cartData);
            localStorage.setItem("userCart", JSON.stringify(totalCart));
            break;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async reduceFromCartInLocal(cartData) {
    try {
      let totalCart = JSON.parse(localStorage.getItem("userCart")) || [];
      
        for (let index = 0; index < totalCart.length; index++) {
          if (totalCart[index].product_id === cartData.product_id ) {
            if(totalCart[index].qty>1){
              totalCart[index].qty = totalCart[index].qty - 1;
              localStorage.setItem("userCart", JSON.stringify(totalCart));
              break;
            }
          } 
        }
      
    } catch (error) {
      console.log(error);
    }
  }

  async removeFromLocal(cartData) {
    try {
      let totalCart = JSON.parse(localStorage.getItem("userCart")) || [];
        for (let index = 0; index < totalCart.length; index++) {
          if (totalCart[index].product_id === cartData.product_id ) {
            totalCart.splice(index,1);    
            localStorage.setItem("userCart", JSON.stringify(totalCart));
            break;
          }
        }
    } catch (error) {
      console.log(error);
    }
}

  
  
  
  
  
  
  
  async itemsInLocalCart() {
    let cartItems = 0;
    try {
      let totalCart =
        (await JSON.parse(localStorage.getItem("userCart"))) || [];
      cartItems = await totalCart;
      console.log(cartItems);
      return await cartItems;
    } catch (error) {
      console.log(error);
    }
  }
}

export default Product;
