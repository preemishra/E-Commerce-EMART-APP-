<script>
  import "../assets/CSS/form.css";
  import { containsAlphabets, validateEmail } from "../utils/validations";
  let firstLoad = false;
  let profile = {
    full_name: "",
    email: JSON.parse(localStorage.getItem("loggedInDetails")).email,
  };

  const editProfile = async (profile) => {
    firstLoad = true;
    console.log(profile);
  };
</script>

<div
  class="container1"
  style="width: 30%; margin-top: 5%; margin-left: 33.33%;"
>
  <form>
    <h3><b>MY PROFILE</b></h3>
    <div class="form-outline">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="form-label">Full Name :</label>
      <input
        type="text"
        placeholder="Enter First Name + Last Name"
        class="form-control"
        bind:value={profile.full_name}
        required
      />
      {#if !containsAlphabets(profile.full_name) && firstLoad}
        <div class="text-danger">Please enter valid name</div>
      {/if}
    </div>

    <div class="form-outline">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="form-label">Email :</label>
      <input
        type="email"
        placeholder="Enter Email"
        class="form-control"
        bind:value={profile.email}
        required
      />
      {#if firstLoad && !validateEmail(profile.email) && profile.email === ""}
        <div class="text-danger">Please enter valid email</div>
      {/if}
    </div>

    <!-- Submit button -->
    <button
      type="button"
      class="btn btn-primary btn-block btn-myStyle"
      on:click|preventDefault={() => {
        editProfile(profile);
      }}>EDIT PROFILE</button
    >
  </form>
</div>

<style>
  h3 {
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
