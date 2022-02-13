<script>
  import { navigate } from "svelte-routing";
  import CompanySearch from "./CompanySearch.svelte";
  import OfferSearch from "./OfferSearch.svelte";
  import UserSearch from "./UserSearch.svelte";
  let selectedResource = "/ofertoj";
  const resources = {
    ofertoj: "/ofertoj",
    uzantoj: "/profiloj",
    firmaoj: "/firmaoj",
  };
  const handleSubmit = (url) => {
    navigate(selectedResource + url.detail);
  };
</script>

<div class="gowno">
  <div class="idkwat-container">
    <div class="search-bar__select-container">
      <select bind:value={selectedResource} class="search-bar__select">
        {#each Object.entries(resources) as [name, resource]}
          <option value={resource}>
            {name}
          </option>
        {/each}
      </select>
    </div>
  </div>
  {#if selectedResource === "/ofertoj"}
    <OfferSearch on:submit={handleSubmit} />
  {:else if selectedResource === "/profiloj"}
    <UserSearch on:submit={handleSubmit} />
  {:else}
    <CompanySearch on:submit={handleSubmit} />
  {/if}
</div>

<style lang="sass">
  // todo: omg fix to potem (te nazwy klas w sensie)
  .idkwat-container
    display: flex
    justify-content: right
    position: relative

  .gowno
    column-gap: 10px
    display: grid
    grid-template-columns: repeat(2, auto)
    grid-template-rows: repeat(2, auto)
  .search-bar__select
    display: block
    appearance: none
    border: none
    background: none
    width: 150px
    padding: 15px

    &::-ms-expand
      display: none

    &-container
      border: 2px solid #e5e5e5
      display: inline-block
      position: relative

      &::after
        clip-path: polygon(50% 100%, 0 0, 100% 0)
        content: ""
        width: 10px
        height: 8px
        background: black
        top: 0
        right: 10px
        top: 50%
        transform: translateY(-50%)
        position: absolute
</style>
