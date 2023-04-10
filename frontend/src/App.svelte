<script>
  import Router, { link } from "svelte-spa-router";
  import Navbar from "./components/shared/Navbar.svelte";
  import { routes } from "./routes/routes";
</script>
<main>
 <Navbar/>
  <Router {routes}/>
</main>