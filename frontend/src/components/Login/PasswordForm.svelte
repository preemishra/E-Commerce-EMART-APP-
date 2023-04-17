<script>
  import "../../assets/CSS/form.css";
  import UserController from "../../controllers/user";
  import { push, pop, replace } from "svelte-spa-router";
  import { checkPassword, validateEmail } from "../../utils/validations";
  import {
    loginStore,
  } from "../../controllers/store";
  import toast, { Toaster } from "svelte-french-toast";
  const userControllerClass = new UserController();
  let firstLoad = false;
  let loginDetail = JSON.parse(localStorage.getItem("loginDetails"));

  let email = loginDetail.email;
  let password = "";

  const createUser = async () => {
    firstLoad = true;
    let userData = { email: email, pwd: password };
    console.log(userData);
    let result = await userControllerClass.createUserController(userData);
    if (result.status === true) {
      console.log(result);
      loginStore.set(await result.data);
      localStorage.setItem("loggedInDetails", JSON.stringify(result.data));
      if (result.data.role === Seller) {
        toast(`Welcome to Seller Dashboard`, {
          style: "border-radius: 200px; background: white; color:green;",
        });
        setTimeout(() => {
          push("/seller/dashboard");
        }, 1500);
      } else {
        toast(`${await result.message}`, {
          style: "border-radius: 200px; background: white; color:green;",
        });
        setTimeout(() => {
          push("/");
        }, 1500);
      }
    }else{
      console.log(result.message)
    }
  };
</script>

<Toaster />
<div
  class="container1"
  style="width: 30%; margin-top: 5%; margin-left: 33.33%;"
>
  <form>
    <h3><b>Login</b></h3>
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
      {#if firstLoad && password === "" && !checkPassword(password)}
        <div class="text-danger">Please enter valid password</div>
      {/if}
    </div>
    <!-- Password input -->
    <button
      type="button"
      class="btn-block btn-myStyle"
      on:click|preventDefault={createUser}>SUBMIT</button
    >
    <!-- Submit button -->
  </form>
</div>
