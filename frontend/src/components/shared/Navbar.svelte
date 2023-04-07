<script>
  import { onMount } from "svelte";
  import Product from "../../controllers/product";
  import { CartItemsStore ,getSingleProductStore,loginStore} from "../../controllers/store";
  const productClass = new Product();
  const logo =
    "https://res.cloudinary.com/dgb9aajxo/image/upload/v1679737882/logo_ffaqcn.png";
  // let loginDetail = JSON.parse(sessionStorage.getItem("user"));
  // let user_id = loginDetail.user_id;
  // let full_name = loginDetail.full_name;
  
 let  block
// let loginDetail=null
 onMount(async () => {
    let product = await productClass.itemsInLocalCart();
    cartItem = product;
    increment(cartItem);
    
  });
  let loginDetail
  loginStore.subscribe((value) => {
    console.log(value)
   loginDetail = value;
  });
  // getSingleProductStore.subscribe((value) => {
  //   localStorage.getItem('loggedInDetails')
  // })
 
  let cartItem;
  CartItemsStore.subscribe((value) => {
    cartItem = value.length;
    console.log(cartItem);
  });
  
  let increment = async (cartItems) => {
    CartItemsStore.set(await cartItems);
  };
  const navData = async (id) => {
    let singleProduct = await productClass.getSingleProductFromDb(id);
    console.log(singleProduct);
    return await singleProduct;
  };
</script>
<main>
  <nav class="navbar navbar-inverse">
    <div class="container-fluid">
      <div class="navbar-header">
        <img class="navbar-brand" src={logo} alt="EMART" />
      </div>
      <!-- <ul class="nav navbar-nav" /> -->
      <ul class="nav navbar-nav navbar-right">
        <li class="active"><a href="#/">Home</a></li>
        <li class="active"><a href="#/about">About</a></li>
        <li class="active">
          <slot
            ><a href="#/cart"
              ><span class="glyphicon glyphicon-shopping-cart " />Cart
              <span class="cartQty">{cartItem}</span></a
            ></slot
          >
        </li>
        {#if (loginDetail===null ||loginDetail===undefined||loginDetail.length===0)}
          <li class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#/login"
              ><span class="glyphicon glyphicon-log-in" /> Login<span
                class="caret"
              /></a
            >
            <ul class="dropdown-menu">
              <li><a href="#/login/user">Login as User</a></li>
              <li><a href="#/login/seller">Login as Seller</a></li>
            </ul>
          </li>
        {:else if loginDetail }
          <!-- ----------------------------------------------After Login user profile icon----------------------------------------- -->
          <ul class="navbar-nav">
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdownMenuLink"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  fill="currentColor"
                  class="bi bi-person-circle"
                  viewBox="0 0 16 16"
                >
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  <path
                    fill-rule="evenodd"
                    d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                  />
                </svg>
              </a>
              <div
                class="dropdown-menu"
                aria-labelledby="navbarDropdownMenuLink"
              >
                <li>
                  <p class="dropdown-item" href="#">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{JSON.parse(localStorage.getItem('loggedInDetails')).email}!
                  </p>
                </li>
                <li><a class="dropdown-item" href="#/login/user/myprofile">Edit Profile</a></li>
                <li><a class="dropdown-item" href="#/login/user/myorders">My Orders</a></li>
                <li><a class="dropdown-item" href="#/login/user/changepassword">Change Password</a></li>
                <li><a class="dropdown-item" href="#/" on:click={()=>{
                localStorage.setItem("loggedInDetails",[]);
                loginStore.set([]);
                }
                }>Log Out</a></li>
              </div>
            </li>
          </ul>
        {/if}
        <!-- --------------------------------------------------------------------------------------- -->
      </ul>
    </div>
  </nav>
</main>
<style>
  nav ul {
    margin-left: auto;
  }
  nav .container-fluid {
    display: flex;
    /* justify-content: end; */
    align-items: center;
  }
  nav {
    padding: 20px;
    background-color: #0c0c0c;
    position: sticky;
    top: 0;
  }
  nav li a {
    padding: 0 20px;
  }
  main {
    text-align: center;
    max-width: 240px;
    margin: 0 auto;
  }
  .navbar-brand {
    padding: 0 20px;
    width: 100px;
    height: auto;
  }
  /* .navbar {
   background-color: #0C0C0C;
   margin: -16px;
 } */
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
  .cartQty {
    position: absolute;
    left: 61px;
    top: -12px;
    text-align: center;
    border-radius: 7px;
    width: 18px;
    height: 18px;
    background-color: #ff6161;
    border: 1px solid #fff;
    font-weight: 400;
    color: #f0f0f0;
    line-height: 16px;
    font-size: 12px;
  }
</style>