<script>
  import { link, navigate } from "svelte-routing";
  import axios from "axios";
  import { extractErrors, onlyOpened } from "../shared";
  import { user, error } from "../stores";
  import countries from "../../../countries";
  import categories from "../../../categories";
  import * as yup from "yup";
  import Select from "svelte-select";
  import { cubicInOut } from "svelte/easing";
  import Spinner from "../components/Spinner.svelte";
  //sprawdz access
  let companies = [];
  let currentPage = 0;

  let toRemove = {};
  let creatingMode = false;
  const schema = yup.object({
    industry: yup
      .string()
      .required("Bonvolu entajpi branĉon, al kiu apartenas la firmao.")
      .max(100, "Branĉo ne povas havi pli ol 100 signojn."),
    name: yup
      .string()
      .required("Bonvolu entajpi nomon de la firmao.")
      .max(100, "Nomo ne povas havi pli ol 100 signojn."),
    country: yup
      .mixed()
      .oneOf(
        countries,
        "Bonvolu elekti landon, en kiu troviĝas sidejo de la firmao."
      )
      .required("Bonvolu elekti landon, en kiu troviĝas sidejo de la firmao."),
    email: yup
      .string()
      .email("Ĉi tio ne estas valida retpoŝtadreso.")
      .required(
        "Bonvolu entajpi retpoŝtadreson, kiun uzu laborprenantoj por kontakti la firmaon."
      )
      .max(320, "Retpoŝtadreso ne povas havi pli ol 320 signojn."),
    address: yup
      .string()
      .required(
        "Bonvolu entajpi adreson de sidejo de la firmao (numero de la konstruaĵo, strato, urbo, poŝtkodo)."
      )
      .max(100, "Adreso ne povas havi pli ol 100 signojn."),
  });
  let newCompanyValues = {
    industry: "",
    name: "",
    country: "",
    email: "",
    address: "",
  };
  let pages = 1;
  let loading = false;
  let errors = {};

  const checkForm = () => {
    errors = {};
    schema
      .validate(newCompanyValues, { abortEarly: false })
      .then(createNewCompany)
      .catch((err) => (errors = extractErrors(err)));
  };
  //add "more" button later
  const getCompanies = () => {
    loading = true;
    return axios
      .get("/api/companies?p=" + ++currentPage + "&a=" + $user.ID)
      .then((res) => {
        pages = res.data.pages;
        companies = [...companies, ...res.data.companies];
        loading = false;
        return true;
      })
      .catch((err) => {
        loading = false;
        error.change(err);
      });
  };
  const createNewCompany = () => {
    creatingMode = false;
    axios
      .post("/api/companies", newCompanyValues)
      .then((res) => {
        newCompanyValues = {
          industry: undefined,
          name: undefined,
          country: undefined,
          email: undefined,
          address: undefined,
        };
        companies = [...companies, res.data];
        $user.companies = companies;
      })
      .catch(error.change);
  };
  const clearToRemove = () => {
    toRemove = null;
    showConfirmation = false;
  };
  const fillToRemove = (id, index) => {
    toRemove = {
      id,
      index,
    };
    showConfirmation = true;
  };
  const removeCompany = () => {
    showConfirmation = false;
    axios
      .delete(`/api/companies/${toRemove.id}`)
      .then((res) => {
        companies.splice(toRemove.index, 1);
        toRemove = {};
        companies = companies;
        $user.companies = companies;
      })
      .catch(error.change);
  };
  let showConfirmation = false;

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
</script>

<svelte:head>
  <title>Firmapanelo | Laborperejo</title>
  <meta name="description" content="Panelo de oniaj firmaoj ĉe laborperejo." />
</svelte:head>
{#await getCompanies()}
  <div class="spinner__container">
    <Spinner />
  </div>
{:then}
  {#if showConfirmation}
    <div class="popup__wrapper">
      <div transition:customTransition class="popup">
        <p class="popup__text">
          Ĉu vi certe volas forigi firmaon {companies[toRemove.index].name} kaj ĝiajn
          ofertojn? La operacio ne malfareblas!
        </p>
        <div class="popup__buttons">
          <button
            on:click={removeCompany}
            class="button button--round button--blue">Jes</button
          >
          <button
            on:click={clearToRemove}
            class="button button--round button--blue">Ne</button
          >
        </div>
      </div>
    </div>
  {/if}
  <div class="container-of-containers">
    <div class="table__container">
      <div class="table__real-container">
        <table class="table">
          <thead class="table__head">
            <tr class="table__head-row">
              <th class="table__column-title">Markemblemo</th>
              <th class="table__column-title">Nomo</th>
              <th class="table__column-title"
                >Laborofertoj <small>(malfermitaj)</small></th
              >
              <th class="table__column-title">Redakti</th>
              <th class="table__column-title">Forigi</th>
            </tr>
          </thead>
          <tbody class="table__body">
            {#if companies.length > 0}
              {#each companies as company, i}
                <tr class="table__body-row">
                  <td class="table__cell"
                    ><img src={company.logo} alt="" class="table__logo" /></td
                  >
                  <td class="table__cell"
                    ><a href={`/firmaoj/${company.ID}`} use:link
                      >{company.name}</a
                    ></td
                  >
                  <td class="table__cell">
                    {onlyOpened(company.offers).length}
                  </td>
                  <td class="table__cell">
                    <button
                      on:click={() =>
                        navigate(`/firmaoj/${company.ID}/redakti`)}
                      class="button__icon button__icon--blue"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        ><path fill="none" d="M0 0h24v24H0z" /><path
                          d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z"
                        /></svg
                      ></button
                    ></td
                  >
                  <td class="table__cell">
                    <button
                      on:click={() => fillToRemove(company.ID, i)}
                      class="button__icon"
                      ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        ><path fill="none" d="M0 0h24v24H0z" /><path
                          d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z"
                        /></svg
                      ></button
                    >
                  </td>
                </tr>
              {/each}
            {:else}
              <tr class="table__body-row">
                <td colspan="5" class="table__cell-info"
                  >Ĉi tiu firmao ne havas ofertojn</td
                >
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
      {#if creatingMode}
        <form on:submit|preventDefault={checkForm} class="form">
          <button
            on:click={() => (creatingMode = false)}
            type="button"
            class="form__close"
            ><svg
              viewBox="-2 -2 50 50"
              focusable="false"
              aria-hidden="true"
              role="presentation"
              ><path
                fill="currentColor"
                d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124
              l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"
              /></svg
            ></button
          >
          <div>
            <span class="form__label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M10 10.111V1l11 6v14H3V7z"
                /></svg
              >
              <input
                type="text"
                bind:value={newCompanyValues.name}
                placeholder="Nomo"
              />
            </span>
            {#if errors.name}<div class="error">{errors.name}</div>{/if}
          </div>
          <div>
            <span class="form__label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M7 5V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4zM4 16v3h16v-3H4zm0-2h16V7H4v7zM9 3v2h6V3H9zm2 8h2v2h-2v-2z"
                /></svg
              >
              <div class="select-container">
                <Select
                  items={categories}
                  on:select={(e) =>
                    (newCompanyValues.industry = e.detail.value)}
                  on:clear={(e) => (newCompanyValues.industry = undefined)}
                  placeholder="Elekti branĉon"
                  noOptionsMessage="Mankas opcioj"
                />
              </div>
            </span>
            {#if errors.industry}<div class="error">
                {errors.industry}
              </div>{/if}
          </div>
          <div>
            <span class="form__label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M5 16v6H3V3h9.382a1 1 0 0 1 .894.553L14 5h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6.382a1 1 0 0 1-.894-.553L12 16H5zM5 5v9h8.236l1 2H19V7h-6.236l-1-2H5z"
                /></svg
              >
              <div class="select-container">
                <Select
                  items={countries}
                  on:select={(e) => (newCompanyValues.country = e.detail.value)}
                  on:clear={(e) => (newCompanyValues.country = undefined)}
                  placeholder="Elekti landon"
                  noOptionsMessage="Mankas opcioj"
                />
              </div>
            </span>
            {#if errors.country}<div class="error">{errors.country}</div>{/if}
          </div>
          <div>
            <span class="form__label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                /></svg
              >
              <input
                type="text"
                bind:value={newCompanyValues.address}
                placeholder="Adreso"
              />
            </span>
            {#if errors.address}<div class="error">{errors.address}</div>{/if}
          </div>
          <div>
            <span class="form__label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z"
                /></svg
              >
              <input
                type="email"
                bind:value={newCompanyValues.email}
                placeholder="Rekruta retpoŝtadreso"
              />
            </span>
            {#if errors.email}<div class="error">{errors.email}</div>{/if}
          </div>
          <div class="button__container">
            <button type="submit" class="button button--green button--round"
              >Aldoni firmaon</button
            >
          </div>
        </form>
      {/if}
      <div>
        {#if loading}
          <div class="spinner__container">
            <Spinner />
          </div>
        {/if}
        <div class="buttons__container">
          {#if pages > currentPage}
            <button
              type="button"
              class="button button--blue button--round"
              disabled={loading}
              on:click={getCompanies}>Montri pliajn</button
            >
          {/if}
          {#if !creatingMode}
            <button
              type="button"
              class="button button--blue button--round"
              on:click={() => (creatingMode = true)}>Krei firmaon</button
            >
          {/if}
        </div>
      </div>
    </div>
  </div>
{:catch err}
  <div class="url-error">
    <b>Eraro {err.response.status}</b>: {err.response.data.error}
  </div>
{/await}

<!-- szarszy dac na table border -->
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
  $bordowy: #8a0b24
  .table
    font-family: "Open sans", sans-serif
    border-collapse: collapse
    width: 100%
  
    &__real-container
      margin-top: 10px
      border-radius: 5px 5px 2px 2px
      overflow: hidden
  
    &__container
      width: max-content
  
    &__head
      color: white
      background: $niebieski-link
  
      &-row
        border-right: 1px solid $niebieski-link
        border-left: 1px solid $niebieski-link
  
    &__cell, &__column-title
      text-align: center
      hyphens: auto
      overflow-wrap: break-word
      padding: 12px 15px
  
    &__cell-info
      padding: 10px
      text-align: center
      font-family: 'Raleway', sans-serif
  
  
    &__body
      
      &-row
        background: white
        border-right: 1px solid $najszarszy
        border-left: 1px solid $najszarszy
        
        &:nth-of-type(even)
          background: $szary
  
        &:last-child
          border-bottom: $niebieski-link 2px solid
  
  .container-of-containers
    display: flex
    justify-content: center
  
  .button__icon
    background: $crimson
    color: white
    border: none
    border-radius: 50%
    width: 42px
    height: 42px
    display: inline-flex
    justify-content: center
    align-items: center
    cursor: pointer
  
    &--blue
      background: $navy
  
  .buttons__container
    display: flex
    align-items: center
    column-gap: 10px

.table__logo
  width: 100px
  height: 100px
  object-fit: cover
  border-radius: 50%

.form
  gap: 10px
  position: relative
  display: grid
  grid-template-columns: 1fr 1fr
  padding: 40px 10px 10px 10px
  border-radius: 10px
  border: 1px solid $szarszy
  margin-top: 10px
  background: white
  
  &__close
    right: 10px
    top: 10px
    position: absolute
    background: $crimson
    color: white
    border: none
    width: 30px
    height: 30px
    display: flex
    justify-content: center
    align-items: center
    cursor: pointer

  & > div
    margin: 0

  &__label
    margin: 10px 0 0 0
    display: flex
    align-items: center
    column-gap: 10px

.buttons__container
  padding: 10px 0 20px 0

  .button
    max-width: 200px

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

  &__wrapper
    z-index: 2
    position: fixed
    height: calc(100vh - 50px)
    width: 100vw

  &__text
    font-family: "Open Sans", sans-serif
    margin: 0 0 10px 0
  
  &__buttons
    flex-direction: column
    display: flex
    row-gap: 10px

.button
  width: 100%

.error
  max-width: 275px
</style>
