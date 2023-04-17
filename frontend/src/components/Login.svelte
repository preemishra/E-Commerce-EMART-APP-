<script>
  import "../assets/CSS/form.css";
  import UserController from "../controllers/user";
  const userControllerClass = new UserController();
  import { push, pop, replace } from "svelte-spa-router";
  import toast, { Toaster } from "svelte-french-toast";
  import { validateEmail } from "../utils/validations";
  $: userExist = "checkExist";
  let email;
  let password;

  const checkUserExist = async () => {
    let result = await userControllerClass.checkUserExistController(email);
    if (result.data.email === null) {
      localStorage.setItem(
        "loginDetails",
        JSON.stringify({ email: email})
      );
      toast(`${await result.message}`, {
        style: "border-radius: 200px; background: white; color:black;",
      });
      setTimeout(() => {
        push("/login/EmailPasswordForm");
      }, 1000);
     
    } else {
      localStorage.setItem(
        "loginDetails",
        JSON.stringify({ email: email})
      );
      toast(`${await result.message}`, {
        style: "border-radius: 200px; background: white; color:black;",
      });
      setTimeout(() => {
        push("/login/EmailPasswordForm");
      }, 1000);
      push("/login/PasswordForm");
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
      {#if !validateEmail(email)}
      <div class="text-danger">Please enter valid email</div>
    {/if}
      <button
        type="button"
        class="btn-block btn-myStyle"
        on:click|preventDefault={checkUserExist}>NEXT</button
      >
    </div>
  </form>
</div>
