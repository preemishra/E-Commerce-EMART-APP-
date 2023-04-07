<script>
  import toast from "svelte-french-toast";
    import "../assets/CSS/form.css";
  import UserController from "../controllers/user";
  import { checkPassword } from "../utils/validations";
  import { push } from "svelte-spa-router";
    let firstLoad = false
    let pass = {
      old_password: "",
      new_password: "",
      confirm_password: "",
    };
    const userControllerClass = new UserController();
  
    const changePassword = async (body) => {
      firstLoad = true
      console.log((pass.new_password !== pass.confirm_password));
      
      if (
        firstLoad &&  checkPassword(pass.old_password) && checkPassword (pass.new_password) && (pass.new_password === pass.confirm_password) && (pass.new_password !== pass.old_password)
      ) {
        let result = await userControllerClass.changePasswordController(pass.old_password,pass.new_password,pass.confirm_password);
        console.log(result)
        if (result.status === true) {
          push("/")
        }
        else{
          console.log(result.message)
        }
      }
      else{
        console.log("Password Update Failed")
      }

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
        <label class="form-label">Old Password <span>*</span> :</label>
        <input
          type="password"
          placeholder="Enter Old Password"
          class="form-control"
          bind:value={pass.old_password}
        />
        {#if firstLoad && ! checkPassword(pass.old_password)}
          <div class="text-danger">Please enter valid password</div>
        {/if}
      </div>
  
      <div class="form-outline">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="form-label">New Password <span>*</span> :</label>
        <input
          type="password"
          placeholder="Enter New Password"
          class="form-control"
          bind:value={pass.new_password}
        />
        {#if firstLoad && ! checkPassword(pass.new_password)}
          <div class="text-danger">Password should be greater than 8 digits and at must contain 1 number,1 special character, 1 upper and 1 lower case letter</div>
        {/if}
      </div>
  
      <div class="form-outline">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="form-label"
          >Confirm Password <span>*</span> :</label
        >
        <input
          type="password"
          placeholder="Enter Confirm Password"
          class="form-control"
          bind:value={pass.confirm_password}
        />
        {#if firstLoad && pass.confirm_password !== pass.new_password}
          <div class="text-danger">Mismatch new password and confirm password.</div>
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
    h3{
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: #080808;
      font-family: "Varela Round", sans-serif;
      margin-bottom: 20px;
    }
    span{
      color:red;
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
  