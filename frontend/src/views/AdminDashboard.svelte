<script>
  import SvelteTooltip from "svelte-tooltip";
  import { Confirm } from "svelte-confirm";
  import { fly } from "svelte/transition";
  import Product from "../controllers/product";
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  const productClass = new Product();

  let searchByName = "";
  let userList = [];
  onMount(async () => {
    let user = await productClass.allUser();
    userList = await user.data;
    console.log(userList);
  });

  const searchUser = async () => {
    let result = await productClass.searchUser(searchByName);
    console.log(await result);
    userList = result.data;
  };

  const deleteUser = async (id) => {
    console.log(id);
    let user = await productClass.deleteUser(id);
    console.log(user);
    if (user.status === 200) {
      await push("#/about");
      let user = await productClass.allProduct();
      userList = await user.data;
    } else {
      console.log("Failed to delete user");
      push("#/");
    }
  };
</script>

<main>
  <h3>Administrator Dashboard</h3>
  <div class="container form-outline">
    <input
      type="search"
      id="form1"
      class="form-control"
      placeholder="Search User"
      aria-label="Search"
      bind:value={searchByName}
      on:keypress={(e) => {
        if (e.key === "Enter") {
          searchUser();
        }
      }}
    />
  </div>
  <div class="table-wrapper">
    <table class="table table-striped table-hover table-bordered">
      <thead>
        <tr class="customFont">
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {#each userList as list, i}
          <tr class="customFont" transition:fly={{ x: 200, y: 0 }}>
            <td>{i + 1}</td>
            <td> {list.full_name}</td>
            <td>{list.email}</td>
            <td class="wrapper text-center">
              <!-- svelte-ignore missing-declaration -->
              <!-- svelte-ignore missing-declaration -->
              <Confirm
                confirmTitle="Delete"
                cancelTitle="Cancel"
                let:confirm={confirmThis}
              >
                <SvelteTooltip tip="Delete" bottom color="grey">
                  <!-- svelte-ignore a11y-missing-attribute -->
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <a
                    class="delete"
                    data-toggle="tooltip"
                    on:click={() => confirmThis(deleteUser, list.user_id)}
                  >
                    <path
                      fill="hsl(200, 40%, 20%)"
                      d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                    /><i class="material-icons">&#xE5C9;</i>
                  </a>
                  <span slot="title"> Delete this user? </span>
                </SvelteTooltip>
              </Confirm>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</main>

<style>
  main {
    color: #080808;
    background: #ffffff;
    font-family: "Varela Round", sans-serif;
    font-size: 13px;
    padding: 0%;
  }
  .table-wrapper {
    min-width: 100%;
    background: #fff;
    padding: 8px 25px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  }
  table.table tr th,
  table.table tr td {
    border-color: #e9e9e9;
    padding: 12px 15px;
    vertical-align: middle;
  }
  /* tr td:first-child:before {
      counter-increment: Serial; Increment the Serial counter
      content: counter(Serial); Display the counter
    } */
  table.table tr th:first-child {
    width: 60px;
  }
  table.table tr th:last-child {
    width: 100px;
  }
  table.table-striped tbody tr:nth-of-type(odd) {
    background-color: #fcfcfc;
  }
  table.table-striped.table-hover tbody tr:hover {
    background: #f5f5f5;
  }
  table.table th i {
    font-size: 13px;
    margin: 0 5px;
    cursor: pointer;
  }
  table.table td:last-child i {
    opacity: 0.9;
    font-size: 22px;
    margin: 0 5px;
  }
  table.table td a {
    font-weight: bold;
    color: #0c0c0c;
    display: inline-block;
    text-decoration: none;
  }
  table.table td a:hover {
    color: #2196f3;
  }
  table.table td a.delete {
    color: #f44336;
    cursor: pointer;
  }
  table.table td i {
    font-size: 19px;
  }
  table.table {
    border-radius: 50%;
    vertical-align: middle;
    /* margin-right: 10px; */
  }
  .customFont {
    color: #090909;
  }
</style>
