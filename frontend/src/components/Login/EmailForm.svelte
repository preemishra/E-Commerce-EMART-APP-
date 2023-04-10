<script>
  import "../../assets/CSS/form.css";
  import { createEventDispatcher } from "svelte";
  import { push, pop, replace } from "svelte-spa-router";
  import { validateEmail } from "../../utils/validations";
  // import { allProduct } from "../controllers/product";
  const dispatch = createEventDispatcher();
  let email = "";
  let password = "";
  let firstLoad=false
  const submitButton = () => {
    firstLoad=true
    push("/login/EmailPasswordForm");
  };
</script>

<div
  class="container1"
  style="width: 30%; margin-top: 5%; margin-left: 33.33%;"
>
  <form>
    <h3><b>Login/SignUp</b></h3>
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
        on:click|preventDefault={submitButton}>SUBMIT</button
      >
    </div>
  </form>
</div>
