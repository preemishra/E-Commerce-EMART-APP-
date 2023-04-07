<script>
  import "../singleProduct/singleProduct.css";
  import Product from "../../controllers/product";
  import { onMount } from "svelte";
  import {
    CartItemsStore,
    getSingleProductStore,
  } from "../../controllers/store";
  import { push, pop, replace } from "svelte-spa-router";
  const productClass = new Product();
  let picture;
  let cartItem = "";
  let isAddress = ""; // from this in order page i will change address from default to new address
  onMount(async () => {
    cartItem = JSON.parse(sessionStorage.getItem("singleProduct"));
  });

  //for adding product to cart
  $: orderQty = 1;
  if (cartItem.product_qty===1||cartItem.ordered_qty===0) {
      orderQty=1;
    } else {
      orderQty = cartItem.ordered_qty;
    }
  const AddItemInCart = async () => {
    orderQty = orderQty + 1;
    let cart;
    console.log(cart);
    cart = cartItem;
    let addCart = {
      product_id: cart.product_id,
      picture: cart.picture,
      product_name: cart.product_name,
      price: cart.price,
      descriptions: cart.descriptions,
    };
    console.log(cartItem)
    await productClass.addToCartInLocal(addCart);
    let totalData = await productClass.itemsInLocalCart();
    increment(totalData);
  };

  const reduceFromCart = async (CartItem) => {
    if (orderQty <= 1) {
      return;
    } else {
      orderQty = orderQty - 1;
    }
    await productClass.reduceFromCartInLocal(CartItem);
    let totalData = await productClass.itemsInLocalCart();
    increment(totalData);
  };
  let increment = async (totalData) => {
    CartItemsStore.set(await totalData);
    sessionStorage.setItem("productId", JSON.stringify(totalData));
  };

  // for buy selected product
  const buyNow = async () => {
    let buyingProductDetail = {
      product_id: cartItem.product_id,
      product_name: cartItem.product_name,
      price: cartItem.price,
      descriptions: cartItem.descriptions,
      ordered_qty: orderQty,
      picture: cartItem.picture,
      isAddress: "",
    };
    sessionStorage.setItem("productId", JSON.stringify(buyingProductDetail));
    // localStorage.setItem("productId", JSON.stringify(buyingProductDetail));
    getSingleProductStore.set(buyingProductDetail);
    push("/cart/buy");
  };
</script>

<div class="container mt-5 mb-5">
  <div class="card">
    <div class="row g-0">
      <div class="col-md-6 border-end">
        <div class="d-flex flex-column justify-content-center">
          <div class="main_image">
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src={cartItem.picture} id="main_product_image" width="250" />
          </div>
          <!-- <div class="thumbnail_images">
            <ul id="thumbnail">
              <li>
                <img
                  on:click|preventDefault={changeImage(this)}
                  src={test}
                  width="70"
                />
              </li>
              <li>
                <img
                  onclick="changeImage(this)"
                  src={cartItem.picture}
                  width="70"
                />
              </li>
              <li>
                <img
                  onclick="changeImage(this)"
                  src={cartItem.picture}
                  width="70"
                />
              </li>
              <li>
                <img
                  onclick="changeImage(this)"
                  src={cartItem.picture}
                  width="70"
                />
              </li>
            </ul>
          </div> -->
        </div>
      </div>
      <div class="col-md-6">
        <h2><b>{cartItem.product_name}</b></h2>
        <p>{cartItem.descriptions}</p>
        <h4><b>Price: ₹{cartItem.price}</b></h4>
        <h5><b>Free Delivery</b></h5>
        <div class="mt-xl-5">
          <h5>Select Quantity:</h5>
        </div>
        <div class="row">
          <div class="col-md-1 col-sm-4">
            <button type="button" class="qty" on:click={reduceFromCart}
              >-</button
            >
          </div>
          <div class="col-md-1 col-sm-4">
            <button type="button" class="qty">{orderQty}</button>
          </div>
          <div class=" col-md-1 col-sm-4">
            <button type="button" class="qty" on:click={AddItemInCart}>+</button
            >
          </div>
        </div>
        <div class="top-buffer row">
          <a href="#/cart/buy">
            <div class="col-md-6">
              <button class="btn btn-lg" on:click|preventDefault={buyNow}
                >Buy Now</button
              >
            </div>
          </a>
          <div class="col-md-6">
            <button class="btn btn-lg" on:click|preventDefault={AddItemInCart}
              >Add to cart</button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .top-buffer {
    margin-top: 150px;
  }
  .qty {
    width: 40px;
    background-color: black;
    color: white;
  }
  .btn {
    width: 250px;
    background-color: black;
    color: white;
  }
  .btn:hover {
    background-color: rgb(91, 91, 91);
    color: white;
  }
  .qty:hover {
    background-color: rgb(91, 91, 91);
    color: white;
  }
</style>
