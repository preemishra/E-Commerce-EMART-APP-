<script>
    import { onMount } from "svelte";
    import SvelteTooltip from "svelte-tooltip";
    import { fly } from "svelte/transition";
    import Product from "../controllers/product"; 
  import { identity } from "svelte/internal";
    // import { push } from "svelte-spa-router";
    const productClass = new Product();
  
    let sellerDetail
    let orderList = [];
    onMount(async () => {
       sellerDetail = JSON.parse(localStorage.getItem("loggedInDetails"));
      let orders = await productClass.sellerOrders(sellerDetail.user_id);
      orderList = await orders.data;
      console.log(orderList)
    });

    const changeOrderStatus =async (id,status)=>{
      let updateOrderDetail={
        updated_by:sellerDetail.email,
        order_details_id:id,
        order_status:status
      }
      console.log(updateOrderDetail)
      let result = await productClass.updateOrder(updateOrderDetail);
      console.log(result)
    }
  </script>
  
  <main>
    <div class="table-wrapper">
    <h3><b>ORDERS</b></h3>
      <table class="table table-striped table-hover table-bordered">
        <thead>
          <tr class="customFont">
            <th>#</th>
            <th>Order Id</th>
            <th>Customer Name</th>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Order Quantity</th>
            <th>Unit  price</th>
            <th>Order Status</th>
            <th>Shipping Address</th>
            <!-- <th>Created On</th> -->
            <!-- <th>Delivered On</th> -->
            <th>Edit Order Status</th>
          </tr>
        </thead>
  
        <tbody>
          {#each orderList as list, i}
            <tr class="customFont"
              ><!-- transition:fly={{ x: 200, y: 0 }} -->
              <td>{i + 1}</td>
              <td> {list.order_id}</td>
              <td> {list.full_name}</td>
              <td> {list.product_id}</td>
              <td> {list.product_name}</td>
              <td> {list.ordered_qty}</td>
              <td> {list.unit_price}</td>
              <td> 
                <select bind:value={list.order_status} on:change={changeOrderStatus(list.order_details_id,list.order_status)} >
                  <option value="In Process">In Process</option>
                  <option value="Placed">Placed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>

                </select>
              </td>
              <td> {list.address_type},{list.contact},{list.pin_code},{list.state},{list.city},{list.street},{list.apartment}</td>
              <!-- <td>{list.createdAt}</td> -->
              <td class="wrapper">
                <!-- svelte-ignore missing-declaration -->
                <SvelteTooltip tip="Update" bottom color="#566787">
                  <!-- svelte-ignore a11y-missing-attribute -->
                  <a class="update" data-toggle="tooltip">
                    <i class="material-icons">&#xE8B8;</i>
                  </a>
                </SvelteTooltip>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </main>
  
  <style>
    main {
      color: #080808;
      background: #ffffff;
      font-family: "Varela Round", sans-serif;
      font-size: 13px;
      padding: 0%;
    }
    .table-wrapper {
      min-width: 98%;
      background: #fff;
      padding: 8px 25px;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
    }
    table.table tr th,
    table.table tr td {
      border-color: #e9e9e9;
      padding: 12px 15px;
      vertical-align: middle;
    }
    /* tr td:first-child:before {
      counter-increment: Serial; Increment the Serial counter
      content: counter(Serial); Display the counter
    } */
    table.table tr th:first-child {
      width: 60px;
    }
    table.table tr th:last-child {
      width: 100px;
    }
    table.table-striped tbody tr:nth-of-type(odd) {
      background-color: #fcfcfc;
    }
    table.table-striped.table-hover tbody tr:hover {
      background: #f5f5f5;
    }
    table.table th i {
      font-size: 13px;
      margin: 0 5px;
      cursor: pointer;
    }
    table.table td:last-child i {
      opacity: 0.9;
      font-size: 22px;
      margin: 0 5px;
    }
    table.table td a {
      font-weight: bold;
      color: #0c0c0c;
      display: inline-block;
      text-decoration: none;
    }
    table.table td a:hover {
      color: #2196f3;
    }
    table.table td a.update {
      color: #0d0d0e;
      cursor: pointer;
    }
    table.table td a.delete {
      color: #f44336;
      cursor: pointer;
    }
    table.table td i {
      font-size: 19px;
    }
    table.table {
      border-radius: 50%;
      vertical-align: middle;
      /* margin-right: 10px; */
    }
    .customFont {
      color: #090909;
    }
  </style>