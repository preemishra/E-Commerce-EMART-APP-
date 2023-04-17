<script>

</script>
<div class="offset-xl-2 col-lg-12 col-md-12 col-sm-12 col-12 padding">
  <div class="card h-100 padding">
    <div><h3>Tax Invoice</h3></div>
    <div class="row">
      <div class="col-sm-9"><h4>E-MART</h4></div>
      <div class="col-sm-3">
        <h4>Invoice Number:121212</h4>
        <h5>Date:12/12/2022</h5>
      </div>
    </div>
    <hr />
    <div class="card-body">
      <div class="row mb-12">
        <div class="col-sm-6">
          <h5>Sold By :</h5>
          <div><h4>Tejinder Singh</h4></div>
          <div>29, Singla Street</div>
          <div>Sikeston,New Delhi 110034</div>
          <div>Email: contact@bbbootstrap.com</div>
          <div>Phone: +91 9897 989 989</div>
        </div>
        <div class="col-md-6">
          <h5 class="mb-3">To:</h5>
          <div><h4 class="fw-bold">Tejinder Singh</h4></div>
          <div>478, Nai Sadak</div>
          <div>Chandni chowk, New delhi, 110006</div>
          <div>Email: info@tikon.com</div>
          <div>Phone: +91 9895 398 009</div>
        </div>
      </div>
      <hr />
      <div class="table-responsive-sm">
        <table class="table table-striped">
          <thead>
            <tr>
              <th class="center">#</th>
              <th>Item</th>
              <th>Description</th>
              <th class="right">Price</th>
              <th class="center">Qty</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            <!-- {#each product as p} -->
            <tr>
              <td class="center">1</td>
              <td class="left strong">Iphone 10X</td>
              <td class="left">Iphone 10X with headphone</td>
              <td class="right">$1500</td>
              <td class="center">10</td>
              <td class="right">$15,000</td>
            </tr>
            <!-- {/each} -->
          </tbody>
        </table>
      </div>
      <div class="row">
        <div class="col-lg-8 col-sm-5" />
        <div class="col-lg-4 col-sm-5 ml-auto">
          <table class="table table-clear">
            <tbody>
              <tr>
                <td class="left">
                  <strong class="text-dark">Subtotal</strong>
                </td>
                <td class="right">$28,809,00</td>
              </tr>
              <tr>
                <td class="left">
                  <strong class="text-dark">Discount (20%)</strong>
                </td>
                <td class="right">$5,761,00</td>
              </tr>
              <tr>
                <td class="left">
                  <strong class="text-dark">VAT (10%)</strong>
                </td>
                <td class="right">$2,304,00</td>
              </tr>
              <tr>
                <td class="left">
                  <strong class="text-dark">Total</strong>
                </td>
                <td class="right">
                  <strong class="text-dark">$20,744,00</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
   
  </div>
</div>

<style>
  body {
    background-color: #000;
  }

  .padding {
    padding: 2rem !important;
  }

  .card {
    margin-bottom: 30px;
    border: none;
    -webkit-box-shadow: 0px 1px 2px 1px rgba(154, 154, 204, 0.22);
    -moz-box-shadow: 0px 1px 2px 1px rgba(154, 154, 204, 0.22);
    box-shadow: 0px 1px 2px 1px rgba(154, 154, 204, 0.22);
  }

  .card-header {
    background-color: #fff;
    border-bottom: 1px solid #e6e6f2;
  }

  h3 {
    font-size: 20px;
  }

  h5 {
    font-size: 15px;
    line-height: 26px;
    color: #3d405c;
    margin: 0px 0px 15px 0px;
    font-family: "Circular Std Medium";
  }

  .text-dark {
    color: #3d405c !important;
  }
</style>
