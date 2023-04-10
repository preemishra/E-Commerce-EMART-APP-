<script>
    import Card from "./Card.svelte";
    import  Product from "../controllers/product"
  const productClass =new Product()
    let productList=[];
    let searchByName="";
    const searchValue=async ()=>{
      let result =await productClass.searchProduct(searchByName);
      console.log(await result)
      productList=result.data
     }
  </script>
  
  <main>
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
          {#each productList as products}
          <Card product_id={products.product_id} product_name={products.product_name} picture={products.picture} price={products.price}/>
        {/each}
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
  