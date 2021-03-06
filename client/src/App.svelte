<script>
  import Loadable from "svelte-loadable";
  import { Router, Route } from "svelte-routing";
  import Spinner from "./components/Spinner.svelte";
  import axios from "axios";
  import { user, error, feedback } from "./stores";
  import Nav from "./components/Nav.svelte";
  import { onDestroy } from "svelte";
  import { navigate } from "svelte-routing/src/history";
  import LoadableContainer from "./components/LoadableContainer.svelte";
  let localError, localFeedback;
  let errorTimeout, feedbackTimeout;
  let showError = false,
    showFeedback = false;

  const unsubscribeError = error.subscribe((val) => {
    if (val) {
      clearTimeout(errorTimeout);
      showError = true;
      localError = val;
      errorTimeout = setTimeout(() => (showError = false), 4000);
    }
  });

  const unsubscribeFeedback = feedback.subscribe((val) => {
    if (val) {
      clearTimeout(errorTimeout);
      showFeedback = true;
      localFeedback = val;
      feedbackTimeout = setTimeout(() => (showFeedback = false), 4000);
    }
  });

  onDestroy(() => {
    unsubscribeError();
    unsubscribeFeedback();
  });

  const getLoggedInUser = axios
    .get("/api/users/mine", { withCredentials: true })
    .then((res) => {
      const databaseUser = res.data;
      if (databaseUser) {
        user.set(databaseUser);
      }
    })
    .catch(error.change);

  export let url = "";
</script>

{#if unsubscribeError}
  <div class="alert alert--error" class:alert--on={showError}>
    <b>Eraro {localError?.status}:</b>
    {localError?.content}
  </div>
{/if}
{#if unsubscribeFeedback}
  <div class="alert alert--feedback" class:alert--on={showFeedback}>
    {localFeedback?.content}
  </div>
{/if}
<Router {url}>
  {#await getLoggedInUser}
    <main>
      <div class="spinner__container">
        <Spinner />
      </div>
    </main>
  {:then}
    <Nav />
    <main>
      <Route path="/konfirmi-registrigxon/:token" let:params>
        <LoadableContainer loggedIn={false} to={`/profiloj/${$user?.ID}`}
          ><Loadable
            loader={() => import("./routes/Confirmation.svelte")}
            token={params.token}
          >
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/ensaluti">
        <LoadableContainer loggedIn={false} to={`/profiloj/${$user?.ID}`}>
          <Loadable loader={() => import("./routes/Login.svelte")}>
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/registrigxi">
        <LoadableContainer loggedIn={false} to={`/profiloj/${$user?.ID}`}>
          <Loadable loader={() => import("./routes/Register.svelte")}>
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/peti-pasvortrestarigon">
        <LoadableContainer loggedIn={false} to={`/profiloj/${$user?.ID}`}
          ><Loadable loader={() => import("./routes/AskPasswordChange.svelte")}>
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/restarigi-pasvorton/:id/:token" let:params>
        <LoadableContainer loggedIn={false} to={`/profiloj/${$user?.ID}`}
          ><Loadable
            loader={() => import("./routes/PasswordChange.svelte")}
            id={params.id}
            token={params.token}
          >
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/profiloj">
        <Loadable loader={() => import("./routes/searchUser.svelte")}>
          <div slot="loading">
            <div class="spinner__container">
              <Spinner />
            </div>
          </div>
          <div slot="error">
            <div class="url-error">
              Pardonon, io misiris. <a
                href="javascript:void()"
                on:click={window.location.reload}>Reŝargi paĝon</a
              >
            </div>
          </div>
        </Loadable>
      </Route>
      <Route path="/profiloj/:id" let:params>
        <Loadable
          loader={() => import("./routes/Profile.svelte")}
          id={params.id}
        >
          <div slot="loading">
            <div class="spinner__container">
              <Spinner />
            </div>
          </div>
          <div slot="error">
            <div class="url-error">
              Pardonon, io misiris. <a
                href="javascript:void()"
                on:click={window.location.reload}>Reŝargi paĝon</a
              >
            </div>
          </div></Loadable
        >
      </Route>
      <Route path="/profiloj/:id/redakti" let:params>
        <LoadableContainer loggedIn={true} to={`/profiloj/${params.id}`}>
          <Loadable
            loader={() => import("./routes/EditProfile.svelte")}
            id={params.id}
          >
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/restarigi-pasvorton">
        <LoadableContainer loggedIn={true} to="ensaluti">
          <Loadable loader={() => import("./routes/PasswordEdit.svelte")}>
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/firmapanelo">
        <LoadableContainer loggedIn={true} to="/ensaluti">
          <Loadable loader={() => import("./routes/CompanyPanel.svelte")}>
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          ></LoadableContainer
        >
      </Route>
      <Route path="/firmaoj/:id" let:params>
        <Loadable
          loader={() => import("./routes/Company.svelte")}
          id={params.id}
        >
          <div slot="loading">
            <div class="spinner__container">
              <Spinner />
            </div>
          </div>
          <div slot="error">
            <div class="url-error">
              Pardonon, io misiris. <a
                href="javascript:void()"
                on:click={window.location.reload}>Reŝargi paĝon</a
              >
            </div>
          </div></Loadable
        >
      </Route>
      <Route path="/firmaoj/:id/redakti" let:params>
        <LoadableContainer loggedIn={true} to={`/firmaoj/${params.id}`}>
          <Loadable
            loader={() => import("./routes/EditCompany.svelte")}
            id={params.id}
          >
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/firmaoj">
        <Loadable loader={() => import("./routes/searchCompany.svelte")}>
          <div slot="loading">
            <div class="spinner__container">
              <Spinner />
            </div>
          </div>
          <div slot="error">
            <div class="url-error">
              Pardonon, io misiris. <a
                href="javascript:void()"
                on:click={window.location.reload}>Reŝargi paĝon</a
              >
            </div>
          </div></Loadable
        >
      </Route>
      <Route path="/ofertpanelo">
        <LoadableContainer loggedIn={true} to="/ensaluti">
          <Loadable loader={() => import("./routes/OfferPanel.svelte")}>
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/ofertkreilo" let:location>
        <LoadableContainer loggedIn={true} to="/ensaluti">
          <Loadable
            loader={() => import("./routes/CreateOffer.svelte")}
            {location}
          >
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/ofertoj/:id/redakti" let:params>
        <LoadableContainer loggedIn={true} to={`/ofertoj/${params.id}`}>
          <Loadable
            loader={() => import("./routes/EditOffer.svelte")}
            id={params.id}
          >
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/ofertoj/:id" let:params>
        <Loadable loader={() => import("./routes/Offer.svelte")} id={params.id}>
          <div slot="loading">
            <div class="spinner__container">
              <Spinner />
            </div>
          </div>
          <div slot="error">
            <div class="url-error">
              Pardonon, io misiris. <a
                href="javascript:void()"
                on:click={window.location.reload}>Reŝargi paĝon</a
              >
            </div>
          </div></Loadable
        >
      </Route>
      <Route path="/ofertoj">
        <Loadable loader={() => import("./routes/searchOffer.svelte")}>
          <div slot="loading">
            <div class="spinner__container">
              <Spinner />
            </div>
          </div>
          <div slot="error">
            <div class="url-error">
              Pardonon, io misiris. <a
                href="javascript:void()"
                on:click={window.location.reload}>Reŝargi paĝon</a
              >
            </div>
          </div></Loadable
        >
      </Route>
      <Route path="/peti-konfirmigxjxetonon">
        <LoadableContainer loggedIn={false} to={`/profiloj/${$user?.ID}`}>
          <Loadable loader={() => import("./routes/AskTokenResend.svelte")}>
            <div slot="loading">
              <div class="spinner__container">
                <Spinner />
              </div>
            </div>
            <div slot="error">
              <div class="url-error">
                Pardonon, io misiris. <a
                  href="javascript:void()"
                  on:click={window.location.reload}>Reŝargi paĝon</a
                >
              </div>
            </div></Loadable
          >
        </LoadableContainer>
      </Route>
      <Route path="/">
        <Loadable loader={() => import("./routes/Home.svelte")}>
          <div slot="loading">
            <div class="spinner__container">
              <Spinner />
            </div>
          </div>
          <div slot="error">
            <div class="url-error">
              Pardonon, io misiris. <a
                href="javascript:void()"
                on:click={window.location.reload}>Reŝargi paĝon</a
              >
            </div>
          </div></Loadable
        >
      </Route>
      <Route>
        <Loadable loader={() => import("./routes/404.svelte")}>
          <div slot="loading">
            <div class="spinner__container">
              <Spinner />
            </div>
          </div>
          <div slot="error">
            <div class="url-error">
              Pardonon, io misiris. <a
                href="javascript:void()"
                on:click={window.location.reload}>Reŝargi paĝon</a
              >
            </div>
          </div></Loadable
        ></Route
      >
    </main>
  {:catch err}
    <div class="url-error">
      <b>Eraro {err.response.status}</b>: {err.response.data.error}
    </div>
  {/await}
</Router>
<footer>
  Kreaĵo de&nbsp;<a href="https://canicjusz.github.io/">Jano Michalak</a>
</footer>

<style lang="sass" global>
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans&family=Raleway:wght@500;700&display=swap')
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
  $bordowy: #bf1134
  .eye
    right: 5px
    height: 42px
    position: absolute

  html
    scroll-behavior: smooth

  html,
  body
    margin: 0
    padding: 0
    height: 100%
  main
    position: relative
    background: $szary
    padding-top: 50px
    min-height: calc(100vh - 100px)
  footer
    box-sizing: border-box
    border-top: 1px solid $szarszy
    background: $bialy
    height: 50px
    color: $czarny
    justify-content: center
    text-align: center
    align-items: center
    display: flex
    font-family: "Open Sans", sans-serif

  a
    color: $niebieski-link

  svg
    fill: currentColor

  input[type="checkbox"]
    margin: 0
    width: 1rem
    height: 1rem

  .multiSelect
    padding: 0 !important

  .multiSelectItem
    width: 190px !important
    justify-content: space-between

  .button__container
    display: flex
    justify-content: center

  input:not([type="checkbox"])
    height: 42px
    padding: 5px 0
    margin: 0

  .select-container
    font-size: 1.2rem
    font-family: 'Raleway', sans-serif
    max-width: 250px
    width: 100%
    --padding: 5px 0
    --inputColor: black
    --background: transparent
    --border: none
    --padding: 0
    --inputFontSize: 1.2rem
    --clearSelectRight: 0
    
    input
      border: none !important
      border-bottom: 2px solid $szarszy !important
      transition: 0.3s border-color

      &:focus-visible
        border-color: $niebieski-link !important

.alert
  min-width: 200px
  left: 50%
  transform: translate(-50%, 0)
  background: $crimson
  border-radius: 10px
  border: 1px solid #a30f2c
  padding: 10px
  position: fixed
  opacity: 0
  z-index: 3
  transition: 0.5s opacity, 0.5s transform
  color: white
  font-family: "Open Sans", sans-serif
  font-size: 1.2rem

  &--on
    transform: translate(-50%, 60px)
    opacity: 1

  &--error
    background: $crimson
    border: 1px solid #a30f2c

  &--feedback
    background: $zielony
    border: 1px solid $ciemny-zielony

input[type="checkbox"]
  margin: 0
  padding: 0
  box-sizing: border-box
  height: 1rem
  width: 1rem

a 
  font-family: 'Open-Sans', sans-serif

.button
  min-width: 200px
  margin: 0
  text-decoration: none
  display: inline-flex
  justify-content: center
  text-align: center
  align-items: center
  font-family: "Open Sans", sans-serif
  box-sizing: border-box
  transition: 0.3s background, 0.3s border-color
  cursor: pointer
  height: 50px
  width: 100%
  color: $bialy
  font-size: 20px

  &:disabled
    background: $szarszy
    color: $najszarszy
    border: 2px solid $szarszy
    cursor: not-allowed

    &:hover
      background: $szarszy
      color: $najszarszy
      border: 2px solid $szarszy

  &-container
    margin-top: 10px
    text-align: center

  &--round
    border-radius: 30px

  &--blue
    background: $niebieski-link
    border: 2px solid $niebieski-link

    &:hover
      border-color: $navy
      background: $navy

  &--green
    background: $zielony
    border: 2px solid $zielony

    &:hover
      border-color: $ciemny-zielony
      background: $ciemny-zielony

  &--red
    background: $crimson
    border: 2px solid $crimson

    &:hover
      background: $bordowy
      border: 2px solid $bordowy

input:not(input[type="checkbox"])
  width: 100%
  line-height: 42px
  border: none
  background: transparent
  border-bottom: 2px solid $szarszy
  max-width: 250px
  overflow: visible
  font-size: 1.2rem !important
  height: 42px
  box-sizing: border-box
  font-family: 'Raleway', sans-serif
  outline: none
  transition: 0.3s border-color

  &:focus
    border-color: $niebieski-link

.spinner__container, .nothing__container, .url-error  
  font-size: 1.2rem
  font-family: "Open-Sans", sans-serif
  text-align: center
  padding-top: 20px

.url-error
  color: $crimson

.error
  margin-top: 5px
  font-family: 'Open-Sans', sans-serif
  color: $crimson

label
  font-family: 'Open-Sans', sans-serif

.mv-icon
  background-image: url("/mv-icon.png")
  background-size: contain
  height: 24px
  width: 24px
  background-position: center

img
  max-width: 100%

object
  font-family: "Open-Sans", sans-serif

input[type="checkbox"]
  flex-shrink: 0

*
  overflow-wrap: anywhere

@media (max-width: 1000px)
  .profile, .offer, .company
    input:not(input[type="checkbox"])
      max-width: 100%

@media (max-width: 600px)
  .container-of-containers
    input:not(input[type="checkbox"]), .select-container
      max-width: 100%

</style>
