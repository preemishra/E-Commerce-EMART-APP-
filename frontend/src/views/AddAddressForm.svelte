<script>
  // import { routes } from "../routes/routes";
  import UserController from "../controllers/user";
  import OrderSummary from "../views/OrderSummary.svelte";
  // The push(url) method navigates to another page, just like clicking on a link
  import { push, pop, replace } from "svelte-spa-router";
  import {
    containsAlphabets,
    isZipNumber,
    validateEmail,
    validatePhoneNumber,
  } from "../utils/validations";
  const userControllerClass = new UserController();
  let firstLoad = false;
  let address = {
    full_name: "",
    email: "",
    contact: "",
    apartment: "",
    street: "",
    landmark: "",
    city: "Select City",
    state: "Select State",
    pin_code: "",
    address_type: "",
  };

  const saveAddress = async (saveAddress) => {
    try {
      firstLoad = true;
     
      if (
        firstLoad &&
          containsAlphabets(address.full_name) &&
          validateEmail(address.email) &&
          validatePhoneNumber(address.contact) &&
          !(address.apartment.length === 0) &&
          !(address.street.length === 0) &&
          !(address.landmark.length === 0) &&
          !(address.state === "Select State") &&
          !(address.city === "Select City") &&
          isZipNumber(address.pin_code) &&
          !(address.address_type.length === 0)
      ) {
        let result = await userControllerClass.saveAddressController(saveAddress);
      if (result.status === true) {
        let productDetail = JSON.parse(sessionStorage.getItem("productId")) || [];
        console.log(productDetail)
        let data={
            full_name: address.full_name,
            email: address.email,
            product_id: productDetail.product_id,
            product_name: productDetail.product_name,
            price: productDetail.price,
            descriptions: productDetail.descriptions,
            ordered_qty: productDetail.ordered_qty,
            picture: productDetail.picture,
            contact: address.contact,
            apartment: address.apartment,
            street: address.street,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            pin_code: address.pin_code,
            address_type: address.address_type,
            user_id: result.data.user_id,
            address_id: result.data.address_id,
          };
          sessionStorage.setItem("address",JSON.stringify(data));
          push("#/cart/buy/");
        } else {
          pop("#/cart/buy/");
        }
      }
    } catch (e) {
      throw e;
    }
  };
  const citiesByState = {
    "Select State": ["Select City"],
    "Andhra Pradesh": [
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Kurnool",
    ],
    "Arunachal Pradesh": [
      "Itanagar",
      "Naharlagun",
      "Pasighat",
      "Roing",
      "Tawang",
    ],
    Assam: ["Guwahati", "Silchar", "Dibrugarh", "Tezpur", "Jorhat"],
    Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
    Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    Goa: ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    Haryana: ["Chandigarh", "Faridabad", "Gurgaon", "Panipat", "Yamunanagar"],
    "Himachal Pradesh": ["Shimla", "Mandi", "Solan", "Baddi", "Dharamshala"],
    Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
    Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    Manipur: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul"],
    Meghalaya: ["Shillong", "Tura", "Jowai", "Williamnagar", "Baghmara"],
    Mizoram: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
    Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Phek"],
    Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Puri"],
    Punjab: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    Sikkim: ["Gangtok", "Namchi", "Ravangla", "Singtam", "Mangan"],
    "Tamil Nadu": [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Salem",
    ],
    Telangana: ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam"],
    Tripura: ["Agartala", "Udaipur", "Belonia", "Dharmanagar", "Kailashahar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
    Uttarakhand: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur"],
    "West Bengal": ["Kolkata", "Asansol", "Durgapur", "Siliguri", "Darjeeling"],
    "Andaman and Nicobar Islands": [
      "Port Blair",
      "Car Nicobar",
      "Bombooflat",
      "Mayabunder",
      "Diglipur",
    ],
    Chandigarh: ["Chandigarh"],
    "Dadra and Nagar Haveli": [
      "Silvassa",
      "Daman",
      "Diu",
      "Nani Daman",
      "Moti Daman",
    ],
    "Daman and Diu": ["Silvassa", "Daman", "Diu", "Nani Daman", "Moti Daman"],
    Delhi: ["New Delhi", "Gurgaon", "Noida", "Faridabad", "Ghaziabad"],
    "Jammu and Kashmir": [
      "Srinagar",
      "Jammu",
      "Anantnag",
      "Baramulla",
      "Udhampur",
    ],
    Ladakh: ["Leh", "Kargil", "Nubra Valley", "Zanskar", "Dras"],
    Lakshadweep: ["Kavaratti", "Agatti", "Amini", "Andrott", "Kalpeni"],
    Puducherry: ["Pondicherry", "Karaikal", "Mahe", "Yanam", "Ozhukarai"],
  };
  let getCitiesByState = (stateName) => {
    return citiesByState[stateName] || [];
  };
</script>

<main>
  <div
    class="container"
    style="width: 30%; margin-top: 3%; margin-left: 33.33%;"
  >
    <h1>ADD ADDRESS</h1>
    <div class="row g-3">
      <!-- Full Name -->
      <div class="col-md-12 col-sm-12">
        <label for="firstName" class="form-group fl fontLabel">
          Full Name <span class="required">*</span> :
        </label>
        <!-- svelte-ignore a11y-autofocus -->
        <input
          title="Only Alphabets Are Allowed"
          type="text"
          name="full_name"
          bind:value={address.full_name}
          class="form-control"
          placeholder="First Name + Last Name"
        />
        {#if firstLoad && !containsAlphabets(address.full_name)}
          <div class="text-danger">Only alphabets are allowed</div>
        {/if}
      </div>
      <!-- Full Name -->
      <!-- Contact -->
      <div class="col-md-6 col-sm-6">
        <label for="email" class="fl form-label">
          Email <span class="required">*</span>:
        </label>
        <!-- svelte-ignore missing-declaration -->
        <input
          type="text"
          name="email"
          placeholder="Email"
          class="form-control"
          bind:value={address.email}
        />

        {#if firstLoad && !validateEmail(address.email)}
          <div class="text-danger">Please enter a valid email</div>
        {/if}
      </div>
      <!-- Contact -->
      <!-- Contact -->
      <div class="col-md-6 col-sm-6">
        <label for="Contact" class="fl form-label">
          Contact <span class="required">*</span>:
        </label>
        <!-- svelte-ignore missing-declaration -->
        <input
          type="text"
          name="Contact"
          placeholder="Contact"
          class="form-control"
          bind:value={address.contact}
        />
        {#if firstLoad && !validatePhoneNumber(address.contact)}
          <div class="text-danger">Please enter a valid contact</div>
        {/if}
      </div>
      <!-- Contact -->
      <!-- Building/Apartment -->
      <div class="col-md-6 col-sm-6">
        <label for="address" class="fl form-label">
          Apartment <span class="required">*</span> :</label
        >
        <input
          title="Enter your address"
          type="Location"
          required
          name="Location"
          placeholder="Building/Apartment"
          class="form-control"
          bind:value={address.apartment}
        />
        {#if firstLoad && address.apartment.length === 0}
          <div class="text-danger">Apartment cannot be empty</div>
        {/if}
      </div>
      <!-- Building/Apartment -->
      <!-- Street Name or Locality -->
      <div class="col-md-6 col-sm-6">
        <label for="street1" class="fl form-label">
          Street Name <span class="required">*</span> :</label
        >
        <input
          type="text"
          name="street1"
          placeholder="Street Name/Locality"
          class="form-control"
          bind:value={address.street}
        />
        {#if firstLoad && address.street.length === 0}
          <div class="text-danger">Street name cannot be empty</div>
        {/if}
      </div>
      <!-- Street Name or Locality -->
      <!-- Landmark -->
      <div class="col-md-6 col-sm-6">
        <label for="street2" class="fl form-label">
          Landmark <span class="required">*</span>:
        </label>
        <!-- svelte-ignore missing-declaration -->
        <input
          type="text"
          name="street1"
          placeholder="Landmark"
          class="form-control"
          bind:value={address.landmark}
        />
        {#if firstLoad && address.landmark.length === 0}
          <div class="text-danger">Landmark cannot be empty</div>
        {/if}
      </div>
      <!-- Landmark -->
      <!-- State -->
      <div class="col-md-6 col-sm-6">
        <label for="State" class="fl form-label">
          State <span class="required">*</span> :</label
        >
        <select
          title="Select State"
          name="state"
          id="state"
          class="form-control"
          bind:value={address.state}
          on:change={() => {
            address.city = "Select City";
          }}
        >
          <option value="Select State">{address.state}</option>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Andaman and Nicobar Islands"
            >Andaman and Nicobar Islands</option
          >
          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
          <option value="Assam">Assam</option>
          <option value="Bihar">Bihar</option>
          <option value="Chhattisgarh">Chhattisgarh</option>
          <option value="Dadar and Nagar Haveli">Dadra and Nagar Haveli</option>
          <option value="Daman and Diu">Daman and Diu</option>
          <option value="Delhi">Delhi</option>
          <option value="Lakshadweep">Lakshadweep</option>
          <option value="Puducherry">Puducherry</option>
          <option value="Goa">Goa</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Haryana">Haryana</option>
          <option value="Himachal Pradesh">Himachal Pradesh</option>
          <option value="Jammu and Kashmir">Jammu and Kashmir</option>
          <option value="Jharkhand">Jharkhand</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Kerala">Kerala</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Manipur">Manipur</option>
          <option value="Meghalaya">Meghalaya</option>
          <option value="Mizoram">Mizoram</option>
          <option value="Nagaland">Nagaland</option>
          <option value="Odisha">Odisha</option>
          <option value="Punjab">Punjab</option>
          <option value="Rajasthan">Rajasthan</option>
          <option value="Sikkim">Sikkim</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Telangana">Telangana</option>
          <option value="Tripura">Tripura</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Uttarakhand">Uttarakhand</option>
          <option value="West Bengal">West Bengal</option>
        </select>

        <!-- State -->
        {#if firstLoad && address.state === "Select State"}
          <div class="text-danger">Please select your state</div>
        {/if}
        <!-- city -->
      </div>
      <div class="col-md-6 col-sm-6">
        <label for="City" class="fl form-label">
          City <span class="required">*</span> :</label
        >
        <select
          title="Select City"
          name="state"
          id="state"
          class={address.city === "Select City"
            ? "form-control is-invalid"
            : "form-control"}
          bind:value={address.city}
        >
          <option value={address.city}>{address.city}</option>
          {#each getCitiesByState(address.state) as cityName}
            <option value={cityName}>{cityName}</option>
          {/each}
        </select>
        {#if firstLoad && address.city === "Select City"}
          <div class="text-danger">Please select your city</div>
        {/if}
      </div>
      <!-- city -->
      <!-- Pin Code -->
      <div class="col-md-6 col-sm-6">
        <label for="pinCode" class="fl form-label">
          Pin Code <span class="required">*</span> :</label
        >
        <input
          title="Enter Pin Code"
          type="text"
          name="pin"
          class="form-control"
          placeholder="Pin Code"
          pattern="[0-9]{4}"
          maxlength="6"
          bind:value={address.pin_code}
        />
        {#if firstLoad && !isZipNumber(address.pin_code)}
          <div class="text-danger">Please enter valid pincode</div>
        {/if}
      </div>
      <!-- Pin Code -->
    </div>
    <!-- address_type -->
    <div class="col-md-10s">
      <label for="address_type" class="fl form-label">
        Address Type <span class="required">*</span>:
      </label>
      <!-- svelte-ignore missing-declaration -->
      <select
        type="text"
        name="address_type"
        placeholder="address type"
        class="form-control"
        bind:value={address.address_type}
      >
        <option value="Select Address Type">Select Address Type</option>
        <option value="Home">Home</option>
        <option value="Office">Office</option>
      </select>
      {#if firstLoad && address.address_type === "Select Address Type"}
        <div class="text-danger">Please select a address type</div>
      {/if}
    </div>
    <!-- Landmark -->
    <div style="text-align: center;">
      <!-- Submit button -->
      <button
        type="button"
        class="btn btn-primary btn-block btn-myStyle"
        on:click|preventDefault={() => {
          saveAddress(address);
        }}>ADD</button
      >
    </div>
  </div>
</main>

<style>
  h1 {
    text-align: center;
    font-size: 18px;
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
  span {
    color: red;
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
  .text-danger{
    font-size: 12px;
  }
</style>
