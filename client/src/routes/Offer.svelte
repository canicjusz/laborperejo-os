<script>
  import axios from "axios";
  import Spinner from "../components/Spinner.svelte";
  import { Link, link } from "svelte-routing";
  import { getDate } from "../shared";

  export let id;
  let title = "";

  const loadOffer = axios.get(`/api/offers/${id}`).then((res) => {
    title = res.data.title;
    return res.data;
  });
</script>

<svelte:head>
  {#if title}
    <title>{title} | Laborperejo</title>
    <meta name="description" content="Oferto {title} ĉe laborperejo." />
  {/if}
</svelte:head>

{#await loadOffer}
  <div class="spinner__container">
    <Spinner />
  </div>
{:then offer}
  <div class="offer__container">
    <div class="offer">
      <div class="offer__left">
        <div class="offer__left-top">
          <div class="offer__logo-container">
            <Link to={offer.companyID}>
              <img src={offer.company.logo} alt="" class="offer__avatar" />
            </Link>
          </div>
          <div class="offer__left-top-text">
            <span class="offer__name">
              {offer.title}
            </span>
            <span class="offer__company-name">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M10 10.111V1l11 6v14H3V7z"
                /></svg
              >
              {offer.company.name}
            </span>
            <span class="offer__place"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                /></svg
              >
              {offer.place}, {offer.country}</span
            >
            {#if offer.isOwner}
              <a
                href={`/ofertoj/${offer.ID}/redakti`}
                use:link
                class="offer__edit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  ><path fill="none" d="M0 0h24v24H0z" /><path
                    d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z"
                  /></svg
                >Redakti</a
              >
            {/if}
          </div>
        </div>
        <div class="offer__left-bottom">
          {@html offer.description}
        </div>
      </div>
      <div class="offer__right">
        <div class="offer__employment">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            ><path fill="none" d="M0 0h24v24H0z" /><path
              d="M12 15.968l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275v10.693zm0 2.292l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26z"
            /></svg
          >
          Dungeco:
          {offer.employment}
        </div>
        <div class="offer__arrangement">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            ><path fill="none" d="M0 0h24v24H0z" /><path
              d="M21 21H3a1 1 0 0 1-1-1v-7.513a1 1 0 0 1 .343-.754L6 8.544V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1zM9 19h3v-6.058L8 9.454l-4 3.488V19h3v-4h2v4zm5 0h6V5H8v2.127c.234 0 .469.082.657.247l5 4.359a1 1 0 0 1 .343.754V19zm2-8h2v2h-2v-2zm0 4h2v2h-2v-2zm0-8h2v2h-2V7zm-4 0h2v2h-2V7z"
            /></svg
          >
          Maniero:
          {offer.arrangement}
        </div>
        <div class="offer__reward">
          {#if offer.salary}<svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              ><path fill="none" d="M0 0h24v24H0z" /><path
                d="M23 12v2c0 3.314-4.925 6-11 6-5.967 0-10.824-2.591-10.995-5.823L1 14v-2c0 3.314 4.925 6 11 6s11-2.686 11-6zM12 4c6.075 0 11 2.686 11 6s-4.925 6-11 6-11-2.686-11-6 4.925-6 11-6z"
              /></svg
            >Salajro:
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              ><path fill="none" d="M0 0h24v24H0z" /><path
                d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 9h2v4h2V9h2l-3-3.5L7 9zm10 6h-2v-4h-2v4h-2l3 3.5 3-3.5z"
              /></svg
            >Rekompenco:
          {/if}
          {offer.reward}
        </div>
        <div class="offer__close">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            ><path fill="none" d="M0 0h24v24H0z" /><path
              d="M22 14h-2V7.238l-7.928 7.1L4 7.216V19h11v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v10zM4.511 5l7.55 6.662L19.502 5H4.511zm16.903 14l2.122 2.121-1.415 1.415L20 20.414l-2.121 2.122-1.415-1.415L18.586 19l-2.122-2.121 1.415-1.415L20 17.586l2.121-2.122 1.415 1.415L21.414 19z"
            /></svg
          >
          {#if offer.closed}
            <span style="color: red;">La oferto jam fermiĝis</span>
          {:else}
            Fermiĝo: {getDate(offer.close_at)}
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

.spinner__container
  text-align: center
  padding-top: 20px

.offer
  display: grid
  column-gap: 20px
  grid-template-columns: 642px 287px

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
    font-family: "Open sans", sans-serif
    font-size: 1rem
    flex-direction: column
    row-gap: 10px
    height: max-content

  &__avatar
    width: 200px
    height: 200px
    border-radius: 50%
    object-fit: cover


  &__name
    font-size: 2rem
    font-family: 'Raleway', sans-serif

  &__edit, &__place, &__company-name, &__employment, &__arrangement, &__reward, &__close 
    font-family: "Open Sans", sans-serif
    display: flex
    column-gap: 10px
    align-items: center
    text-decoration: none

@media (max-width: 1000px)
  .offer
    grid-template-columns: minmax(100%, 642px)
    margin: 0 20px
    row-gap: 20px

@media (max-width: 700px)
  .offer

    &__name
      text-align: center

    &__left-top
      grid-template-columns: auto

      &-text
        margin: 0
      
    &__logo
      text-align: center

      &-container
        text-align: center
</style>
