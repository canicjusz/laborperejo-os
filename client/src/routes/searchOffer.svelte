<script>
  import axios from "axios";
  import OfferSearch from "../components/OfferSearch.svelte";
  import { link, navigate } from "svelte-routing";
  import { user, error } from "../stores";
  import { globalHistory } from "svelte-routing/src/history";
  import Spinner from "../components/Spinner.svelte";
  import { getDate } from "../shared";
  let search = location.search;
  let urlSearchParams = new URLSearchParams(search);
  let currentPage = Number(urlSearchParams.get("p")) || 1;
  let dataDownloaded = false;

  const handleSubmit = (url) => {
    navigate("/ofertoj" + url.detail);
  };

  globalHistory.listen(({ location }) => {
    //
    if (location.search && location.pathname === "/ofertoj") {
      resetValues();
    }
  });

  const resetValues = () => {
    search = location.search;
    urlSearchParams = new URLSearchParams(search);
    currentPage = Number(urlSearchParams.get("p")) || 1;
    pages = 0;
    offers = [];
    dataDownloaded = false;
    visiblePages = [];
    donwloadData();
  };

  const changePage = (page) => {
    urlSearchParams.set("p", page);
    // location.search = urlSearchParams.toString();
    const newQueryString = "?" + urlSearchParams.toString();
    navigate("/ofertoj" + newQueryString);
  };
  let pages = 0;
  let offers = [];
  let visiblePages = [];

  const donwloadData = () =>
    axios
      .get("/api/offers" + search)
      .then(({ data }) => {
        pages = data.pages;
        offers = data.offers;
        if (pages !== 0) {
          visiblePages = [currentPage];
          while (visiblePages.length < pages && visiblePages.length < 9) {
            const firstElement = visiblePages[0];
            const lastElement = visiblePages[visiblePages.length - 1];
            if (firstElement > 1) {
              visiblePages.unshift(firstElement - 1);
            }
            if (lastElement < pages) {
              visiblePages.push(lastElement + 1);
            }
          }
        }
        dataDownloaded = true;
      })
      .catch(error.change);
  donwloadData();
  const changeObservation = (ID) => {
    const isWatched = $user.watchlist.some((offer) => offer.ID === ID);
    if (isWatched) {
      axios
        .delete(`/api/offers/${ID}/follow`)
        .then((res) => {
          const offerIndex = $user.watchlist.findIndex(
            (offer) => offer.ID === ID
          );
          $user.watchlist.splice(offerIndex, 1);
          $user.watchlist = $user.watchlist;
        })
        .catch(error.change);
    } else {
      axios
        .post(`/api/offers/${ID}/follow`)
        .then((res) => {
          const offerIndex = offers.findIndex((offer) => offer.ID === ID);
          const currOffer = offers[offerIndex];
          $user.watchlist = [
            ...$user.watchlist,
            {
              ID,
              company: {
                logo: currOffer.company.logo,
              },
              title: currOffer.title,
              closed: currOffer.closed,
              close_at: currOffer.close_at,
            },
          ];
        })
        .catch(error.change);
    }
  };
</script>

<svelte:head>
  <title>Serĉi ofertojn | Laborperejo</title>
  <meta
    name="description"
    content="Serĉilo por trovi oferojn ĉe laborperejo."
  />
</svelte:head>
<OfferSearch on:submit={handleSubmit} />
{#if dataDownloaded}
  {#if visiblePages.length !== 0}
    <div class="pagination">
      {#each visiblePages as page}
        <!-- svelte-ignore a11y-invalid-attribute -->
        <a
          href="javascript:void()"
          class="pagination__element"
          class:pagination__element--selected={currentPage === page}
          on:click|preventDefault={() => changePage(page)}>{page}</a
        >
      {/each}
    </div>
    <div class="offer__container">
      {#each offers as offer}
        <div class="offer">
          <!-- todo: alty wszystkie -->
          <a use:link href={"/firmaoj/" + offer.company.ID}>
            <img src={offer.company.logo} alt="" class="offer__image" />
          </a>
          <div class="offer__content">
            <div class="offer__content-top">
              <h1 class="offer__title">
                <a href={"/ofertoj/" + offer.ID} use:link class="offer__link"
                  >{offer.title}</a
                >
                {#if $user?.ID}
                  <button
                    on:click={() => changeObservation(offer.ID)}
                    class="offer__star"
                    >{#if $user.watchlist.some((followedOffer) => followedOffer.ID === offer.ID)}
                      <span class="offer__star-text">Malobservi</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        ><path fill="none" d="M0 0h24v24H0z" /><path
                          d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"
                        /></svg
                      >{:else}<span class="offer__star-text">Observi</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        ><path fill="none" d="M0 0h24v24H0z" /><path
                          d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26zm0-2.292l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275l-2.038 4.42-4.833.572 3.573 3.305-.949 4.773L12 15.968z"
                        /></svg
                      >{/if}</button
                  >
                {/if}
              </h1>
              <p class="offer__company">
                <a use:link href={"/firmaoj/" + offer.company.ID}
                  >{offer.company.name}</a
                >
                en {offer.place}, {offer.country}
              </p>
            </div>
            <div class="offer__content-middle">
              <ul class="offer__info">
                <li>Dungeco: {offer.employment}</li>
                <li>Maniero: {offer.arrangement}</li>
                <li>
                  {offer.salary ? "Salajro" : "Rekompenco"}: {offer.reward}
                </li>
              </ul>
            </div>
            <div class="offer__content-bottom">
              Kreita {getDate(offer.created_at)}{#if offer.close_at}, fermonta {getDate(
                  offer.close_at
                )}{/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
    <div class="pagination pagination--bottom">
      {#each visiblePages as page}
        <!-- svelte-ignore a11y-invalid-attribute -->
        <a
          href="javascript:void()"
          class="pagination__element"
          class:pagination__element--selected={currentPage === page}
          on:click|preventDefault={() => changePage(page)}>{page}</a
        >
      {/each}
    </div>
  {:else}
    <div class="nothing__container">
      Pardonon, ni nenion trovis <i class="far fa-frown-open" />
    </div>
  {/if}
{:else}
  <div class="spinner__container">
    <Spinner />
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

.nothing__container, .spinner__container
  text-align: center
  padding-top: 20px

.nothing__container
  display: flex
  justify-content: center
  column-gap: 10px
  align-items: center
  font-family: 'Open Sans', sans-serif
  font-size: 1.2rem

.pagination
  box-sizing: border-box
  padding: 20px
  width: 100%
  justify-content: center
  display: flex
  column-gap: 10px

  &__element
    box-sizing: border-box
    border-radius: 50%
    width: 30px
    height: 30px
    border: 2px solid $niebieski-link
    display: flex
    justify-content: center
    align-items: center
    color: $niebieski-link
    text-decoration: none
    font-family: "Open Sans", sans-serif

    &--selected
      background: $niebieski-link
      color: white

.pagination--bottom
  position: absolute
  bottom: 0

.offer
  display: grid
  grid-template-columns: 120px 1fr
  background: white
  width: 900px
  border-bottom: 1px solid $szarszy

  &__content
    font-family: "Open Sans", sans-serif
    margin: 10px

    &-middle
      margin: 10px 0

    &-bottom
      font-size: small

  &__image
    width: 100px
    height: 100px
    margin: 10px
    box-sizing: border-box
    border-radius: 5px

  &__container
    padding: 0 20px 70px 20px
    align-items: center
    display: flex
    flex-direction: column

  &__title, &__company
    margin: 0
    max-width: 100%

  &__title
    display: flex
    justify-content: space-between

  &__link
    font-size: 2.3rem
    font-family: "Raleway", sans-serif

  &__company
    margin: 5px 0 10px 0

  &__info
    list-style: none
    padding: 0
    margin: 0

  &__star
    display: inline-flex
    align-items: center
    font-family: "Open Sans", sans-serif
    font-size: 1rem
    color: $navy
    column-gap: 5px
    cursor: pointer
    background: transparent
    border: 0

  &:last-child
    border: none

@media (max-width: 1000px)
  .offer
    width: 100%

  .offer__star-text
    display: none

</style>
