<script>
    import SvelteTooltip from "svelte-tooltip";
    import { Confirm } from "svelte-confirm";
    import { fly } from "svelte/transition";
    import Product from "../controllers/product";
    import { push } from "svelte-spa-router";
    const productClass = new Product();
  
    export let productList;
  
    const deleteProduct = async (id) => {
      console.log(id);
      let product = await productClass.deleteProduct(id);
      console.log(product);
      if (product.status === 200) {
        await push("#/about");
        let product = await productClass.allProduct();
        productList = await product.data;
      } else {
        console.log("failed to delete");
        push("#/");
      }
    };
  </script>
  
  <main>
    <div class="table-wrapper">
      <table class="table table-striped table-hover table-bordered">
        <thead>
          <tr class="customFont">
            <th>#</th>
            <th>Product Name</th>
            <th>Product Description</th>
            <th>Product Unit Price (in rupees)</th>
            <th>Total Product Quantity</th>
            <th>Action</th>
          </tr>
        </thead>
  
        <tbody>
          {#each productList as list, i}
            <tr class="customFont" transition:fly={{ x: 200, y: 0 }}
              ><!-- transition:fly={{ x: 200, y: 0 }} -->
              <td>{i + 1}</td>
              <td> {list.product_name}</td>
              <td>{list.descriptions}</td>
              <td>{list.price}</td>
              <td>{list.product_qty}</td>
  
              <td class="wrapper">
                <!-- svelte-ignore missing-declaration -->
                <SvelteTooltip tip="Update" bottom color="#566787">
                  <!-- svelte-ignore a11y-missing-attribute -->
                  <a class="update" data-toggle="tooltip">
                    <i class="material-icons">&#xE8B8;</i>
                  </a>
                </SvelteTooltip>
  
                <!-- svelte-ignore missing-declaration -->
                <Confirm
                  confirmTitle="Delete"
                  cancelTitle="Cancel"
                  let:confirm={confirmThis}
                >
                  <SvelteTooltip tip="Delete" bottom color="#566787">
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <a
                      class="delete"
                      data-toggle="tooltip"
                      on:click={() => confirmThis(deleteProduct, list.product_id)}
                    >
                      <!-- on:click={() => confirmThis(deleteHandler, uData.user_id)} -->
                      <path
                        fill="hsl(200, 40%, 20%)"
                        d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                      /><i class="material-icons">&#xE5C9;</i>
                    </a>
                    <span slot="title"> Delete this user? </span>
                  </SvelteTooltip>
                </Confirm>
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
      min-width: 245%;
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
  