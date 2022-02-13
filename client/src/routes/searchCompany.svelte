<script>
  import axios from "axios";
  import CompanySearch from "../components/CompanySearch.svelte";
  import { onlyOpened, getDate } from "../shared";
  import { link, navigate } from "svelte-routing";
  import { globalHistory } from "svelte-routing/src/history";
  import { error } from "../stores";
  import Spinner from "../components/Spinner.svelte";
  let search = location.search;
  let urlSearchParams = new URLSearchParams(search);
  let currentPage = Number(urlSearchParams.get("p")) || 1;
  let dataDownloaded = false;

  globalHistory.listen(({ location }) => {
    //
    if (location.search && location.pathname === "/firmaoj") {
      resetValues();
    }
  });

  const resetValues = () => {
    search = location.search;
    urlSearchParams = new URLSearchParams(search);
    currentPage = Number(urlSearchParams.get("p")) || 1;
    pages = 0;
    companies = [];
    dataDownloaded = false;
    visiblePages = [];
    donwloadData();
  };

  const handleSubmit = (url) => {
    navigate("/firmaoj" + url.detail);
  };
  let pages = 0;
  let companies = [];
  let visiblePages = [];

  const changePage = (page) => {
    urlSearchParams.set("p", page);
    // location.search = urlSearchParams.toString();
    const newQueryString = "?" + urlSearchParams.toString();
    navigate("/firmaoj" + newQueryString);
  };

  const donwloadData = () =>
    axios
      .get("/api/companies" + search)
      .then(({ data }) => {
        pages = data.pages;
        companies = data.companies;
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
  <title>Serĉi firmaojn | Laborperejo</title>
  <meta
    name="description"
    content="Serĉilo por trovi firmaojn ĉe laborperejo."
  />
</svelte:head>
<CompanySearch on:submit={handleSubmit} />
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
    <div class="company__container">
      {#each companies as company}
        <div class="company">
          <a use:link href={"/firmaoj/" + company.ID}>
            <img src={company.logo} alt="" class="company__image" />
          </a>
          <div class="company__content">
            <div class="company__content-top">
              <h1 class="company__title">
                <a
                  use:link
                  href={"/firmaoj/" + company.ID}
                  class="company__link">{company.name}</a
                >
              </h1>
            </div>
            <div class="company__content-middle">
              <ul class="company__info">
                <li>
                  La ĉefsidejo situas en {company.country}.
                </li>
                <li>
                  La ĉefa branĉo estas {company.industry}.
                </li>
                <li>
                  Nombro de malfermitaj ofertoj: {onlyOpened(company.offers)
                    .length}.
                </li>
              </ul>
            </div>
            <div class="company__content-bottom">
              Kreita {getDate(company.created_at)}
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
    padding: 20px 0
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
  
  .company
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
      align-items: center
      display: flex
      flex-direction: column
      padding-bottom: 70px
  
    &__title
      margin: 0
      max-width: 100%

    &__link
      font-size: 2.3rem
      font-family: "Raleway", sans-serif
  
    &__info
      list-style: none
      padding: 0
      margin: 0
  
    &:last-child
      border: none
</style>
