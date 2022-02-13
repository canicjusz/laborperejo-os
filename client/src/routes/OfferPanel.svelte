<script>
  import { link, navigate } from "svelte-routing";
  import axios from "axios";
  import { user, error, feedback } from "../stores";
  import { redirectIfNotOwner } from "../shared";
  import Select from "svelte-select";
  import { cubicInOut } from "svelte/easing";
  import Spinner from "../components/Spinner.svelte";

  let companyID = $user.companies[0]?.ID;
  redirectIfNotOwner(companyID);

  const format = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormated = format(tomorrow);

  let loading = false;
  let offers = [];
  let originalData = [];
  let p = 0;

  let isMore = false;
  let dataDownloaded = false;
  let offersChanged = [];
  let toRemove = null;

  const resetValues = () => {
    p = 0;
    dataDownloaded = false;
    isMore = false;
    offers = [];
    offersChanged = [];
    loadOffers();
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

  const loadOffers = () => {
    loading = true;
    axios
      .get(`/api/offers?de=${companyID}&p=${++p}&nm=0`)
      .then((res) => {
        loading = false;
        const { offers: newOffers, pages } = res.data;
        if (newOffers.length > 0) {
          newOffers.forEach((newOffer) => {
            newOffer.close_at = newOffer.close_at
              ? format(new Date(newOffer.close_at))
              : tomorrowFormated;
          });
          //gotta make a shallow copy
          offers = offers.concat(
            newOffers.map((obj) => Object.assign({}, obj))
          );
          originalData = originalData.concat(
            newOffers.map((obj) => Object.assign({}, obj))
          );
          offersChanged = offersChanged.concat(
            new Array(newOffers.length).fill(false)
          );
        }
        if (pages > p) {
          isMore = true;
        } else {
          isMore = false;
        }
        dataDownloaded = true;
      })
      .catch((err) => {
        loading = false;
        error.change(err);
      });
  };

  let showConfirmation = false;

  const checkIfChanged = (i) =>
    (offersChanged[i] =
      offers[i].closed !== originalData[i].closed ||
      (offers[i].close_at !== originalData[i].close_at &&
        offers[i].closed === false));

  const removeOffer = () => {
    axios
      .delete(`/api/offers/${toRemove.id}`, { data: { companyID } })
      .then(() => {
        toRemove = {};
        showConfirmation = false;
        offers.splice(toRemove.index, 1);
        originalData.splice(toRemove.index, 1);
        offersChanged.splice(toRemove.index, 1);
        offersChanged = offersChanged;
        offers = offers;
      })
      .catch(error.change);
  };
  const acceptChanges = () => {
    let changes = [];
    offersChanged.forEach((edited, i) => {
      if (edited) {
        changes.push({
          ID: offers[i].ID,
          closed: offers[i].closed,
          close_at: !offers[i].closed ? new Date(offers[i].close_at) : null,
        });
      }
    });
    axios
      .put(`/api/offers`, { array: changes, companyID })
      .then(feedback.change)
      .catch(error.change);
  };

  if (companyID) {
    loadOffers();
  }

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

  $: hasChanged = offersChanged.includes(true);
  $: companyIndex = $user.companies.findIndex(
    (company) => company.ID === companyID
  );
</script>

<svelte:head>
  <title>Ofertpanelo | Laborperejo</title>
  <meta name="description" content="Panelo de oniaj ofertoj ĉe laborperejo." />
</svelte:head>
{#if showConfirmation}
  <div class="popup__wrapper">
    <div transition:customTransition class="popup">
      <p class="popup__text">
        Ĉu vi certe volas forigi firmaon {offers[toRemove.index].title} kaj ĝiajn
        ofertojn? La operacio ne malfareblas!
      </p>
      <div class="popup__buttons">
        <button on:click={removeOffer} class="button button--round button--blue"
          >Jes</button
        >
        <button
          on:click={clearToRemove}
          class="button button--round button--blue">Ne</button
        >
      </div>
    </div>
  </div>
{/if}
{#if companyID}
  {#if !dataDownloaded}
    <div class="spinner__container">
      <Spinner />
    </div>
  {:else}
    <div class="container-of-containers">
      <div class="table__container">
        <div class="company-picker">
          Firmao:
          <div class="select-container">
            <Select
              items={$user.companies}
              value={$user.companies[companyIndex]}
              on:select={(e) => {
                companyID = e.detail.ID;
                resetValues();
              }}
              optionIdentifier="ID"
              labelIdentifier="name"
              placeholder="Elekti landon"
              noOptionsMessage="Mankas opcioj"
              isClearable={false}
            />
          </div>
        </div>
        <div class="table__real-container">
          <table class="table">
            <thead class="table__head">
              <tr class="table__head-row">
                <th class="table__column-title">Laborposteno</th>
                <th class="table__column-title">Malfermita</th>
                <th class="table__column-title">Redakti</th>
                <th class="table__column-title">Forigi</th>
              </tr>
            </thead>
            <tbody class="table__body">
              {#if offers.length > 0}
                {#each offers as offer, i}
                  <tr class="table__body-row">
                    <td class="table__cell"
                      ><a href={`/ofertoj/${offer.ID}`} use:link
                        >{offer.title}</a
                      ></td
                    >
                    <td class="table__cell" style="width: 320px">
                      <label for="">
                        Ĉu la oferto estu fermita?
                        <input
                          type="checkbox"
                          class="checkbox"
                          bind:checked={offer.closed}
                          on:change={() => checkIfChanged(i)}
                        />
                      </label>
                      {#if !offer.closed}
                        <label for="" title="Fermiĝdato">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            ><path fill="none" d="M0 0h24v24H0z" /><path
                              d="M22 14h-2V7.238l-7.928 7.1L4 7.216V19h11v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v10zM4.511 5l7.55 6.662L19.502 5H4.511zm16.903 14l2.122 2.121-1.415 1.415L20 20.414l-2.121 2.122-1.415-1.415L18.586 19l-2.122-2.121 1.415-1.415L20 17.586l2.121-2.122 1.415 1.415L21.414 19z"
                            /></svg
                          ><input
                            type="date"
                            name=""
                            id=""
                            placeholder="Fermiĝdato"
                            min={tomorrowFormated}
                            bind:value={offer.close_at}
                            on:change={() => checkIfChanged(i)}
                          />
                        </label>
                      {/if}</td
                    >
                    <td class="table__cell">
                      <button
                        on:click={() =>
                          navigate(`/ofertoj/${offer.ID}/redakti`)}
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
                        on:click={() => fillToRemove(offer.ID, i)}
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
                  <td colspan="4" class="table__cell-info"
                    >Ĉi tiu firmao ne havas ofertojn</td
                  >
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
        {#if loading}
          <div class="spinner__container">
            <Spinner />
          </div>
        {/if}
        <div class="buttons__container">
          {#if isMore}
            <button
              on:click={loadOffers}
              disabled={loading}
              type="button"
              class="button button--blue button--round">Montri pliajn</button
            >
          {/if}
          <button
            on:click={() =>
              navigate("/ofertkreilo", { state: { company: companyID } })}
            type="button"
            class="button button--blue button--round">Aldoni oferton</button
          >
          <button
            on:click={acceptChanges}
            class="button button--green button--round"
            disabled={!hasChanged}>Akcepti ŝanĝojn</button
          >
        </div>
      </div>
    </div>
  {/if}
{:else}
  <div class="url-error">
    Por administri ofertojn vi devas havi almenaŭ unu firmaon. Navigu al <a
      href="/firmapanelo"
      use:link>firmapanelo</a
    > pro krei firmaon.
  </div>
{/if}

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

.company-picker
  margin-top: 10px
  background: white
  border: 1px solid $szarszy
  padding: 10px
  font-family: "Open Sans", sans-serif
  font-size: 1.2rem
  align-items: center
  border-radius: 10px
  // left: 0
  display: flex
  width: max-content
  column-gap: 10px
  min-width: 250px

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
  padding: 10px 0 20px 0

label
  width: auto
  font-family: "Open Sans", sans-serif
  display: flex
  column-gap: 10px
  align-items: center
  text-decoration: none
  font-size: 1.2rem
  // &__container
  //   text-align: center

.popup
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
</style>
