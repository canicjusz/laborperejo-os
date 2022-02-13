<script>
  import { link } from "svelte-routing";
  import axios from "axios";
  import Spinner from "../components/Spinner.svelte";
  import { getDate } from "../shared";
  export let id;

  let offers = [];
  let p = 1;
  let isMore = true;
  let name;

  const getCompany = axios.get(`/api/companies/${id}`).then((res) => {
    loadOffers();
    name = res.data.name;
    return res.data;
  });

  const loadOffers = () => {
    axios.get(`/api/offers?de=${id}&p=${p}`).then((res) => {
      const { offers: newOffers, pages } = res.data;
      offers = offers.concat(newOffers);
      if (pages <= p) {
        isMore = false;
      }
    });
  };

  // when the id in the url changes, reset values and make request for a new company
</script>

<svelte:head>
  {#if name}
    <title>{name} | Laborperejo</title>
    <meta name="description" content="Firmao {name} ĉe laborperejo." />
  {/if}
</svelte:head>
{#await getCompany}
  <div class="spinner__container">
    <Spinner />
  </div>
{:then company}
  <div class="company__container">
    <div class="company">
      <div class="company__left">
        <div class="company__left-top">
          <img src={company.logo} alt="" class="company__logo" />
          <div class="company__left-top-text">
            <span class="company__name">
              {company.name}
            </span>
            <span class="company__place">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                /></svg
              >
              {company.address}, {company.country}
            </span>
            {#if company.isOwner}
              <a href={`/firmaoj/${id}/redakti`} use:link class="company__edit"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  ><path fill="none" d="M0 0h24v24H0z" /><path
                    d="M5 19h1.414l9.314-9.314-1.414-1.414L5 17.586V19zm16 2H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L9.243 19H21v2zM15.728 6.858l1.414 1.414 1.414-1.414-1.414-1.414-1.414 1.414z"
                  /></svg
                >Redakti</a
              >
            {/if}
          </div>
        </div>
        <div class="company__left-bottom">
          {@html company.description}
          {#if offers.length > 0}
            <div class="table__container">
              <table class="table">
                <thead class="table__head">
                  <tr class="table__head-row">
                    <th class="table__column-title">Laborposteno</th>
                    <th class="table__column-title">Lando</th>
                    <th class="table__column-title">Rekompenco</th>
                    <th class="table__column-title">Malfermita</th>
                  </tr>
                </thead>
                <tbody class="table__body">
                  {#each offers as offer}
                    <tr class="table__body-row">
                      <td class="table__cell"
                        ><a href={`/ofertoj/${offer.ID}`} use:link
                          >{offer.title}</a
                        ></td
                      >
                      <td class="table__cell">{offer.country}</td>
                      <td class="table__cell"
                        >{offer.reward}
                        {#if offer.salary}<small>(Salajro)</small>{/if}</td
                      >
                      <td class="table__cell">{offer.closed ? "Ne" : "Jes"}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
          {#if isMore}
            <button on:click={loadOffers}>Montri pliajn ofertojn</button>
          {/if}
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
          {company.industry}
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
            {company.email}
          </li>
          {#if company.phone}
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
              {company.phone}
            </li>
          {/if}
        </ul>
        <div class="company__creation">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            ><path fill="none" d="M0 0H24V24H0z" /><path
              d="M6 2c2.69 0 5.024 1.517 6.197 3.741C13.374 4.083 15.31 3 17.5 3H21v2.5c0 3.59-2.91 6.5-6.5 6.5H13v1h5v7c0 1.105-.895 2-2 2H8c-1.105 0-2-.895-2-2v-7h5v-2H9c-3.866 0-7-3.134-7-7V2h4zm10 13H8v5h8v-5zm3-10h-1.5C15.015 5 13 7.015 13 9.5v.5h1.5c2.485 0 4.5-2.015 4.5-4.5V5zM6 4H4c0 2.761 2.239 5 5 5h2c0-2.761-2.239-5-5-5z"
            /></svg
          >
          {getDate(company.created_at)}
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
    font-family: "Open sans", sans-serif
    font-size: 1rem
    height: max-content

  &__logo
    width: 200px
    height: 200px
    border-radius: 50%
    object-fit: cover

  &__contact
    margin: 0 0 10px 0
    padding: 0
    
    &-element
      margin: 10px 0 0 0
      display: flex
      align-items: center
      column-gap: 10px

  &__name
    font-size: 2rem
    font-family: 'Raleway', sans-serif

  &__industry, &__creation, &__place, &__edit
    font-family: "Open Sans", sans-serif
    display: flex
    column-gap: 10px
    align-items: center
    text-decoration: none

.table
  //ngl i used this: https://dev.to/dcodeyt/creating-beautiful-html-tables-with-css-428l 
  margin-top: 10px
  border-radius: 5px 5px 2px 2px
  overflow: hidden
  border-collapse: collapse
  width: 100%

  &__container
    overflow-x: auto

  &__head
    color: white
    background: $niebieski-link

  &__cell, &__column-title
    text-align: center
    hyphens: auto
    overflow-wrap: break-word
    padding: 12px 15px

  &__body-row
    background: white
    
    &:nth-of-type(even)
      background: $szary

    &:last-child
      border-bottom: $niebieski-link 2px solid
</style>
