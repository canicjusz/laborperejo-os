<script>
  import axios from "axios";
  import { navigate } from "svelte-routing";
  import { user, error } from "../stores";
  import { getDate, extractErrors } from "../shared";
  import countries from "../../../countries";
  import Editor from "../components/Editor.svelte";
  import * as yup from "yup";
  import { klona } from "klona/json";
  import { deepEqual } from "fast-equals";
  import categories from "../../../categories";
  import Select from "svelte-select";
  import Spinner from "../components/Spinner.svelte";

  export let id;
  let numberID = Number(id);

  let toEdit = {};
  let original = {};
  let editableAdministrators = [];
  let newImg;
  let searchQuery = "";

  // const resetValues = () => {
  //   dataDownloaded = false;
  //   newImg = null;
  // };

  const schema = yup.object({
    logo: yup.string().required(),
    industry: yup
      .string()
      .required("Bonvolu entajpi branĉon, al kiu apartenas la firmao.")
      .max(100, "Branĉo ne povas havi pli ol 100 signojn."),
    name: yup
      .string()
      .required("Bonvolu entajpi nomon de la firmao.")
      .max(100, "Nomo ne povas havi pli ol 100 signojn."),
    description: yup
      .string()
      .required("Bonvolu entajpi priskribon de la firmao.")
      .max(8192, "Priskribo ne povas havi pli ol 8192 signojn."),
    country: yup
      .mixed()
      .oneOf(
        countries,
        "Bonvolu elekti landon, en kiu troviĝas sidejo de la firmao."
      )
      .required("Bonvolu elekti landon, en kiu troviĝas sidejo de la firmao."),
    address: yup
      .string()
      .required(
        "Bonvolu entajpi adreson de sidejo de la firmao (numero de la konstruaĵo, strato, urbo, poŝtkodo)."
      )
      .max(100, "Adreso ne povas havi pli ol 100 signojn."),
    phone: yup
      .string()
      .matches(
        /^\+(?:[0-9] ?){6,14}[0-9]$/,
        "La numero ne validas. Memoru pri telefona landokodo, por klareco vi povas dividi la numeron per spacetoj."
      )
      .nullable(),
    email: yup
      .string()
      .email("Ĉi tio ne estas valida retpoŝtadreso.")
      .required(
        "Bonvolu entajpi retpoŝtadreson, kiun uzu laborprenantoj por kontakti la firmaon."
      )
      .max(320, "Retpoŝtadreso ne povas havi pli ol 320 signojn."),
  });
  let errors = {};

  const checkForm = () => {
    errors = {};
    schema
      .validate(toEdit, { abortEarly: false })
      .then(sendChanges)
      .catch((err) => (errors = extractErrors(err)));
  };

  const beforeUnload = (e) => {
    if (changed) {
      const confirmationMessage =
        "Ŝajnas, ke vi ne konservis ŝanĝojn. Se vi foriros la retpaĝon antaŭ konservado, ĉiuj ŝanĝoj nuliĝos.";
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    }
  };

  const getCompany = axios.get(`/api/companies/${id}`).then((res) => {
    const {
      administrators,
      isOwner,
      created_at,
      offersNumber,
      offersOpenedNumber,
      ...editable
    } = res.data;
    if (!isOwner) {
      return navigate("/firmaoj/" + id);
    }
    toEdit = klona(editable);
    original = editable;
    editableAdministrators = administrators;
  });

  let searchedAdministrators = [];
  let currentPage = 1;
  let pagesNumber = 1;

  const updateLocalCompany = () => {
    const companyIndex = $user.companies.findIndex(
      (company) => company.ID === numberID
    );
    Object.assign($user.companies[companyIndex], toEdit);
    goToProfile();
  };

  const sendChanges = () => {
    const data = new FormData();
    data.append("json", JSON.stringify(toEdit));
    if (newImg) {
      data.append("logo", newImg);
      toEdit.logo = logoSrc;
    }
    axios
      .put(`/api/companies/${id}`, data)
      .then(updateLocalCompany)
      .catch(error.change);
  };

  const showImage = (changeEvent) => {
    const element = changeEvent.target;
    if (element.files) {
      const file = element.files[0];
      if (file.type.startsWith("image/")) {
        URL.revokeObjectURL(logoSrc);
        newImg = file;
      } else {
      }
    }
  };

  const removeAdministrator = (userID, userIndex) => {
    axios
      .delete(`/api/companies/${id}/administrator/${userID}`)
      .then((res) => {
        editableAdministrators.splice(userIndex, 1);
        editableAdministrators = editableAdministrators;
      })
      .catch(error.change);
  };

  const addAdministrator = (userID, userIndex) => {
    axios
      .post(`/api/companies/${id}/administrator/${userID}`)
      .then((res) => {
        const user = searchedAdministrators[userIndex];
        const newProfile = {
          ID: userID,
          profile: {
            created_at: user.created_at,
            user_name: user.user_name,
            avatar: user.avatar,
          },
        };
        searchedAdministrators.splice(userIndex, 1);
        searchedAdministrators = searchedAdministrators;
        editableAdministrators = [newProfile, ...editableAdministrators];
      })
      .catch(error.change);
  };

  let loadingAdmins = false;
  let searched = false;

  const searchAdministrator = (more) => {
    searched = true;
    loadingAdmins = true;
    if (more) {
      currentPage++;
    } else {
      pagesNumber = 1;
      currentPage = 1;
      searchedAdministrators = [];
    }
    axios
      .get("/api/users?p=" + currentPage + "&na=" + id + "&q=" + searchQuery)
      .then((res) => {
        loadingAdmins = false;
        const { profiles, pages } = res.data;
        pagesNumber = pages;
        searchedAdministrators = searchedAdministrators.concat(profiles);
      })
      .catch((err) => {
        loadingAdmins = false;
        error.change(err);
      });
  };

  const goToProfile = () => navigate(`/firmaoj/${id}`);

  $: logoSrc = newImg ? URL.createObjectURL(newImg) : toEdit?.logo;
  $: changed = !deepEqual(toEdit, original) || newImg;
</script>

<svelte:window on:beforeunload|preventDefault={beforeUnload} />
<svelte:head>
  <title>Redakti firmaon | Laborperejo</title>
  <meta name="description" content="Paĝo por redakti firmaon ĉe laborperejo." />
</svelte:head>

{#await getCompany}
  <div class="spinner__container">
    <Spinner />
  </div>
{:then}
  <div class="company__container">
    <div class="company">
      <div class="company__left">
        <div class="company__left-top">
          <div class="logo__container">
            <input
              class="file-input"
              type="file"
              id="logo"
              name="logo"
              on:change={showImage}
              accept="image/png, image/jpeg, image/gif"
            />
            <label for="logo" class="logo__label"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"
                /></svg
              ></label
            >
            <img src={logoSrc} alt="" class="company__logo" />
          </div>
          <div class="company__left-top-text">
            <span class="company__name">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M10 10.111V1l11 6v14H3V7z"
                /></svg
              >
              <input type="text" bind:value={toEdit.name} placeholder="Nomo" />
            </span>
            <span class="company__country">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M5 16v6H3V3h9.382a1 1 0 0 1 .894.553L14 5h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6.382a1 1 0 0 1-.894-.553L12 16H5zM5 5v9h8.236l1 2H19V7h-6.236l-1-2H5z"
                /></svg
              >
              <div class="select-container" style="width: 250px">
                <Select
                  items={countries}
                  value={toEdit.country}
                  on:select={(e) => (toEdit.country = e.detail.value)}
                  on:clear={(e) => (toEdit.country = undefined)}
                  placeholder="Elekti landon"
                  noOptionsMessage="Mankas opcioj"
                />
              </div>
            </span>
            {#if errors.country}<div class="error">{errors.country}</div>{/if}
            <span class="company__place"
              ><svg
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
                bind:value={toEdit.address}
                placeholder="Adreso"
              />
            </span>
            {#if errors.address}<div class="error">{errors.address}</div>{/if}
          </div>
        </div>
        <div class="company__left-bottom">
          <Editor bind:value={toEdit.description} />
          {#if errors.description}<div class="error">
              {errors.description}
            </div>{/if}
        </div>
      </div>
    </div>
    <div class="company__right">
      <div class="company__industry">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          ><path fill="none" d="M0 0h24v24H0z" /><path
            d="M7 5V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4zM4 16v3h16v-3H4zm0-2h16V7H4v7zM9 3v2h6V3H9zm2 8h2v2h-2v-2z"
          /></svg
        >
        <div class="select-container" style="width: 250px">
          <Select
            items={categories}
            value={toEdit.industry}
            on:select={(e) => (toEdit.industry = e.detail.value)}
            on:clear={(e) => (toEdit.industry = undefined)}
            placeholder="Elekti branĉon"
            noOptionsMessage="Mankas opcioj"
          />
        </div>
        {#if errors.industry}<div class="error">{errors.industry}</div>{/if}
      </div>
      <ul class="company__contact">
        <li class="company__contact-element">
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
            bind:value={toEdit.email}
            placeholder="Rekruta retpoŝtadreso"
          />
        </li>
        {#if errors.email}<div class="error">{errors.email}</div>{/if}
        <li class="company__contact-element">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            ><path fill="none" d="M0 0h24v24H0z" /><path
              d="M9.366 10.682a10.556 10.556 0 0 0 3.952 3.952l.884-1.238a1 1 0 0 1 1.294-.296 11.422 11.422 0 0 0 4.583 1.364 1 1 0 0 1 .921.997v4.462a1 1 0 0 1-.898.995c-.53.055-1.064.082-1.602.082C9.94 21 3 14.06 3 5.5c0-.538.027-1.072.082-1.602A1 1 0 0 1 4.077 3h4.462a1 1 0 0 1 .997.921A11.422 11.422 0 0 0 10.9 8.504a1 1 0 0 1-.296 1.294l-1.238.884zm-2.522-.657l1.9-1.357A13.41 13.41 0 0 1 7.647 5H5.01c-.006.166-.009.333-.009.5C5 12.956 11.044 19 18.5 19c.167 0 .334-.003.5-.01v-2.637a13.41 13.41 0 0 1-3.668-1.097l-1.357 1.9a12.442 12.442 0 0 1-1.588-.75l-.058-.033a12.556 12.556 0 0 1-4.702-4.702l-.033-.058a12.442 12.442 0 0 1-.75-1.588z"
            /></svg
          >
          <input
            type="tel"
            bind:value={toEdit.phone}
            placeholder="+48 123 456 789"
          />
        </li>
        {#if errors.phone}<div class="error">{errors.phone}</div>{/if}
      </ul>
      <div class="button__container">
        <button
          on:click={goToProfile}
          disabled={!changed}
          class="button button--red button--round">Nuligi ŝanĝoj</button
        >
      </div>
      <div class="button__container">
        <button
          on:click={checkForm}
          disabled={!changed}
          class="button button--green button--round">Akcepti ŝanĝojn</button
        >
      </div>
    </div>
  </div>
  <hr />
  <div class="admin-panel">
    <h2 class="admin-panel__title">Administrantoj</h2>
    <div class="admin-list">
      {#if editableAdministrators.length > 0}
        {#each editableAdministrators as admin, i}
          <div class="admin">
            <img src={admin.profile.avatar} alt="" class="admin__avatar" />
            <a
              href={"/profiloj/" + admin.ID}
              target="_blank"
              class="admin__title"
            >
              {admin.profile.user_name}</a
            >
            <div class="admin__date">
              <small>
                Kreita {getDate(admin.profile.created_at)}
              </small>
            </div>
            <div class="button__container">
              <button
                on:click={() => removeAdministrator(admin.ID, i)}
                class="button button--red button--round">Forigi</button
              >
            </div>
          </div>
        {/each}
      {:else}
        Ne estas aliaj administrantoj de ĉi tiu firmao.
      {/if}
    </div>
    <h2 class="admin-panel__title">Serĉi uzantojn</h2>
    <form
      on:submit|preventDefault={() => searchAdministrator(false)}
      class="admin-panel__form"
    >
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Nomo de uzanto, fragmento de priskribo"
      />
      <div class="button__container">
        <button
          on:click={() => searchAdministrator(false)}
          class="button button--round button--blue"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            ><path fill="none" d="M0 0h24v24H0z" /><path
              d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z"
            /></svg
          >Serĉi</button
        >
      </div>
    </form>
    <div class="admin-list" style="padding-bottom: 20px">
      {#if searchedAdministrators.length > 0}
        {#each searchedAdministrators as administrator, i}
          <div class="admin">
            <img src={administrator.avatar} alt="" class="admin__avatar" />
            <a
              href={"/profiloj/" + administrator.user_ID}
              target="_blank"
              class="admin__title"
            >
              {administrator.user_name}</a
            >
            <div class="admin__date">
              Kreita {getDate(administrator.created_at)}
            </div>
            <div class="button__container">
              <button
                on:click={() => addAdministrator(administrator.user_ID, i)}
                class="button button--green button--round">Aldoni</button
              >
            </div>
          </div>
        {/each}
        {#if currentPage < pagesNumber && !loadingAdmins}<button
            class="load-more"
            on:click={() => searchAdministrator(true)}
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              ><path fill="none" d="M0 0h24v24H0z" /><path
                d="M5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
              /></svg
            ></button
          >{/if}
      {:else if searched && !loadingAdmins}
        Ni nenion trovis, pardonon!
      {/if}
      {#if loadingAdmins}
        <div class="spinner__container">
          <Spinner />
        </div>{/if}
    </div>
  </div>
{:catch err}
  <div class="url-error">
    <b>Eraro {err.response.status}</b>: {err.response.data.error}
  </div>
{/await}

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

.load-more
  align-self: center
  display: flex
  justify-content: center
  align-items: center
  padding: 10px
  color: white
  background: $niebieski-link
  border-radius: 50%
  border: none
  cursor: pointer

hr
  margin: 0 20px

.logo

  &__container
    overflow: hidden
    position: relative 
    height: 200px
    width: 200px
    clip-path: circle(50% at 50% 50%)

  &__label
    cursor: pointer
    display: flex
    justify-content: center
    bottom: 0
    left: 0
    width: 100%
    height: 30px
    align-items: center
    background: $czarny
    opacity: 0.9
    color: white
    position: absolute
    transition: color 0.3s

    svg
      fill: currentColor

    &:hover
      color: $niebieski-link

.file-input
  display: none

.spinner__container
  align-self: center
  width: 100%
  text-align: center
  padding-top: 20px

.company
  display: grid
  column-gap: 20px
  grid-template-columns: 642px max-content

  &__container
    display: flex
    justify-content: center
    padding: 20px 0

  &__left, &__right
    box-sizing: content-box
    padding: 10px
    background: white
    border-radius: 10px
    border: solid 1px $szarszy

  &__left
    &-top
      display: grid
      grid-template-columns: 200px auto
      margin-bottom: 20px
      &-text
        margin: 0 0 20px 10px
        display: flex
        justify-content: center
        flex-direction: column
        row-gap: 10px

    &-bottom
      font-family: 'Raleway', sans-serif

  &__right
    display: flex
    flex-direction: column
    row-gap: 10px
    font-family: "Open sans", sans-serif
    font-size: 1rem
    height: max-content

  &__logo
    width: 200px
    height: 200px
    border-radius: 50%
    object-fit: cover

  &__contact
    margin: 0
    padding: 0
    
    &-element
      margin: 10px 0 0 0
      display: flex
      align-items: center
      column-gap: 10px

      &:first-child
       margin: 0 
        

  &__industry, &__place, &__country, &__name
    font-family: "Open Sans", sans-serif
    display: flex
    column-gap: 10px
    align-items: center
    text-decoration: none

.admin
  font-family: "Open Sans", sans-serif
  padding: 10px
  border-radius: 10px
  background: white
  width: 220px
  margin-bottom: auto
  border: solid 1px $szarszy

  &-list
    font-family: "Open Sans", sans-serif
    max-width: 100vw
    overflow: auto
    box-sizing: border-box
    margin: 0 20px
    display: flex
    column-gap: 10px
    height: max-content

  &__avatar
    object-fit: cover
    width: 100%
    height: 100%
    border-radius: 50%

  &__title
    font-size: 1.6rem

  &-panel
    margin-top: 10px
    &__title
      margin: 0
      padding: 10px 0 10px 20px
      font-size: 2rem
      font-family: 'Raleway', sans-serif

    &__form
      column-gap: 30px
      display: flex
      background: white
      width: max-content
      border-radius: 10px
      padding: 10px
      border: solid 1px $szarszy
      align-items: center
      margin: 0 0 10px 20px

      input
        width: 370px
</style>
