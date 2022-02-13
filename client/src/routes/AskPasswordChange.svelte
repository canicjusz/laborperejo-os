<script>
  import axios from "axios";
  import * as yup from "yup";
  import { redirectIfLoggedIn } from "../shared";
  import { error, feedback } from "../stores";
  let email = "";
  let inputError = undefined;
  let sending = false;

  redirectIfLoggedIn();

  const schema = yup
    .string()
    .required("Bonvolu entajpi vian retpoŝtadreson")
    .email("Ĉi tio ne estas valida retpoŝtadreso");

  const sendForm = () => {
    sending = true;
    axios
      .post("/api/account/password", { email })
      .then((data) => {
        sending = false;
        feedback.change(data);
      })
      .catch((err) => {
        sending = false;
        error.change(err);
      });
  };

  const checkForm = () => {
    inputError = null;
    schema
      .validate(email, { abortEarly: false })
      .then(sendForm)
      .catch((err) => {
        inputError = err.message;
      });
  };
</script>

<svelte:head>
  <title>Peti pasvortrestarigon | Laborperejo</title>
  <meta
    name="description"
    content="Paĝo por peti ligilon per kiu oni povas restarigi sian pasvorton ĉe laborperejo."
  />
</svelte:head>
<div class="form__container">
  <form on:submit|preventDefault={checkForm} class="form">
    <h1>Peti restarigon de via pasvorto</h1>
    <label for="">Retpoŝtadreso</label>
    <input
      type="email"
      bind:value={email}
      disabled={sending}
      placeholder="Retpoŝtadreso"
    />
    <div class="error">
      {#if inputError}
        {inputError}{/if}
    </div>
    <div class="button-container">
      <button
        type="submit"
        class="button button--green button--round"
        disabled={sending}>Sendi peton</button
      >
    </div>
  </form>
</div>

<style lang="sass">
  
  .form
    &__container
      display: flex
      justify-content: center
      align-items: center
      min-height: calc(100vh - 100px)
      width: 100%
  
    & > div
      position: relative
      margin-bottom: 15px
  
    h1
      max-width: 250px
      font-family: 'Raleway', sans-serif
      font-size: 2.3rem
  
    label
      align-items: flex-start
      display: flex
      font-size: 1rem
      font-family: 'Open-Sans', sans-serif

</style>
