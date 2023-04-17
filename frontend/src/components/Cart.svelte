<script>
  import Product from "../controllers/product";
  import { CartItemsStore, getSingleProductStore } from "../controllers/store";
  import { push, pop, replace } from "svelte-spa-router";
  const productClass = new Product();
  const AddItemInCart = async (cartItem) => {
    await productClass.addToCartInLocal(cartItem);
    let totalData = await productClass.itemsInLocalCart();
    increment(totalData);
  };
  const reduceFromCart = async (CartItem) => {
    await productClass.reduceFromCartInLocal(CartItem);
    let totalData = await productClass.itemsInLocalCart();
    increment(totalData);
  };
  const removeItemFromCart = async (cartItem) => {
    await productClass.removeFromLocal(cartItem);
    let totalData = await productClass.itemsInLocalCart();
    increment(totalData);
  };
  let increment = async (totalData) => {
    CartItemsStore.set(await totalData);
    sessionStorage.setItem("productId",JSON.stringify(totalData));
  };

  let cartItemData;
  let totalCart = JSON.parse(localStorage.getItem("userCart")) || [];
  CartItemsStore.set(totalCart);
  CartItemsStore.subscribe((value) => {
    let cartItem = value;
    cartItemData = cartItem;
    console.log(cartItemData.length);
  });

  $: calculateTotalPrice = () => {
    let totalPrice = 0;
    $CartItemsStore.forEach((item) => {
      totalPrice += item.price * item.qty;
    });
    return totalPrice;
  };
  const buyNow = async () => {
    let buyingProductDetail = {
      product_id: totalCart[0].product_id,
      product_name: cartItemData.product_name,
      price: cartItemData.price,
      descriptions: cartItemData.descriptions,
      ordered_qty: cartItemData.product_qty,
      picture: cartItemData.picture,
      isAddress: "",
    };
    
    sessionStorage.setItem("productId",JSON.stringify(totalCart));
    push("/cart/buy");
  };
</script>

<!-- <main> -->
  {#if cartItemData.length === 0}
    <h1 class="space-above text-danger text-center"><b>OOPS! Your Cart is Empty!</b></h1>
    <h5 class="text-center">Looks like you haven't added anything to your cart yet.</h5>
    <h6 class="text-center"> <a href="#/">Shop Now</a> </h6>
  {:else}
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <h1>Your Shopping Cart</h1>
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
                      <div class="col-md-6">
                        <h4>{cartItem.product_name}</h4>
                        <p>{cartItem.descriptions}</p>
                        <div class="btn-group" role="group">
                          <button
                            type="button"
                            class="btn btn-default"
                            on:click={() => {
                              reduceFromCart(cartItem);
                            }}>-</button
                          >
                          <button type="button" class="btn btn-default"
                            >{cartItem.qty}</button
                          >
                          <button
                            type="button"
                            class="btn btn-default"
                            on:click={AddItemInCart(cartItem)}>+</button
                          >
                        </div>
                        <button
                          type="button"
                          class="btn btn-danger "
                          on:click={removeItemFromCart(cartItem)}>Remove</button
                        >
                      </div>
                      <div class="col-md-4">
                        <h4>Price: ₹{cartItem.qty * cartItem.price}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
              <div class="panel panel-default">
                <div class="panel-footer">
                  <div class="row">
                    <div class="col-md-8">
                      <h4>Total: ₹{calculateTotalPrice()}</h4>
                    </div>
                    <a href="#/cart/buy">
                      <div class="col-md-4">
                        <button
                          type="button"
                          class="btn btn-success btn-lg btn-block"
                          on:click={buyNow}>Proceed to Buy</button
                        >
                      </div></a
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
<!-- </main> -->

<style>
  .space-above{
    margin-top: 100px;
  }
  .btn {
    border: white;
    background-color: black;
    color: white;
  }
  .btn:hover {
    background-color: rgb(113, 112, 112);
    color: white;
  }
</style>
