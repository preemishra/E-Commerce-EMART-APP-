
<script>
    let url = ""
    let product_name = ""
    let description = ""
    let unit_price = ""
    let product_qty = ""

  </script>
  
  <div
    class="container1"
    style="width: 30%; margin-top: 5%; margin-left: 33.33%;"
  >
    <form>
      <h1>EDIT PRODUCT</h1>
      <div class="form-outline">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="form-label"
          >Product Image Url <span class="text-danger">*</span> :</label
        >
        <input
          type="text"
          placeholder="Enter Product image"
          class="form-control"
          bind:value={url}
          required
        />
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
          bind:value={product_name}
          required
        />
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
          bind:value={description}
          required
        />
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
          bind:value={unit_price}
          required
        />
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
          bind:value={product_qty}
          required
        />
      </div>
  
      <!-- Submit button -->
      <button
        type="button"
        class="btn btn-primary btn-block btn-myStyle">EDIT</button
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
  