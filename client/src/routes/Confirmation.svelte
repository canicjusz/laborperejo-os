<script>
  import { navigate } from "svelte-routing";
  import axios from "axios";
  import { redirectIfLoggedIn } from "../shared";
  import { error } from "../stores";
  import Spinner from "../components/Spinner.svelte";

  export let token;

  redirectIfLoggedIn();

  axios
    .put("/api/account/confirmation", { token })
    .then(() => {
      navigate("/ensaluti");
    })
    .catch((err) => {
      error.change(err);
      navigate("/peti-konfirmigxjxetonon");
    });
</script>

<svelte:head>
  <title>Konfirmi registriĝon | Laborperejo</title>
  <meta
    name="description"
    content="Paĝo por konfirmi validecon de registriĝligilo ĉe laborperejo."
  />
</svelte:head>
<div class="spinner__container">
  <Spinner />
</div>
