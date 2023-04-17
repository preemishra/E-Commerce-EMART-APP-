<script>
  import Product from "../controllers/product";
  import { Confirm } from "svelte-confirm";
  import SvelteTooltip from "svelte-tooltip";
  // import { ordersStore, getSingleProductStore } from "../controllers/store";
  import { onMount } from "svelte";
  import UserController from "../controllers/user";
  import GroupOrder from "../utils/groupOrder";
  import toast, { Toaster } from "svelte-french-toast";
  import { push, pop, replace } from "svelte-spa-router";
  import Invoice from "./Invoice.svelte";
  const userControllerClass = new UserController();
  const groupByOrderClass = new GroupOrder();

  let allOrders;
  let loggedInDetails;
  let orderArray = [];
  let resultArray;
  let count = 0;
  onMount(async () => {
    loggedInDetails = await JSON.parse(localStorage.getItem("loggedInDetails"));
    console.log(loggedInDetails.user_id);
    let orders = await userControllerClass.userOrders(
      await loggedInDetails.user_id
    );
    let structuredOrders = await groupByOrderClass.groupByOrder(
      await orders.data,
      "order_id"
    );
    resultArray = Object.keys(structuredOrders).map((index) => {
      let person = structuredOrders[index];
      return person;
    });

    //for showing invoice button
  
    // for (let index = 0; index < resultArray.length; index++) {
    //   for (let j = 0; j < resultArray[index].length; j++) {
    //     console.log(resultArray[index]);
    //     if (resultArray[index][j].order_status === "Delivered") {
    //       count = count + 1;
    //       console.log(resultArray[index][j]+"count ="+count)
    //     } else {
    //       count = 0;
    //     }
    //   }
    // }
    // console.log(count);
    allOrders = await orders.data;
  });

  const cancelOrderByUser = async (id) => {
    let cancelOrderDetail = {
      updated_by: loggedInDetails.email,
      order_details_id: id,
      order_status: "Cancelled",
    };
    console.log(cancelOrderDetail);
    let result = await userControllerClass.cancelOrderByUser(cancelOrderDetail);
    console.log(result);
  };
  let invoice = false;
  let invoiceDetails;
  const downloadInvoice = async (data) => {
    console.log(data)
      push("/login/user/myorders/invoice");
  };
  //user address
  //seller address
  //product details
</script>

{#if invoice}
  <Invoice {invoiceDetails} />
{/if}
<main>
  {#if !Array.isArray(allOrders)}
    <h1 class="text-center">OOPS! You haven't ordered anything yet!</h1>
  {:else}
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <h3>My Orders</h3>
          <div class="row">
            <div class="col-md-12">
              {#each resultArray as arry, index}
                <div class="panel panel-default">
                  <div class="panel-heading">
                    <div class="row">
                      <h3><b>Order Id: </b>{arry[0].order_id}</h3>
                      <div class="col-xs-10 mr-4">
                        <p><b>Shipped Address :</b>{arry[0].address_type}</p>
                        <p>Contact No:{arry[0].contact}</p>
                        <p>
                          {arry[0].apartment},{arry[0].street},{arry[0]
                            .city},{arry[0].state}
                        </p>
                        <p>Pin Code:{arry[0].pin_code}</p>
                      </div>
                      {#each arry as order, index}
                      {#if order.order_status === "Delivered"}
                      <div class=" col-md-2">
                        <h4>Invoice:</h4>
                        <button class="btn" on:click={downloadInvoice(arry)}
                          >Download</button
                        >
                      </div>
                      {/if}
                      {/each}
                    </div>
                  </div>
                  {#each arry as order, index}
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

                            <!-- svelte-ignore missing-declaration -->

                            <span class="title" />
                            <Confirm
                              confirmTitle="Confirm"
                              cancelTitle="Back"
                              let:confirm={confirmThis}
                            >
                              <SvelteTooltip tip="Cancel" bottom color="grey">
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <a
                                  class="delete"
                                  data-toggle="tooltip"
                                  on:click={() =>
                                    confirmThis(
                                      cancelOrderByUser,
                                      order.order_details_id
                                    )}
                                >
                                  <!-- svelte-ignore a11y-missing-attribute -->
                                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                                  <path
                                    fill="hsl(200, 40%, 20%)"
                                    d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                                  /> <button class="btn">Cancel Order</button>
                                </a>
                              </SvelteTooltip>
                              <span slot="Confirm" />
                              <span slot="title">
                                Are you sure you want to cancel this order?
                              </span>
                              <span slot="description">
                                You won't be able to revert this!
                              </span>
                            </Confirm>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
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
  .btn {
    border: white;
    background-color: black;
    color: white;
  }
  .btn:hover {
    background-color: rgb(113, 112, 112);
    color: white;
  }
  .panel-default {
    margin: 20px;
    border-color: #ddd;
  }
</style>
