
<script>
  import "../assets/CSS/form.css";
  let firstLoad = false
let product = {
    url : "",
    product_name :"",
    description : "",
    unit_price : "",
    product_qty : ""
}

const addProduct = async(product) => {
  console.log(product)

  try {
      firstLoad = true;
     
      if (
        firstLoad &&
          containsAlphabets(address.full_name) &&
          validateEmail(address.email) &&
          validatePhoneNumber(address.contact) &&
          !(address.apartment.length === 0) &&
          !(address.street.length === 0) &&
          !(address.landmark.length === 0) &&
          !(address.state === "Select State") &&
          !(address.city === "Select City") &&
          isZipNumber(address.pin_code) &&
          !(address.address_type.length === 0)
      ) {
        let result = await userControllerClass.saveAddressController(saveAddress);
      if (result.status === true) {
        let productDetail = JSON.parse(sessionStorage.getItem("productId")) || [];
        
        let data={
            full_name: address.full_name,
            email: address.email,
            product_id: productDetail.product_id,
            product_name: productDetail.product_name,
            price: productDetail.price,
            descriptions: productDetail.descriptions,
            ordered_qty: productDetail.ordered_qty,
            picture: productDetail.picture,
            contact: address.contact,
            apartment: address.apartment,
            street: address.street,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            pin_code: address.pin_code,
            address_type: address.address_type,
            user_id: result.data.user_id,
            address_id: result.data.address_id,
          };
          sessionStorage.setItem("address",JSON.stringify(data));
          push("#/cart/buy/");
        } else {
          pop("#/cart/buy/");
        }
      }
    } catch (e) {
      throw e;
    }
}

  </script>
  
  <div
    class="container1"
    style="width: 30%; margin-top: 5%; margin-left: 33.33%;"
  >
    <form>
      <h3><b>ADD PRODUCT</b></h3> 
      <div class="form-outline">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="form-label"
          >Product Image Url <span class="text-danger">*</span> :</label
        >
        <input
          type="text"
          placeholder="Enter Product image"
          class="form-control"
          bind:value={product.url}
          required
        />
        {#if product.url === ''}
          <div class="text-danger">URL can not be empty</div>
        {/if}
      </div>
  
      <div class="form-outline">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="form-label"
          >Product Name <span class="text-danger">*</span> :</label
        >
        <input
          type="text"
          placeholder="Enter Product Name"
          class="form-control"
          bind:value={product.product_name}
          required
        />
        {#if product.product_name === ''}
          <div class="text-danger">Product name can not be empty</div>
        {/if}
      </div>

      <div class="form-outline">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="form-label"
          >Product Description<span class="text-danger">*</span> :</label
        >
        <input
          type="text"
          placeholder="Enter Product Description"
          class="form-control"
          bind:value={product.description}
          required
        />
        {#if product.description === ''}
          <div class="text-danger">Product description can not be empty</div>
        {/if}
      </div>

      <div class="form-outline">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="form-label"
          >Product Unit Price<span class="text-danger">*</span> :</label
        >
        <input
          type="text"
          placeholder="Enter Product Unit Price"
          class="form-control"
          bind:value={product.unit_price}
          required
        />
        {#if product.unit_price === ''}
          <div class="text-danger">Please enter unit price</div>
        {/if}
      </div>

      <div class="form-outline">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="form-label"
          >Product Quantity<span class="text-danger">*</span> :</label
        >
        <input
          type="text"
          placeholder="Enter Product Quantity"
          class="form-control"
          bind:value={product.product_qty}
          required
        />
        {#if product.product_qty === '' && !isNaN(product.product_qty)}
          <div class="text-danger">Please enter valid product quantity</div>
        {/if}
      </div>
  
      <!-- Submit button -->
      <button
        type="button"
        class="btn btn-primary btn-block btn-myStyle" on:click|preventDefault={() => {
          addProduct(product);
        }}>ADD</button
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
  