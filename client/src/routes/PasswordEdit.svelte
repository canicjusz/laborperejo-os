<script>
  // todo: zrobic jakis osobny panel do zmiany hasla, bo jak chlop zbanowany to moze chcec se zmienic haslo, no a w sumie czemu nie
  import axios from "axios";
  import * as yup from "yup";
  import { extractErrors } from "../shared";
  import { user, feedback, error } from "../stores";

  const values = {
    curr: "",
    new: "",
    newRetyped: "",
  };
  let errors = {};
  const schema = yup.object().shape({
    curr: yup.string().required("Bonvolu entajpi la nunan pasvorton"),
    new: yup
      .string()
      .required("Bonvolu entajpi la novan pasvorton")
      .matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,128}$/,
        "La pasvorto enhavu almenaŭ 8 signojn, unu ĉefliteron, unu malĉefliteron. Oni povas aldone uzi jenajn specjalajn signojn: #?!@$%^&*-_"
      )
      .test(
        "match",
        "La nova pasvorto estas sama kiel la malnova",
        function () {
          return this.parent.curr !== this.parent.new;
        }
      ),
    newRetyped: yup
      .mixed()
      .required("Bonvolu reentajpi la novan pasvorton")
      .test("match", "La pasvortoj estas malsamaj", function () {
        return this.parent.new === this.parent.newRetyped;
      }),
  });

  const sendForm = () => {
    const { newRetyped, ...valuesToSend } = values;
    axios
      .put(`/api/account/${$user?.ID}/password`, valuesToSend)
      .then(feedback.change)
      .catch(error.change);
  };

  const checkForm = () => {
    errors = {};
    schema
      .validate(values, { abortEarly: false })
      .then(sendForm)
      .catch((err) => (errors = extractErrors(err)));
  };
</script>

<svelte:head>
  <title>Ŝanĝi pasvorton | Laborperejo</title>
  <meta
    name="description"
    content="Paĝo por ŝanĝi pasvorton de konto ĉe laborperejo."
  />
</svelte:head>

<div class="form__container">
  <form on:submit|preventDefault={checkForm} class="form">
    <h1>Ŝanĝi pasvorton</h1>
    <div>
      La nuna pasvorto
      <input
        type="password"
        bind:value={values.curr}
        placeholder="Nuna pasvorto"
      />
      {#if errors.curr}<div class="error">{errors.curr}</div>{/if}
    </div>
    <div>
      Nova pasvorto
      <input
        type="password"
        bind:value={values.new}
        placeholder="Nova pasvorto"
      />
      {#if errors.new}
        <div class="error">{errors.new}</div>
      {/if}
    </div>
    <div>
      Reentajpu la novan pasvorton
      <input
        type="password"
        bind:value={values.newRetyped}
        placeholder="Nova pasvorto"
      />
      {#if errors.newRetyped}
        <div class="error">{errors.newRetyped}</div>
      {/if}
    </div>
    <button type="submit" class="button button--blue button--round"
      >Ĝisdatigi pasvorton</button
    >
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
  
    div
      font-family: "Open Sans", sans-serif
      position: relative
</style>
