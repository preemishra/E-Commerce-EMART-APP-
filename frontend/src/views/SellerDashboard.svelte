<script>
  import { onMount } from "svelte";
  import Product from "../controllers/product";
  import SellerProduct from "./SellerProduct.svelte";
  const productClass = new Product();

  let productList = [];
  let searchByName = "";
  onMount(async () => {
    let product = await productClass.allProduct();
    productList = await product.data;
    console.log(productList)
  });
  
  // const searchValue = async () => {
  //   let result = await productClass.searchProduct(searchByName);
  //   console.log(await result);
  //   productList = result.data;
  // };
</script>

<main>
  <!-- <div>
    <Navbar />
  </div> -->
  <div class="container form-outline ">
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
    
      <SellerProduct {productList}
     
      />
    
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
