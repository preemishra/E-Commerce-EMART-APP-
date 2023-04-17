<script>
  import Product from "../controllers/product";
  import { onMount } from "svelte";
  import { push, pop, replace } from "svelte-spa-router";
  import { CartItemsStore } from "../controllers/store";
  const productClass = new Product();
  export let picture;
  export let product_id;
  export let descriptions;
  export let product_name;
  export let price;
  let CartItems;

  const AddIProductInCart = async () => {
    let cart = { product_id, picture, product_name, price, descriptions };
    CartItems = await productClass.addToCartInLocal(cart);
    let totalData = await productClass.itemsInLocalCart();
    increment(totalData);
  };

  let increment = async (CartItems) => {
    CartItemsStore.set(await CartItems);
  };

  const getSingleProduct = async () => {
    let cart = { product_id, picture, product_name, price, descriptions };
    let result = await productClass.singleProductData(product_id);
    sessionStorage.setItem("singleProduct", JSON.stringify(result.data));
    push("#/product");
    console.log(await result);
  };
</script>

<div>
  <div class="card">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <a href="#"
      ><div
        class="image"
        style="background-image: url({picture})"
        on:click={getSingleProduct}
      /></a
    >
    <h6>{product_name}</h6>
    <h5>₹{price}</h5>
    <button class="btn" on:click|preventDefault={AddIProductInCart}
      >Add to cart</button
    >
  </div>
</div>

<style>
  .btn {
    width: 150px;
    background-color: black;
    color: white;
  }
  .btn:hover {
    background-color: rgb(119, 118, 118);
    color: white;
  }
  .image {
    height: 150px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
  .card {
    text-align: center;
    margin-bottom: 10px;
    margin-top: 10px;
  }
</style>
