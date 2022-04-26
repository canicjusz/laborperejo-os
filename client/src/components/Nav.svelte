<script>
  import { Link, link, navigate } from "svelte-routing";
  import { user, error } from "../stores";
  import { getDate, changeObservation } from "../shared";
  import axios from "axios";
  import { globalHistory } from "svelte-routing/src/history";

  let hide = {
    search: true,
    profile: true,
    panels: true,
    watched: true,
  };
  let hamburgerClicked = false;
  const hideKeys = Object.keys(hide);
  const hideExpandedBut = (openedKey) => {
    hideKeys.forEach((key) => {
      hide[key] = key === openedKey ? !hide[key] : true;
    });
  };
  const hideIfOutside = (e) => {
    const element = e.target;
    if (
      !element.classList.contains("navbar__expander") &&
      !element.classList.contains("star__svg") &&
      !element.classList.contains("offer__star-svg")
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

  globalHistory.listen(() => (hamburgerClicked = false));
</script>

<svelte:window on:click={hideIfOutside} />

<nav class="navbar navbar--full">
  <ul class="navbar__list">
    <li>
      <Link to="/" class="navbar__logo-container"
        ><img src="/logo.png" alt="" class="navbar__logo" /></Link
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
    <!-- <li class="navbar__element">
      <Link to="/" class="navbar__link">Helpo</Link>
    </li>
    <li class="navbar__element">
      <Link to="/" class="navbar__link">Pri ni</Link>
    </li> -->
  </ul>
  {#if $user}
    <ul class="navbar__list navbar__list-left">
      <li class="navbar__star star">
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
                    <span class="window__text-top">
                      <a
                        use:link
                        href={"/ofertoj/" + offer.ID}
                        class="window__link">{offer.title}</a
                      >
                      <button
                        on:click={() => changeObservation(offer.ID, offer)}
                        class="offer__star"
                        >{#if $user.watchlist.some((followedOffer) => followedOffer.ID === offer.ID)}
                          <svg
                            class="offer__star-svg"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            ><path fill="none" d="M0 0h24v24H0z" /><path
                              d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"
                            /></svg
                          >{:else}
                          <svg
                            class="offer__star-svg"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            ><path fill="none" d="M0 0h24v24H0z" /><path
                              d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26zm0-2.292l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275l-2.038 4.42-4.833.572 3.573 3.305-.949 4.773L12 15.968z"
                            /></svg
                          >{/if}</button
                      >
                    </span>
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

<nav class="navbar navbar--mobile">
  <div class="navbar__inner-container">
    <Link to="/" class="navbar__logo-container"
      ><img src="/logo.png" alt="" class="navbar__logo" /></Link
    >
    <div class="navbar__right-side">
      {#if $user}
        <div class="star">
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
          <div
            class="navbar__window window"
            class:window--hidden={hide.watched}
          >
            {#if $user.watchlist.length > 0}
              <ul class="window__list">
                {#each $user.watchlist as offer}
                  <li class="window__element">
                    <img
                      src={offer.company.logo}
                      alt=""
                      class="window__image"
                    />
                    <div class="window__text">
                      <span class="window__text-top">
                        <a
                          use:link
                          href={"/ofertoj/" + offer.ID}
                          class="window__link">{offer.title}</a
                        >
                        <button
                          on:click={() => changeObservation(offer.ID, offer)}
                          class="offer__star"
                          >{#if $user.watchlist.some((followedOffer) => followedOffer.ID === offer.ID)}
                            <svg
                              class="offer__star-svg"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              ><path fill="none" d="M0 0h24v24H0z" /><path
                                d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"
                              /></svg
                            >{:else}
                            <svg
                              class="offer__star-svg"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              ><path fill="none" d="M0 0h24v24H0z" /><path
                                d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26zm0-2.292l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275l-2.038 4.42-4.833.572 3.573 3.305-.949 4.773L12 15.968z"
                              /></svg
                            >{/if}</button
                        >
                      </span>
                      {#if offer.closed}
                        <small style="color: red;">La oferto jam fermiĝis</small
                        >
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
        </div>
      {/if}
      <div
        class="hamburger"
        class:hamburger--clicked={hamburgerClicked}
        on:click={() => (hamburgerClicked = !hamburgerClicked)}
      >
        <div class="hamburger__cheese" />
        <div class="hamburger__meat" />
        <div class="hamburger__bun" />
      </div>
    </div>
  </div>
  <ul class="navbar__list" class:navbar__list--show={hamburgerClicked}>
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
      </li>
      <li class="navbar__element">
        <Link class="navbar__link" to={`/profiloj/${$user.ID}`}
          >Mia profilo</Link
        >
      </li>
      <li class="navbar__element">
        <Link class="navbar__link" to="/firmapanelo">Firmopanelo</Link>
      </li>
      <li class="navbar__element">
        <Link class="navbar__link" to="/ofertpanelo">Ofertpanelo</Link>
      </li>
      <li class="navbar__element">
        <Link class="navbar__link" to="/restarigi-pasvorton"
          >Restarigi pasvorton</Link
        >
      </li>
      <li on:click={deleteSession} class="navbar__element">
        <span class="navbar__link">Elsaluti</span>
      </li>
    {:else}
      <li class="navbar__element">
        <Link class="navbar__link" to="/registrigxi">Registriĝi</Link>
      </li>
      <li class="navbar__element">
        <Link class="navbar__link" to="/ensaluti">Ensaluti</Link>
      </li>
    {/if}
  </ul>
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

      &-top
        justify-content: space-between
        display: flex

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

    &--mobile
      display: none

    &__logo
      width: 100%

      &-container
        padding: 0 10px
        height: 100%
        align-items: center
        display: flex
        width: 150px
    
    &__list
      height: 100%
      align-items: center
      margin: 0
      padding: 0
      list-style: none
      display: flex

      &-left
        column-gap: 10px

        .navbar__expander::after
          margin-right: 20px

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

    &__expander

      &::after
        content: ""
        margin-left: 10px
        width: 10px
        height: 10px
        transform: rotate(45deg)
        border-bottom: 2px solid $niebieski-link
        border-right: 2px solid $niebieski-link
        margin-bottom: 5px

      &--active

        &::after
          border-bottom: none !important
          border-right: none !important
          border-top: 2px solid $niebieski-link
          border-left: 2px solid $niebieski-link
          margin-top: 10px

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


.star
  height: 100%
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

.offer__star
  border: none
  background: transparent

.hamburger
  z-index: 2
  display: flex
  cursor: pointer
  width: 40px
  box-sizing: content-box
  height: 40px
  justify-content: space-around
  flex-direction: column

  &__cheese, &__meat, &__bun
    pointer-events: none
    height: 5px
    width: 40px
    background: black
    transition: transform 0.3s ease-in-out

  &--clicked .hamburger__cheese
    transform: translateY(260%) rotate(45deg)

  &--clicked .hamburger__meat
    transform: rotate(-45deg)

  &--clicked .hamburger__bun
    transform: translateX(51px)

@media (max-width: 800px)
  .navbar

    &__inner-container
      background: $bialy
      display: flex
      width: 100%
      justify-content: space-between
      z-index: 2
      position: relative

    &__expander, &__link
      border-bottom: 1px solid $szarszy 
      box-sizing: border-box
      height: 50px

    &__sub-list ~ &__expander
      background: red

    &__element
      width: 100%
      box-sizing: border-box
      min-height: 50px

    &__sub-list
      border: none
      background: $szary
      position: relative

    &__list
      left: 0
      transform: translateY(-500px)
      transition: transform 0.4s ease-in-out
      width: 100%
      height: auto
      flex-direction: column
      top: 50px
      background: white
      position: absolute
      display: flex

      &--show
        transform: translateY(0)

    &__right-side
      margin-right: 10px
      display: flex
      align-items: center
      height: 100%
      column-gap: 20px

    &--full
      display: none

    &--mobile
      display: flex

</style>
