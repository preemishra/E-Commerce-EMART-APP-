<script>
  import "../assets/CSS/form.css";
  import { checkPassword } from "../utils/validations";
  let firstLoad = false;
  let pass = {
    old_password: "",
    new_password: "",
    confirm_password: "",
  };

  const changePassword = async (pass) => {
    firstLoad = true;
    console.log(pass);
  };
</script>

<div
  class="container1"
  style="width: 30%; margin-top: 5%; margin-left: 33.33%;"
>
  <form>
    <h3><b>Change Password</b></h3>

    <div class="form-outline">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="form-label">Old Password :</label>
      <input
        type="text"
        placeholder="Enter Old Password"
        class="form-control"
        bind:value={pass.old_password}
        required
      />
      {#if firstLoad && !checkPassword(pass.old_password)}
        <div class="text-danger">Please enter valid password</div>
      {/if}
    </div>

    <div class="form-outline">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="form-label">New Password :</label>
      <input
        type="text"
        placeholder="Enter New Password"
        class="form-control"
        bind:value={pass.new_password}
        required
      />
      {#if firstLoad && !checkPassword(pass.new_password)}
        <div class="text-danger">
          Password should be greater than 8 digits and at must contain 1
          number,1 special character, 1 upper and 1 lower case letter
        </div>
      {/if}
    </div>

    <div class="form-outline">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="form-label">Confirm Password :</label>
      <input
        type="text"
        placeholder="Enter Confirm Password"
        class="form-control"
        bind:value={pass.confirm_password}
        required
      />
      {#if firstLoad && pass.confirm_password !== pass.new_password}
        <div class="text-danger">
          Mismatch new password and confirm password.
        </div>
      {/if}
    </div>

    <!-- Submit button -->
    <button
      type="button"
      class="btn btn-primary btn-block btn-myStyle"
      on:click|preventDefault={() => {
        changePassword(pass);
      }}>CHANGE PASSWORD</button
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
