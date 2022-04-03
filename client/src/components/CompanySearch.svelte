<script>
  import countries from "../../../countries";
  import categories from "../../../categories";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  const params = new URLSearchParams(window.location.search);
  let searchQuery = params.get("q") ?? "";
  let selectedCategories =
    params
      .get("k")
      ?.split(",")
      .map((category) => Number(category)) ?? [];
  let selectedCountries =
    params
      .get("l")
      ?.split(",")
      .map((country) => countries[Number(country)]) ?? [];

  let selectedOnlyOpened = params.get("mo") === "1" ? true : false;
  const hideExpandedBut = (clicked) =>
    hideKeys.forEach((key) => {
      hide[key] = key === clicked ? !hide[key] : true;
    });

  const hide = {
    category: true,
    country: true,
    miscellaneous: true,
  };
  const hideKeys = Object.keys(hide);

  const joinParameter = (name, values) =>
    values.length > 0 ? "&" + name + "=" + values.join(",") : "";

  const createQuery = () => {
    const query =
      "?q=" +
      searchQuery +
      joinParameter(
        "l",
        selectedCountries.map((country) => countries.indexOf(country))
      ) +
      joinParameter("k", selectedCategories) +
      "&mo=" +
      (selectedOnlyOpened ? "1" : "0");

    return query;
  };

  const onKeyPress = (e) => {
    if (e.charCode === 13) dispatch("submit", createQuery());
  };

  const submit = () => dispatch("submit", createQuery());

  let countryFilter = "";

  const filteringFunction = (filter) => {
    const filterToLower = filter.toLowerCase();
    return countries.filter((country) =>
      country.toLowerCase().includes(filterToLower)
    );
  };
  const toggleCountry = (country) => {
    const index = selectedCountries.indexOf(country);
    if (index > -1) {
      selectedCountries.splice(index, 1);
      selectedCountries = selectedCountries;
    } else {
      selectedCountries = [...selectedCountries, country];
    }
  };

  $: filteredCountries = filteringFunction(countryFilter);
</script>

<div class="search-form">
  <div class="top">
    <input
      class="form__search"
      type="search"
      bind:value={searchQuery}
      on:keypress={onKeyPress}
      placeholder="Nomo de firmao, fragmento de priskribo"
    />
    <button class="form__button" on:click={submit}
      ><i
        class="fas fa-search"
        style="line-height: auto; font-size: 16px"
      /><svg
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
  <div class="filters">
    <ul class="filters__expander-list">
      <li
        class="filters__expander"
        class:filters__expander--active={!hide.category}
        on:click={() => hideExpandedBut("category")}
      >
        Branĉo
      </li>
      <li
        class="filters__expander"
        class:filters__expander--active={!hide.country}
        on:click={() => hideExpandedBut("country")}
      >
        Lando
      </li>
      <li
        class="filters__expander"
        class:filters__expander--active={!hide.miscellaneous}
        on:click={() => hideExpandedBut("miscellaneous")}
      >
        Aldone
      </li>
    </ul>
    <div class="filters__filter-list">
      <div
        class="categories filters__filter"
        class:filters__filter--hidden={hide.category}
      >
        <div class="filters__filter-categories">
          {#each categories as category, index}
            <label for={"category-" + index}>
              <input
                type="checkbox"
                name=""
                id={"category-" + index}
                bind:group={selectedCategories}
                value={index}
              />
              <span>{category}</span>
            </label>
          {/each}
        </div>
      </div>
      <div class="filters__filter" class:filters__filter--hidden={hide.country}>
        <div class="input-container">
          <input type="text" bind:value={countryFilter} placeholder="Lando" />
        </div>
        {#key filteredCountries}
          <div class="filters__filter-countries">
            {#each filteredCountries as country, index}
              <label for={"country-" + index}>
                <input
                  type="checkbox"
                  name=""
                  id={"country-" + index}
                  checked={selectedCountries.includes(country)}
                  on:change={toggleCountry(country)}
                  value={country}
                />
                <span>{country}</span>
              </label>
            {/each}
          </div>
        {/key}
      </div>
      <div
        class="filters__filter"
        class:filters__filter--hidden={hide.miscellaneous}
      >
        <div class="filters__filter-miscellaneous">
          <label for="opened-only">
            <input
              type="checkbox"
              id="opened-only"
              bind:checked={selectedOnlyOpened}
            />
            <span>montri nur fimaojn kun malfermitaj ofertoj</span>
          </label>
        </div>
      </div>
    </div>
  </div>
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
  
  .top
    display: flex
    gap: 30px
    justify-content: center
  
  input[type="search"]::-webkit-search-decoration,
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-results-button,
  input[type="search"]::-webkit-search-results-decoration 
    display: none
  
  .search-form
    z-index: 2
    background: white
    padding-top: 20px
    padding-bottom: 20px
    border-bottom: 1px solid $szarszy
    position: relative
  
  .form
  
    &__search
      border: none
      background: transparent
      border-bottom: 2px solid $szarszy
      max-width: 500px
      width: 500px
      overflow: visible
      font-size: 1.3rem !important
      height: 50px
      box-sizing: border-box
      font-family: 'Raleway', sans-serif
      outline: none
      transition: 0.3s border-color
  
      &:focus
        border-color: $niebieski-link
  
    &__button
      gap: 10px
      text-decoration: none
      display: inline-flex
      justify-content: center
      text-align: center
      align-items: center
      font-family: "Open Sans", sans-serif
      box-sizing: border-box
      background: $niebieski-link
      border: 2px solid $niebieski-link
      transition: 0.5s background, 0.5s border-color
      cursor: pointer
      height: 50px
      width: 200px
      border-radius: 30px
      color: $bialy
      font-size: 20px
  
      &:hover
        background:$navy
        border-color: $navy
  
  .filters
  
    &__expander
  
      user-select: none
      width: 150px
      height: 50px
      font-family: "Open Sans", sans-serif
      border: 2px solid $szarszy
      display: flex
      justify-content: space-around
      align-items: center
      text-align: center
  
      &:hover
        border-color: $niebieski-link
        background: $niebieski-link
        color: white
  
        &::after
          border-color: white
  
      &--active
        border-color: $niebieski-link
        background: $niebieski-link
        color: white
  
        &::after
          border-bottom: none !important
          border-right: none !important
          border-top: 2px solid white
          border-left: 2px solid white
          margin-top: 10px
  
      &-list
        margin: 0
        margin-top: 20px
        padding: 0
        column-gap: 10px
        row-gap: 10px
        list-style: none
        display: flex
        justify-content: center
  
  
      &::after
        content: ""
        width: 10px
        height: 10px
        // background: transparent
        transform: rotate(45deg)
        border-bottom: 2px solid $szarszy
        border-right: 2px solid $szarszy
        margin-bottom: 5px
        // clip-path: polygon(50% 100%, 0 0, 100% 0)
  
    &__filter
      margin-top: 20px
  
      label
        gap: 5px
        display: grid
        grid-template-columns: 16px 1fr
        align-items: start
        width: 230px
  
        span::first-letter
          text-transform: uppercase
  
        input
          margin: 0
          padding: 0
          box-sizing: border-box
          width: 1rem
          height: 1rem
  
      &-categories
        row-gap: 20px
        column-gap: 10px
        display: grid
        grid-template-columns: repeat(4, 1fr)
        max-height: 300px
        width: max-content
  
      &-miscellaneous

        label
          width: auto
  
      &-countries
        width: max-content
        max-height: 350px
        overflow-y: auto
        overflow-x: hidden
        display: grid
        row-gap: 20px
        column-gap: 10px
        grid-auto-flow: column
        grid-template-rows: repeat(65, max-content)
  
      &--hidden
        display: none
  
      &-list
        display: flex
        justify-content: center
  
  .input-container
    width: 100%
    display: flex
    justify-content: center
    margin-bottom: 20px

  @media (max-width: 1000px)
    .filters__filter-categories
      grid-template-columns: repeat(3, 1fr)

    .filters__filter-countries
      grid-template-rows: repeat(90, max-content)

  @media (max-width: 800px)

    .search-form
      padding: 20px 20px 10px 20px

    .filters__filter-categories
      grid-template-columns: repeat(2, 1fr)

    .filters__filter-countries
      grid-template-rows: repeat(130, max-content)

    .top
      flex-direction: column

    .filters__expander
      width: 100%
      justify-content: center
      column-gap: 10px

    .filters__expander-list
      flex-direction: column

    .form
      
      &__search, &__button
        max-width: 100%
        width: 100%

  @media (max-width: 520px)
    .filters__filter-employments-label, .filters__filter-arrangements-label
      width: 100px !important
      column-gap: 5px !important

    .filters__filter-categories
      grid-template-columns: 1fr

    .filters__filter-countries
      grid-template-rows: repeat(260, max-content)
</style>
