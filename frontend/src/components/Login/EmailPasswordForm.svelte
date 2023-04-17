<script>
  import "../../assets/CSS/form.css";
  import UserController from "../../controllers/user";
  import { push, pop, replace } from "svelte-spa-router";
  import { checkPassword, validateEmail } from "../../utils/validations";
  import toast, { Toaster } from "svelte-french-toast";
  const userControllerClass = new UserController();
  import {
    loginStore,
  } from "../../controllers/store";
  let loginDetail = JSON.parse(localStorage.getItem("loginDetails"));
  let email = loginDetail.email;
  let password = "";
  let firstLoad = false;
  const createUser = async () => {
    firstLoad = true;
    let userData = { email: email, pwd: password };
    console.log(userData);
    let result = await userControllerClass.createUserController(userData);
    if (result.status === true) {
      console.log(result);
      loginStore.set(await result.data);
      localStorage.setItem("loggedInDetails", JSON.stringify(result.data));
      if (result.data.role === "Seller") {
        toast(`Welcome to Seller Dashboard`, {
          style: "border-radius: 200px; background: white; color:green;",
        });
        setTimeout(() => {
          push("/login/seller/dashboard");
        }, 1500);
      } else {
        toast(`${await result.message}`, {
          style: "border-radius: 200px; background: white; color:green;",
        });
        setTimeout(() => {
          push("/");
        }, 1500);
      }
    } else if (result.status === false) {
      toast(`${await result.message}`, {
        style: "border-radius: 200px; background: white; color:green;",
      });
    }
  };
</script>
<div
  class="container1"
  style="width: 30%; margin-top: 5%; margin-left: 33.33%;"
>
  <form>
    <h3><b>Sign Up Form </b></h3>
    <!-- Email input -->
    <div class="form-outline">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="form-label"
        >Email address <span class="star-mark">*</span> :</label
      >
      <input
        type="email"
        placeholder="Email Address"
        title="Enter a unique and valid email id"
        class="form-control"
        bind:value={email}
        required
      />
      {#if firstLoad && !validateEmail(email)}
        <div class="text-danger">Please enter valid email</div>
      {/if}
    </div>
    <!-- Email input -->

    <!-- Password input -->
    <div class="form-outline">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="form-label"
        >Password <span class="star-mark">*</span> :</label
      >
      <input
        type="password"
        title="Enter a valid password"
        placeholder="Password"
        class="form-control"
        bind:value={password}
        required
      />
      {#if firstLoad && password === "" && ! checkPassword (password)}
        <div class="text-danger">Please enter password</div>
      {/if}
    </div>
    <!-- Password input -->
    <!-- Submit button -->
    <button
      type="button"
      class="btn-block btn-myStyle"
      on:click|preventDefault={createUser}>SUBMIT</button
    >
  </form>
</div>
