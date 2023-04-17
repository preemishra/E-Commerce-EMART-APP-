<script>
  import { onMount } from "svelte";
  import Product from "../controllers/product";
  import SellerProduct from "./SellerProduct.svelte";
  const productClass = new Product();

  let productList = [];
  let searchByName = "";
  onMount(async () => {
   let sellerId = JSON.parse(localStorage.getItem("loggedInDetails")).user_id;
    let product = await productClass.viewSellerProduct(sellerId);
    productList = await product.data;
    console.log(productList);
  });
</script>

<main>
  <!-- <div>
    <Navbar />
  </div> -->
  <div class="container form-outline">
    <input
      type="search"
      id="form1"
      class="form-control"
      placeholder="Search Product"
      aria-label="Search"
      bind:value={searchByName}
      on:keypress={(e) => {
        if (e.key === "Enter") {
          searchValue();
        }
      }}
    />
  </div>
  <div class="product-list">
    <SellerProduct {productList} />
  </div>
</main>

<style>
  .product-list {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    margin-bottom: 5px;
  }

  .container {
    border: 1px solid rgb(253, 252, 252);
  }
</style>
