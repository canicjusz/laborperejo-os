<script>
  // todo: zrobic jakis osobny panel do zmiany hasla, bo jak chlop zbanowany to moze chcec se zmienic haslo, no a w sumie czemu nie
  import axios from "axios";
  import * as yup from "yup";
  import { extractErrors } from "../shared";
  import { user, feedback, error } from "../stores";

  const randomFromRange = (min, max) =>
    Math.floor(Math.random() * (max - min) + min);

  const randomPassword = "*".repeat(randomFromRange(9, 18));
  let showPasswordWindow = false;

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
      .put(`/api/account/${$user.ID}/password`, valuesToSend)
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

  const switchPasswordWindow = () => (showPasswordWindow = !showPasswordWindow);
</script>

<svelte:head>
  <title>Ŝanĝi pasvorton | Laborperejo</title>
  <meta
    name="description"
    content="Paĝo por ŝanĝi pasvorton de konto ĉe laborperejo."
  />
</svelte:head>
Retpoŝtadreso: <input type="text" disabled value={$user.email} />
<div>
  Pasvorto: {randomPassword}
  <button on:click={switchPasswordWindow}>Ŝanĝi pasvorton</button>
  {#if showPasswordWindow}
    <form on:submit|preventDefault={checkForm} class="form">
      <div>
        La nuna pasvorto
        <input type="password" bind:value={values.curr} />
        {#if errors.curr}{errors.curr}{/if}
      </div>
      <div>
        Nova pasvorto
        <input type="password" bind:value={values.new} />
        {#if errors.new}
          {errors.new}
        {/if}
      </div>
      <div>
        Reentajpu la novan pasvorton
        <input type="password" bind:value={values.newRetyped} />
        {#if errors.newRetyped}
          {errors.newRetyped}
        {/if}
      </div>
      <button type="submit">Akcepti novan pasvorton</button>
    </form>
  {/if}
</div>
