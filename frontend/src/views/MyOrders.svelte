<script>
    import Product from "../controllers/product";
    import { CartItemsStore, getSingleProductStore } from "../controllers/store";
    const productClass = new Product();
  
    let cartItemData;
    CartItemsStore.subscribe((value) => {
      let cartItem = value;
      cartItemData = cartItem;
    });
    console.log(cartItemData);
  </script>
  
  <main>
    {#if cartItemData.length === 0}
      <h1 class="text-center">OOPS! You haven't ordered anything yet!</h1>
    {:else}
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <h1>My Orders</h1>
            <div class="row">
              <div class="col-md-12">
                {#each $CartItemsStore as cartItem, index}
                  <div class="panel panel-default">
                    <div class="panel-body">
                      <div class="row">
                        <div class="col-md-2">
                          <!-- svelte-ignore a11y-img-redundant-alt -->
                          <img
                            src={cartItem.picture}
                            class="img-responsive"
                            alt="Product Image"
                          />
                        </div>
                        <div class="col-md-8">
                          <h4><b>Order Placed</b></h4>

                          <h4><b>{cartItem.product_name}</b></h4>
                          <p>{cartItem.descriptions}</p>
                          <h4><b>Price: ₹ {cartItem.price}</b></h4>
                          
                        </div>
                        <div class="col-md-2">
                          <h5><b>Invoice: </b><button class="btn">Download</button></h5>
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </main>
  
  <style>
    .btn{
      border: white;
        background-color: black;
        color: white;
    }
    .btn:hover{
        background-color: rgb(113, 112, 112);
        color: white;
    }
  </style>
  