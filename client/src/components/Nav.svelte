<script>
  import { Link, link, navigate } from "svelte-routing";
  import { user, error } from "../stores";
  import { getDate } from "../shared";
  import axios from "axios";

  let hide = {
    search: true,
    profile: true,
    panels: true,
    watched: true,
  };
  const hideKeys = Object.keys(hide);
  const hideExpandedBut = (openedKey) =>
    hideKeys.forEach((key) => {
      hide[key] = key === openedKey ? !hide[key] : true;
    });
  const hideIfOutside = (e) => {
    const element = e.target;
    if (
      !element.classList.contains("navbar__expander") &&
      !element.classList.contains("star__svg")
    ) {
      hideKeys.forEach((key) => {
        hide[key] = true;
      });
    }
  };
  const deleteSession = () =>
    axios
      .delete("/api/session")
      .then((res) => {
        navigate("/");
        user.set(null);
      })
      .catch(error.change);
</script>

<svelte:window on:click={hideIfOutside} />

<nav class="navbar">
  <ul class="navbar__list">
    <li class="navbar__element">
      <Link to="/" class="navbar__link"
        ><img src="/emblemo.jpg" alt="" class="navbar__logo" /></Link
      >
    </li>
    <li class="navbar__element">
      <!-- svelte-ignore a11y-invalid-attribute -->
      <span
        on:click={() => hideExpandedBut("search")}
        class="navbar__expander"
        href="javascript:void()"
        class:navbar__expander--active={!hide.search}>Serĉi</span
      >
      <ul class="navbar__sub-list" class:navbar__sub-list--hidden={hide.search}>
        <li class="navbar__sub-element">
          <Link class="navbar__link" to="/ofertoj?p=1">Ofertojn</Link>
        </li>
        <li class="navbar__sub-element">
          <Link class="navbar__link" to="/firmaoj?p=1">Firmaojn</Link>
        </li>
        <li class="navbar__sub-element">
          <Link class="navbar__link" to="/profiloj?p=1">Uzantojn</Link>
        </li>
      </ul>
    </li>
    {#if $user}
      <li class="navbar__element">
        <!-- svelte-ignore a11y-invalid-attribute -->
        <span
          on:click={() => hideExpandedBut("panels")}
          class="navbar__expander"
          href="javascript:void()"
          class:navbar__expander--active={!hide.panels}>Paneloj</span
        >
        <ul
          class="navbar__sub-list"
          class:navbar__sub-list--hidden={hide.panels}
        >
          <li class="navbar__sub-element">
            <Link class="navbar__link" to="/firmapanelo">Firmopanelo</Link>
          </li>
          <li class="navbar__sub-element">
            <Link class="navbar__link" to="/ofertpanelo">Ofertpanelo</Link>
          </li>
        </ul>
      </li>{/if}
    <li class="navbar__element">
      <Link to="/" class="navbar__link">Helpo</Link>
    </li>
    <li class="navbar__element">
      <Link to="/" class="navbar__link">Pri ni</Link>
    </li>
  </ul>
  {#if $user}
    <ul class="navbar__list">
      <li style="height: 100%" class="navbar__star star">
        <svg
          class="star__svg"
          on:click={() => hideExpandedBut("watched")}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          ><path fill="none" d="M0 0h24v24H0z" /><path
            d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"
          /></svg
        >
        <span class="star__number">{$user.watchlist.length}</span>
        <div class="navbar__window window" class:window--hidden={hide.watched}>
          {#if $user.watchlist.length > 0}
            <ul class="window__list">
              {#each $user.watchlist as offer}
                <li class="window__element">
                  <img src={offer.company.logo} alt="" class="window__image" />
                  <div class="window__text">
                    <a
                      use:link
                      href={"/ofertoj/" + offer.ID}
                      class="window__link">{offer.title}</a
                    >
                    {#if offer.closed}
                      <small style="color: red;">La oferto jam fermiĝis</small>
                    {:else}
                      <small>Fermonta {getDate(offer.close_at)}</small>
                    {/if}
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p style="margin: 10px;">Vi observas neniun oferton</p>
          {/if}
        </div>
      </li>
      <li style="height: 100%">
        <span
          class="navbar__expander"
          on:click={() => hideExpandedBut("profile")}
          class:navbar__expander--active={!hide.profile}
          ><img src={$user.profile.avatar} alt="" class="navbar__avatar" />
          <span class="navbar__name">
            {$user.name}
          </span></span
        >
        <ul
          class="navbar__sub-list"
          class:navbar__sub-list--hidden={hide.profile}
        >
          <li class="navbar__sub-element">
            <Link class="navbar__link" to={`/profiloj/${$user.ID}`}
              >Mia profilo</Link
            >
          </li>
          <li class="navbar__sub-element">
            <Link class="navbar__link" to="/firmapanelo">Firmopanelo</Link>
          </li>
          <li class="navbar__sub-element">
            <Link class="navbar__link" to="/ofertpanelo">Ofertpanelo</Link>
          </li>
          <li class="navbar__sub-element">
            <Link class="navbar__link" to="/restarigi-pasvorton"
              >Restarigi pasvorton</Link
            >
          </li>
          <li on:click={deleteSession} class="navbar__sub-element">
            <span class="navbar__link">Elsaluti</span>
          </li>
        </ul>
      </li>
    </ul>
  {:else}
    <div>
      <ul class="navbar__list">
        <li class="navbar__element">
          <Link class="navbar__link" to="/registrigxi">Registriĝi</Link>
        </li>
        <li class="navbar__element">
          <Link class="navbar__link" to="/ensaluti">Ensaluti</Link>
        </li>
      </ul>
    </div>
  {/if}
</nav>

<style lang="sass" global>
  $navy: #005ea9
  $szary: #f1f1f1
  $szarszy: #d7d7d7
  $najszarszy: #acacac
  $czarny: #363736
  $niebieski-link: #1b75bc
  $bialy: #ffffff
  $crimson: 	#DC143C

  .window
    position: absolute
    width: 250px
    max-height: 300px
    height: max-content
    background: $szary
    right: 0
    top: 100% 
    display: block
    border: 1px solid $szarszy

    &--hidden
      display: none

    &::before
      position: absolute
      content: ""
      display: block
      top: -9px
      right: 12px
      height: 15px
      width: 15px
      transform: rotate(-45deg)
      background: $szary
      border-top: 1px solid $szarszy
      border-right: 1px solid $szarszy
    // overflow-y: auto

    &__list
      padding: 0
      margin: 0
      max-height: 300px
      overflow-y: auto

    &__element
      display: flex
      padding: 10px
      column-gap: 5px
      border-bottom: 1px solid $szarszy

      &:last-child
        border: none 
    
    &__image
      width: 100px
      height: 100px
      box-sizing: border-box
      border-radius: 5px

    &__link
      display: block
      font-size: 1.5rem
      font-family: "Raleway", sans-serif

    &__text
      display: flex
      flex-direction: column
      justify-content: space-between
      column-gap: 5px

  .navbar
    z-index: 3
    position: fixed
    width: 100%
    justify-content: space-between
    display: flex
    height: 50px
    box-sizing: border-box
    background: $bialy
    font-family: 'Open Sans', sans-serif
    border-bottom: 1px solid $szarszy

    &__logo
      height: 100%
      width: 100%
    
    &__list
      height: 100%
      align-items: center
      margin: 0
      padding: 0
      list-style: none
      display: flex

    &__sub

      &-list
        border: 1px solid $szarszy
        border-top: none
        background: $bialy
        margin: 0
        padding: 0
        list-style: none
        display: block

        &--hidden
          display: none

      &-element
        height: 50px

        &:hover
          background: $szary

    &__element
      height: 100%
      width: 150px

    &__expander, &__link
      color: $niebieski-link
      cursor: pointer
      user-select: none
      height: 100%
      justify-content: center
      align-items: center
      text-align: center
      width: 100%
      display: flex

      &:hover, &--active
        background: $szary

    &__link
      text-decoration: underline

    &__avatar
      pointer-events: none
      margin: 0 20px
      border-radius: 50%
      height: 40px
      width: 40px
      object-fit: cover

    &__name
      pointer-events: none
      padding-right: 20px

.star
  display: flex
  justify-content: center
  align-items: center
  position: relative
  width: 40px
  padding-top: 4px

  svg
    color: $navy
    cursor: pointer
    width: 25px
    height: 25px

  path
    pointer-events: none

  &__number
    user-select: none
    top: 5px
    right: 0
    position: absolute
    border-radius: 50%
    height: 18px
    width: 18px
    text-align: center
    display: flex
    justify-content: center
    align-items: center
    margin: 0
    color: white
    background: $crimson
    font-size: 0.7rem

</style>
