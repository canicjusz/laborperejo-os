<script>
  import { user } from "../stores";
  import { navigate } from "svelte-routing";

  export let loggedIn;
  export let to;

  let passed = true;

  //this sucks
  if (loggedIn) {
    if (!$user) {
      passed = false;
      navigate(to);
    }
  } else {
    if ($user) {
      passed = false;
      history.forward();
      navigate(to);
    }
  }
</script>

{#if passed}
  <slot />
{/if}
