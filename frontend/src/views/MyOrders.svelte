<script>
    import Product from "../controllers/product";
    // import { ordersStore, getSingleProductStore } from "../controllers/store";
    import { onMount } from "svelte";
  import UserController from "../controllers/user";
  import toast, { Toaster } from "svelte-french-toast";
  const userControllerClass = new UserController();
  let allOrders;
  onMount(async () => {
    let loggedInDetails =await  JSON.parse(localStorage.getItem("loggedInDetails"));
    console.log(loggedInDetails.user_id)
    let orders = await userControllerClass.userOrders(await loggedInDetails.user_id);
    allOrders = await orders.data;
  });
  console.log(allOrders)
    
  </script>
  <main>
    {#if !Array.isArray(allOrders)}
      <h1 class="text-center">OOPS! You haven't ordered anything yet!</h1>
    {:else}
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <h1>My Orders</h1>
            <div class="row">
              <div class="col-md-12">
                {#each allOrders as order, index}
                  <div class="panel panel-default">
                    <div class="panel-body">
                      <div class="row">
                        <div class="col-md-2">
                          <!-- svelte-ignore a11y-img-redundant-alt -->
                          <img
                            src={order.picture}
                            class="img-responsive"
                            alt="Product Image"
                          />
                        </div>
                        <div class="col-md-8">
                          <h5><b>Order Status:</b> {order.order_status}</h5>
                          <h5><b>Product Name :</b> {order.product_name}</h5>
                          <h5><b>Product Descriptions :</b></h5>
                          <p>{order.descriptions}</p>
                          <p><b>Ordered Quantity:</b>{order.ordered_qty}</p>
                          <p><b>Total Price:</b> ₹ {order.unit_price}</p>
                          <p><b>Shipped Address :</b>{order.address_type}</p>
                          <p>Contact No: {order.contact},</p>
                          <p>{order.apartment},{order.street},{order.city},{order.state},</p>
                          <p>Pin Code: {order.pin_code}.</p>
                        </div>
                        <div class="col-md-2">
                         <h4>Invoice : <button class="btn">Download</button></h4>
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
  