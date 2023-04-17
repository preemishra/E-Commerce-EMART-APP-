<script>
  import { push, pop, replace } from "svelte-spa-router";
  import UserController from "../controllers/user";
  const userControllerClass = new UserController();
  let payment_method = "Select Payment Method";
  let paymentDetails;
  let total_amount;
  let productDetail = JSON.parse(sessionStorage.getItem("productId"));
  let addressDetail = JSON.parse(sessionStorage.getItem("address"));
  paymentDetails = productDetail;
  total_amount = addressDetail.total_amount
  const selectPaymentMethod = async () => {
    // if(payment_method !== "Select Payment Method")
    try {
      let paymentData = {
        created_by: addressDetail.email,
        updated_by: addressDetail.email,
        pay_method: payment_method,
        total_amount: total_amount,
        payment_status: "Success",
        order_id: addressDetail.order_id,
        order_status: "Placed",
      };
      let result = await userControllerClass.paymentDetailController( paymentData);
      if (await result.status === true) {
        push("/cart/buy/payment/success");
        // replace("/cart/buy/payment")
        // window.history.go(-1); return false;
      }
      
    } catch (error) {
      push("/cart/buy/payment");
    }
  };
</script>

<div
  class="container1"
  style="width: 30%; margin-top: 5%; margin-left: 33.33%;"
>
  <form>
    <h1>PAYMENT</h1>
    <div class="form-outline">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="form-label"
        >Payment Method <span class="text-danger">*</span> :</label
      >
      <select
        id="payment"
        name="payment"
        class="form-control"
        bind:value={payment_method}
      >
        <option value="Select Payment Method">Select Payment Method</option>
        <option value="Cash On Delivery">Cash on Delivery</option>
        <option value="Online">Online</option>
      </select>
      {#if payment_method === "Select Payment Method"}
        <div class="text-danger">Please select payment method</div>
      {/if}
    </div>

    <div class="form-outline">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="form-label"
        >Total Amount <span class="text-danger">*</span> :</label
      >
      <input
        type="text"
        placeholder={total_amount}
        class="form-control"
        readonly
      />
    </div>

    <!-- Submit button -->

    <button
      type="button"
      class="btn btn-primary btn-block btn-myStyle"
      on:click={selectPaymentMethod}>PAY</button
    >
  </form>
</div>

<style>
  h1 {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #080808;
    font-family: "Varela Round", sans-serif;
    margin-bottom: 20px;
  }
  .form-label {
    font-size: 14px;
    color: #1f2021;
    font-weight: bold;
    font-family: "Varela Round", sans-serif;
  }

  span {
    color: red;
  }
  .btn {
    background-color: #63696c;
  }
  .btn-myStyle {
    font-family: "Varela Round", sans-serif;
    background-color: #0b0b0b;
  }
  .btn-myStyle:hover {
    background-color: #63696c;
  }
</style>
