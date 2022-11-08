<script>
  import Header from "./Header.svelte";
  import Sidebar from "./Sidebar.svelte";
</script>

<Header />
<Sidebar />
<main>
  <slot />
</main>
