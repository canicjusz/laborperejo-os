<script>
  import axios from "axios";
  import UserSearch from "../components/UserSearch.svelte";
  import { link, navigate } from "svelte-routing";
  import { globalHistory } from "svelte-routing/src/history";
  import { getDate } from "../shared";
  import { error } from "../stores";
  import Spinner from "../components/Spinner.svelte";
  let search = location.search;
  let urlSearchParams = new URLSearchParams(search);
  let currentPage = Number(urlSearchParams.get("p")) || 1;
  let dataDownloaded = false;

  const handleSubmit = (url) => {
    navigate("/profiloj" + url.detail);
  };

  globalHistory.listen(({ location }) => {
    //
    if (location.search && location.pathname === "/profiloj") {
      resetValues();
    }
  });

  const resetValues = () => {
    search = location.search;
    urlSearchParams = new URLSearchParams(search);
    currentPage = Number(urlSearchParams.get("p")) || 1;
    pages = 0;
    profiles = [];
    dataDownloaded = false;
    visiblePages = [];
    donwloadData();
  };

  const changePage = (page) => {
    urlSearchParams.set("p", page);
    // location.search = urlSearchParams.toString();
    const newQueryString = "?" + urlSearchParams.toString();
    navigate("/profiloj" + newQueryString);
  };
  let pages = 0;
  let profiles = [];
  let visiblePages = [];
  const donwloadData = () =>
    axios
      .get("/api/users" + search)
      .then(({ data }) => {
        pages = data.pages;
        profiles = data.profiles;

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
</script>

<svelte:head>
  <title>Serĉi uzantojn | Laborperejo</title>
  <meta
    name="description"
    content="Serĉilo por trovi uzantojn ĉe laborperejo."
  />
</svelte:head>

<UserSearch on:submit={handleSubmit} />
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
    <div class="profile__container">
      {#each profiles as profile}
        <div class="profile">
          <a use:link href={"/profiloj/" + profile.ID}>
            <img src={profile.avatar} alt="" class="profile__image" />
          </a>
          <div class="profile__content">
            <div class="profile__content-top">
              <h1 class="profile__title">
                <a
                  use:link
                  href={"/profiloj/" + profile.user_ID}
                  class="profile__link">{profile.user_name}</a
                >
              </h1>
            </div>

            <div class="profile__content-middle">
              <ul class="profile__info">
                <li>
                  Loĝanta en {profile.place}, {profile.country}.
                </li>
                <li>
                  {#if profile.job}
                    {profile.searching ? "Serĉanta laboron" : "Laboranta"} kiel {profile.job}.
                  {:else}
                    {profile.searching ? "Serĉanta" : "Ne serĉanta"} laboron.
                  {/if}
                </li>
              </ul>
            </div>
            <div class="profile__content-bottom">
              Kreita {getDate(profile.created_at)}
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
  
  .nothing__container
    display: flex
    justify-content: center
    column-gap: 10px
    align-items: center
    font-family: 'Open Sans', sans-serif
    font-size: 1.2rem
  
  .pagination
    padding: 20px
    box-sizing: border-box
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
  
  .profile
    display: grid
    grid-template-columns: 120px 1fr
    background: white
    width: 900px
    border-bottom: 1px solid $szarszy

    &__link
      font-size: 2.3rem
      font-family: "Raleway", sans-serif
  
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
      display: block
      box-sizing: border-box
      border-radius: 5px
  
    &__container
      align-items: center
      display: flex
      flex-direction: column
      padding: 0 20px 70px 20px
  
    &__title
      margin: 0
      max-width: 100%
  
    &__info
      list-style: none
      padding: 0
      margin: 0
  
    &:last-child
      border: none
  
@media (max-width: 1000px)
  .profile
    width: 100%
</style>
