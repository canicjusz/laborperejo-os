<script>
  import { cubicInOut } from "svelte/easing";
  import { error, feedback } from "../stores";
  import * as yup from "yup";
  import axios from "axios";
  import countries from "../../../countries";
  import { extractErrors } from "../shared";
  import Select from "svelte-select";

  const customTransition = () => {
    return {
      css: (t) => {
        return `
        transform: scale(${t});
        opacity: ${t};
        `;
      },
      easing: cubicInOut,
      duration: 500,
    };
  };

  let show = false;
  const values = {
    email: "",
    password: "",
    passwordRetype: "",
    name: "",
    country: undefined,
    place: "",
    languages: [{ name: "Esperanto", level: undefined }],
  };
  let errors = {};

  let levels = ["baznivele", "meznivele", "altnivele", "flue", "denaske"];

  const schema = yup.object().shape({
    email: yup
      .string()
      .required("Bonvolu entajpi vian retpoŝtadreson")
      .email("Ĉi tio ne estas valida retpoŝtadreso.")
      .max(320, "Retpoŝtadreso ne povas havi pli ol 320 signojn."),
    password: yup
      .string()
      .required("Bonvolu entajpi vian pasvorton")
      .matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,128}$/,
        "La pasvorto enhavu almenaŭ 8 signojn, unu ĉefliteron, unu malĉefliteron. Oni povas aldone uzi jenajn specjalajn signojn: #?!@$%^&*-_"
      ),
    passwordRetype: yup
      .mixed()
      .required("Bonvolu reentajpi la pasvorton")
      .test("match", "La pasvortoj estas malsamaj", function () {
        return this.parent.password === this.parent.passwordRetype;
      }),
    name: yup.string().required("Bonvolu entajpi via(j)n nomo(j)n").trim(),
    place: yup.string().required("Bonvolu entajpi vian loĝlokon.").trim(),
    country: yup
      .mixed()
      .oneOf(countries, "Bonvolu elekti landon.")
      .required("Bonvolu elekti landon."),
    resume: yup.string().nullable(),
    languages: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required("Bonvolu aldoni nomon"),
          level: yup
            .string()
            .oneOf(levels, "Bonvolu elekti nivelon")
            .required("Bonvolu elekti nivelon"),
        })
      )
      .min(1, "Aldonu almenaŭ unu lingvon")
      .max(50, "Oni ne povas aldoni pli ol 50 lingvojn"),
  });
  let sending = false;

  let showPopup = false;

  const sendForm = (data) => {
    sending = true;
    const { passwordRetype, ...valuesToSend } = data;
    axios
      .post("/api/users", valuesToSend, { withCredentials: true })
      .then(() => {
        showPopup = true;
      })
      .catch((res) => {
        error.change(res);
        sending = false;
      });
  };

  const checkForm = async () => {
    errors = {};
    const validated = await schema
      .validate(values, { abortEarly: false })
      .catch((err) => {
        errors = extractErrors(err);
      });
    if (validated) {
      sendForm(validated);
    }
    // const sending = await schema
    //   .then(sendForm)
  };

  const addLanguage = () => {
    values.languages = [...values.languages, { name: "", level: undefined }];
  };

  const removeLanguage = (i) => {
    values.languages.splice(i, 1);
    values.languages = values.languages;
    delete errors[`languages[${i}].level`];
    delete errors[`languages[${i}].name`];
  };

  const resendConfirmation = () => {
    axios
      .post("/api/account/confirmation", { email: values.email })
      .then(feedback.change)
      .catch(error.change);
  };
</script>

<svelte:head>
  <title>Registriĝi | Laborperejo</title>
  <meta name="description" content="Paĝo por registriĝi ĉe laborperejo." />
</svelte:head>
{#if showPopup}
  <div transition:customTransition class="popup" intro={true}>
    <h1 class="popup__title">Bonvenon!</h1>
    <p>
      Ni sendis al vi ({values.email}) mesaĝon kun registriĝ-ligilo. Bonvolu
      kontroli vian retpoŝtkeston, atentu ke la retmesaĝo povas iri ĝis 5
      minutoj.
    </p>
    <p>
      Se vi ne vidas la retmesaĝon, bonvolu kontroli spamejon. Se ne venis al vi
      la retmesaĝo, alklaku la suban butonon.
    </p>
    <div class="button__container">
      <button class="button button--blue" on:click={resendConfirmation}
        >Resendi retmesaĝon</button
      >
    </div>
  </div>
{/if}
<div class="form__container">
  <form on:submit|preventDefault={checkForm} class="form">
    <h1>Registriĝejo</h1>
    <div>
      <label for="personal-name">Plena nomo</label>
      <input
        placeholder="Via nomo"
        type="text"
        name="personal-name"
        bind:value={values.name}
        autocomplete="name"
        disabled={sending}
      />
      <div class="error">
        {#if errors.name}{errors.name}{/if}
      </div>
    </div>
    <div>
      <label for="countries">Lando</label>
      <div class="select-container">
        <Select
          items={countries}
          value={values.country}
          on:select={(e) => (values.country = e.detail.value)}
          on:clear={(e) => (values.country = undefined)}
          placeholder="Elekti landon"
          noOptionsMessage="Mankas opcioj"
          isDisabled={sending}
        />
      </div>
      <div class="error">
        {#if errors["country.value"]}{errors["country.value"]}{/if}
        {#if errors.country}{errors.country}{/if}
      </div>
    </div>
    <div>
      <label for="place">Loĝloko</label>
      <input
        type="text"
        name="place"
        bind:value={values.place}
        autocomplete="address-level2"
        placeholder="Urbo, provinco"
        disabled={sending}
      />
      <div class="error">
        {#if errors.place}{errors.place}{/if}
      </div>
    </div>
    <div>
      <label for="languages">Lingvoj</label>
      <div>
        {#each values.languages as language, i}
          <div class="languages">
            <input
              type="text"
              disabled={sending}
              bind:value={language.name}
              placeholder="Lingvo"
            />
            <div class="select-container">
              <Select
                items={levels}
                value={language.level}
                placeholder="Elekti nivelon"
                noOptionsMessage="Mankas opcioj"
                on:select={(e) => (language.level = e.detail.value)}
                on:clear={(e) => (language.level = undefined)}
                isDisabled={sending}
              />
            </div>
            <button
              on:click={() => removeLanguage(i)}
              class="language-remove"
              disabled={sending}
            >
              <svg
                viewBox="-2 -2 50 50"
                focusable="false"
                aria-hidden="true"
                role="presentation"
                ><path
                  fill="currentColor"
                  d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124
              l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"
                /></svg
              >
            </button>
            <div class="error">
              {#if errors[`languages[${i}].name`]}{errors[
                  `languages[${i}].name`
                ]}{/if}
            </div>
            <div class="error">
              {#if errors[`languages[${i}].level`]}{errors[
                  `languages[${i}].level`
                ]}{/if}
            </div>
          </div>
        {/each}
      </div>
      <div class="button-container">
        <button
          on:click={addLanguage}
          type="button"
          class="button button--blue"
          disabled={sending}>Aldoni novan lingvon</button
        >
      </div>
      <div class="error">
        {#if errors.languages}{errors.languages}{/if}
      </div>
    </div>
    <div>
      <label for="email">Retpoŝtadreso</label>
      <input
        type="email"
        name="email"
        bind:value={values.email}
        autocomplete="email"
        placeholder="Via retpoŝtadreso"
        disabled={sending}
      />
      <div class="error">
        {#if errors.email}{errors.email}{/if}
      </div>
    </div>
    <div class="password">
      <label for="password"
        >Pasvorto <small
          >almenaŭ 8 signoj: unu ĉeflitero, unu malĉeflitero. Oni povas uzi
          tiujn simbolojn: #?!@$%^&*-_</small
        ></label
      >
      {#if show}
        <input
          disabled={sending}
          name="password"
          type="text"
          bind:value={values.password}
          autocomplete="new-password"
          placeholder="Via pasvorto"
        />
        <svg
          on:click={() => (show = !show)}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="eye"
          width="24"
          height="24"
          ><path fill="none" d="M0 0h24v24H0z" /><path
            d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3zm0 16a9.005 9.005 0 0 0 8.777-7 9.005 9.005 0 0 0-17.554 0A9.005 9.005 0 0 0 12 19zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
          /></svg
        >
      {:else}
        <input
          disabled={sending}
          name="password"
          type="password"
          bind:value={values.password}
          autocomplete="new-password"
          placeholder="Via pasvorto"
        />
        <svg
          on:click={() => (show = !show)}
          xmlns="http://www.w3.org/2000/svg"
          class="eye"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          ><path fill="none" d="M0 0h24v24H0z" /><path
            d="M17.882 19.297A10.949 10.949 0 0 1 12 21c-5.392 0-9.878-3.88-10.819-9a10.982 10.982 0 0 1 3.34-6.066L1.392 2.808l1.415-1.415 19.799 19.8-1.415 1.414-3.31-3.31zM5.935 7.35A8.965 8.965 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604L5.935 7.35zm6.979 6.978l-3.242-3.242a2.5 2.5 0 0 0 3.241 3.241zm7.893 2.264l-1.431-1.43A8.935 8.935 0 0 0 20.777 12 9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.947 10.947 0 0 1-2.012 4.592zm-9.084-9.084a4.5 4.5 0 0 1 4.769 4.769l-4.77-4.769z"
          /></svg
        >
      {/if}
      <div class="error">
        {#if errors.password}{errors.password}{/if}
      </div>
    </div>
    <div>
      <label for="retype-password">Reentajpu la pasvorton:</label>
      <input
        placeholder="Via pasvorto"
        type="password"
        name="retype-password"
        disabled={sending}
        bind:value={values.passwordRetype}
      />
      <div class="error">
        {#if errors.passwordRetype}{errors.passwordRetype}{/if}
      </div>
    </div>
    <div class="button-container">
      <button
        type="submit"
        class="button button--green button--round"
        disabled={sending}>Registriĝi</button
      >
    </div>
  </form>
</div>

<style lang="sass">
  $navy: #005ea9
  $szary: #f1f1f1
  $szarszy: #d7d7d7
  $najszarszy: #acacac
  $czarny: #363736
  $niebieski-link: #1b75bc
  $bialy: #ffffff
  $zielony: #7cb54b
  $ciemny-zielony: #4caf50
  $crimson: 	#DC143C
  .form
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
      // margin-bottom: 20px
      font-family: 'Raleway', sans-serif
      font-size: 2.3rem
  // input:not(input[type="checkbox"])
  //   width: 300px

  label
    width: 250px
    display: block
    font-size: 1rem
    font-family: 'Open-Sans', sans-serif

  .languages
    display: grid
    position: relative
    column-gap: 10px
    align-items: center
    grid-template-columns: 100px 140px

    .select-container
      width: 140px

    & > input:not(input[type="checkbox"])
      width: 100px

    .language-remove
      display: block
      justify-content: center
      align-items: center
      box-sizing: content-box
      position: absolute
      padding: 5px
      border-radius: 50%
      width: 20px
      height: 20px
      right: -40px
      border: none
      background: $szarszy
      cursor: pointer

      &:hover
        background: $crimson
        color: $bialy

.password
  width: 250px
  position: relative

  input
    padding-right: 20px

.popup
  z-index: 2
  box-shadow: 0 0 10px $najszarszy
  position: absolute
  left: 0
  right: 0
  top: 0
  bottom: 0
  margin: auto
  height: max-content
  width: 300px
  background: $szary
  padding: 10px

  h1, p
    margin: 10px 0

    &:first-child
      margin-top: 0

  h1
    font-size: 2.3rem
    font-family: 'Raleway', sans-serif
    color: $zielony

  p
    font-family: "Open Sans", sans-serif

</style>
