<script>
  import axios from "axios";
  import { error, feedback } from "../stores";
  import * as yup from "yup";
  let sending = false;
  let email = "";
  let inputError = "";
  const schema = yup
    .string()
    .required("Bonvolu entajpi vian retpoŝtadreson")
    .email("Ĉi tio ne estas valida retpoŝtadreso");

  const validate = () => {
    inputError = null;
    schema
      .validate(email)
      .then(sendForm)
      .catch((err) => {
        inputError = err.message;
      });
  };

  const sendForm = () => {
    sending = true;
    axios
      .post("/api/account/confirmation", { email })
      .then((data) => {
        feedback.change(data);
      })
      .catch((err) => {
        sending = false;
        error.change(err);
      });
  };
</script>

<svelte:head>
  <title>Peti registriĝ-ligilon | Laborperejo</title>
  <meta
    name="description"
    content="Paĝo por peti registriĝligilon ĉe laborperejo."
  />
</svelte:head>
<div class="form__container">
  <form on:submit|preventDefault={validate} class="form">
    <h1>Peti registriĝ-ligilon</h1>
    <label for="">
      Retpoŝtadreso <input
        type="email"
        placeholder="Retpoŝtadreso"
        bind:value={email}
      />
    </label>
    {#if inputError}
      <div class="error">{inputError}</div>
    {/if}
    <div class="button-container">
      <button
        type="submit"
        class="button button--round button--green"
        disabled={sending}>Resendi</button
      >
    </div>
  </form>
</div>

<style lang="sass">
.form
  width: 250px
  &__container
    display: flex
    justify-content: center
    align-items: center
    min-height: calc(100vh - 100px)
    width: 100%

  & > div
    margin-bottom: 15px

  h1
    max-width: 250px
    font-family: 'Raleway', sans-serif
    font-size: 2.3rem

  label
    display: block
    font-size: 1rem
    font-family: 'Open-Sans', sans-serif
</style>
