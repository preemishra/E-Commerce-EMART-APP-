<script>
  import "../assets/CSS/form.css";
  import UserController from "../controllers/user";
  import { push, pop, replace } from "svelte-spa-router";
  import { onMount } from "svelte";
  const userControllerClass = new UserController();
  let block;
  let loginUserAddress;
  let buyingProductDetail;
  let user_id;
  let product_id;
  let product_name;
  let unit_price;
  let order_status;
  let descriptions;
  let ordered_qty;
  let address_id;
  let count;
  let totalPrice;
  buyingProductDetail = JSON.parse(sessionStorage.getItem("productId"));
  loginUserAddress = JSON.parse(sessionStorage.getItem("address"));
  $: calculateTotalPrice = () => {
    let totalPrice = 0;
    if (buyingProductDetail.length >= 1) {
      buyingProductDetail.forEach((item) => {
        totalPrice += item.price * item.qty;
      });
      return totalPrice;
    } else {
      totalPrice = buyingProductDetail.price * buyingProductDetail.ordered_qty;
      return totalPrice;
    }
  };
  if (loginUserAddress === null) {
    block = "defaultData";
  } else {
    block = "savedData";
  }
  // let fillAddress = false;
  // const placeOrderDetail = async () => {
  //   if (loginUserAddress === null) {
  //     fillAddress = true;
  //   } else {
  //     let qty
  //     if (buyingProductDetail.ordered_qty===null) {
  //       qty=buyingProductDetail.qty
  //     } else {
  //       qty=buyingProductDetail.ordered_qty
  //     }
  //     let orderDetail = {
  //       user_id: loginUserAddress.user_id,
  //       product_id: buyingProductDetail.product_id,
  //       address_id: loginUserAddress.address_id,
  //       unit_price: buyingProductDetail.price * qty,
  //       created_by: loginUserAddress.email,
  //       updated_by: loginUserAddress.email,
  //       ordered_qty: qty,
  //     };
  //     let result = await userControllerClass.placeOrderController(orderDetail);
  //     console.log(result);
  //     if (result.status === true) {
  //       let data={
  //           full_name: loginUserAddress.full_name,
  //           email: loginUserAddress.email,
  //           product_id: buyingProductDetail.product_id,
  //           product_name: buyingProductDetail.product_name,
  //           price: buyingProductDetail.price,
  //           descriptions: buyingProductDetail.descriptions,
  //           ordered_qty: buyingProductDetail.ordered_qty,
  //           picture: buyingProductDetail.picture,
  //           contact: loginUserAddress.contact,
  //           apartment: loginUserAddress.apartment,
  //           street: loginUserAddress.street,
  //           landmark: loginUserAddress.landmark,
  //           city: loginUserAddress.city,
  //           state: loginUserAddress.state,
  //           pin_code: loginUserAddress.pin_code,
  //           address_type: loginUserAddress.address_type,
  //           user_id: loginUserAddress.user_id,
  //           address_id: loginUserAddress.address_id,
  //           order_id: result.data.order_id,
  //         };
          
  //       sessionStorage.setItem("address",JSON.stringify(data));
  //       push("/cart/buy/payment");
  //     } else {
  //       push("/cart/buy");
  //     }
  //   }
  // };

  let fillAddress = false;
  const placeOrderDetail = async () => {
    if (loginUserAddress === null) {
      fillAddress = true;
    } else {
      let qty
      if (buyingProductDetail.ordered_qty===null) {
        qty=buyingProductDetail.qty
      } else {
        qty=buyingProductDetail.ordered_qty
      }
      let userDetail = {
        user_id: loginUserAddress.user_id,
        product_id: buyingProductDetail.product_id,
        address_id: loginUserAddress.address_id,
        unit_price: buyingProductDetail.price * qty,
        created_by: loginUserAddress.email,
        updated_by: loginUserAddress.email,
        ordered_qty: qty,
      };

      let orderData={userDetail:userDetail,buyingProductDetail:buyingProductDetail}
      let result = await userControllerClass.placeOrderController(orderData);
      console.log(result);
      if (result.status === true) {
        let data={
            full_name: loginUserAddress.full_name,
            email: loginUserAddress.email,
            // product_id: buyingProductDetail.product_id,
            // product_name: buyingProductDetail.product_name,
            // price: buyingProductDetail.price,
            // descriptions: buyingProductDetail.descriptions,
            // ordered_qty: buyingProductDetail.ordered_qty,
            // picture: buyingProductDetail.picture,
            contact: loginUserAddress.contact,
            apartment: loginUserAddress.apartment,
            street: loginUserAddress.street,
            landmark: loginUserAddress.landmark,
            city: loginUserAddress.city,
            state: loginUserAddress.state,
            pin_code: loginUserAddress.pin_code,
            address_type: loginUserAddress.address_type,
            user_id: loginUserAddress.user_id,
            address_id: loginUserAddress.address_id,
            order_id: result.data.order_id,
            total_amount: result.data.returnUnitPrice
          };
          
        sessionStorage.setItem("address",JSON.stringify(data));
        push("/cart/buy/payment");
      } else {
        push("/cart/buy");
      }
    }
  };
</script>

<main>
  <div class="container">
    <h2>Order Summary</h2>
    <div class="row">
      <div class="col-md-10">
        <h4><b>Confirm Address:</b></h4>
      </div>

      <div class="col-md-2">
        <a href="#/cart/buy/address">
          <button class="btn-myStyle">Add Address</button>
        </a>
      </div>
      {#if fillAddress}
        <div class="fill-add text-danger">&nbsp;&nbsp;&nbsp;&nbsp;<b>Please fill your delivery address</b></div>
      {/if}
    </div>

    {#if block === "savedData"}
      <div class="row">
        <div class="col-md-3">
          <p>Full Name :</p>
        </div>
        <div class="col-md-9">{loginUserAddress.full_name}</div>
      </div>
      <div class="row">
        <div class="col-md-3">
          <p>Address:</p>
        </div>
        <div class="col-md-9">
          <p>
            {loginUserAddress.apartment}, {loginUserAddress.street},{loginUserAddress.landmark}
          </p>
          <p>
            {loginUserAddress.city} ,{loginUserAddress.state} , {loginUserAddress.pin_code}
          </p>
          <p>{loginUserAddress.address_type}</p>
        </div>
      </div>
      <div class="row">
        <div class="col-md-3">
          <p>Contact :</p>
        </div>
        <div class="col-md-9">{loginUserAddress.contact}</div>
      </div>
    {:else if block === "defaultData"}
      <div class="row">
        <div class="col-md-3">
          <!-- <h5>Please Fill Address <span>*</span></h5> -->
        </div>
      </div>
    {/if}
    <hr />

    <h4><b>Price Details:</b></h4>
    {#if buyingProductDetail.length >= 1}
      {#each buyingProductDetail as buyingProductDetail, index}
        <div class="row">
          <div class="col-md-6">
            <div class="row">
              <div class="col-md-6">
                <b><p>Product Name:</p></b>
              </div>
              <div class="col-md-6">
                <b>{buyingProductDetail.product_name}</b>
              </div>
            </div>
            <!-- <div class="row">
              <div class="col-md-6">
                <p>Product Quantity:</p>
              </div>
              <div class="col-md-6">{buyingProductDetail.qty}</div>
            </div> -->
            <div class="row">
              <div class="col-md-6">
                <p>Unit Price :</p>
              </div>
              <div class="col-md-6">₹ {buyingProductDetail.price}</div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <p>Delivery Charges:</p>
              </div>
              <div class="col-md-6">Free Delivery</div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <p>Total Amount ({buyingProductDetail.qty} item):</p>
              </div>
              <div class="col-md-6">
                ₹ {buyingProductDetail.price * buyingProductDetail.qty}
              </div>
            </div>
          </div>
        </div>
      {/each}
    {:else}
    <h4><b>Price Details:</b></h4>
      <div class="row">
        <div class="col-md-6">
          <div class="row">
            <div class="col-md-6">
              <p>Product Name:</p>
            </div>
            <div class="col-md-6">{buyingProductDetail.product_name}</div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <p>Product Quantity:</p>
            </div>
            <div class="col-md-6">{buyingProductDetail.ordered_qty}</div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <p>Price (1 item):</p>
            </div>
            <div class="col-md-6">₹ {buyingProductDetail.price}</div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <p>Delivery Charges:</p>
            </div>
            <div class="col-md-6">Free Delivery</div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <p>Total Amount:</p>
            </div>
            <div class="col-md-6">
              ₹ {buyingProductDetail.price * buyingProductDetail.ordered_qty}
            </div>
          </div>
        </div>
      </div>
    {/if}
    <div class=" panel panel-default">
      <div class="panel-footer">
        <div class="row">
          <div class="col-md-8">
            <h4>
              Grand total: ₹ {calculateTotalPrice()}
            </h4>
          </div>

          <div class="col-md-4">
            <button
              type="button"
              class="btn btn-myStyle btn-lg btn-block"
              on:click|preventDefault={placeOrderDetail}>Confirm Order</button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
 
</style>
