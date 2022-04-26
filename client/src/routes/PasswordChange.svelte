<script>
  import axios from "axios";
  import { navigate } from "svelte-routing";
  import { error, feedback } from "../stores";
  import * as yup from "yup";
  export let token;
  export let id;
  import { extractErrors } from "../shared";
  let sending = false;
  let show = false;

  const values = {
    password: "",
    passwordRetype: "",
  };
  let errors = {};

  const schema = yup.object().shape({
    password: yup
      .string()
      .required("Bonvolu entajpi vian pasvorton")
      .matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,128}$/,
        "almenaŭ 8 signoj: ciferon, unu ĉeflitero, unu malĉeflitero. Oni povas uzi tiujn simbolojn: #?!@$%^&*-_"
      ),
    passwordRetype: yup
      .mixed()
      .required("Bonvolu reentajpi la pasvorton")
      .test("match", "La pasvortoj estas malsamaj", function () {
        return this.parent.password === this.parent.passwordRetype;
      }),
  });

  const sendPassword = () => {
    sending = true;
    axios
      .put(`/api/account/password`, {
        password: values.password,
        id,
        token,
      })
      .then((res) => {
        feedback.change(res);
        navigate("/ensaluti");
      })
      .catch((err) => {
        sending = false;
        error.change(err);
      });
  };

  const checkForm = () => {
    errors = {};
    schema
      .validate(values, { abortEarly: false })
      .then(sendPassword)
      .catch((err) => (errors = extractErrors(err)));
  };
</script>

<svelte:head>
  <title>Restarigi pasvorton | Laborperejo</title>
  <meta
    name="description"
    content="Paĝo por restarigi pasvorton per retpoŝtadreso ĉe laborperejo."
  />
</svelte:head>
<div class="form__container">
  <form on:submit|preventDefault={checkForm} class="form">
    <h1>Restarigejo</h1>
    <div>
      Nova pasvorto
      {#if show}
        <input
          name="password"
          type="text"
          bind:value={values.password}
          placeholder="Nova pasvorto"
          disabled={sending}
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
          name="password"
          type="password"
          bind:value={values.password}
          placeholder="Nova pasvorto"
          disabled={sending}
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
      {#if errors.password}<div class="error">{errors.password}</div>{/if}
    </div>
    <div>
      Reenigu la novan pasvorton
      <input
        type="password"
        bind:value={values.passwordRetype}
        placeholder="Nova pasvorto"
        disabled={sending}
      />
      {#if errors.passwordRetype}<div class="error">
          {errors.passwordRetype}
        </div>{/if}
    </div>
    <div>
      <button
        type="submit"
        class="button button--round button--green"
        disabled={sending}>Restarigi</button
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

  div
    font-family: "Open Sans", sans-serif
    position: relative
</style>
