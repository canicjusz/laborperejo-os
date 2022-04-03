<script>
  import axios from "axios";
  import { navigate } from "svelte-routing";
  import countries from "../../../countries";
  import categories from "../../../categories";
  import { user, error } from "../stores";
  import Select from "svelte-select";
  import Editor from "../components/Editor.svelte";
  const workArrangements = ["hejme", "laboreje", "hibride"];
  const employmentTypes = ["plentempa", "parttempa", "aldona"];
  import { extractErrors } from "../shared";
  import Spinner from "../components/Spinner.svelte";
  import * as yup from "yup";
  import { deepEqual } from "fast-equals";
  import { klona } from "klona/lite";

  export let id;

  let toEdit = {};
  let original = {};

  //format to YYYY-MM-DD
  const format = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormated = format(tomorrow);

  const schema = yup.object({
    title: yup
      .string()
      .required("Bonvolu entajpi titolon de la oferto.")
      .max(50, "Titolo ne povas havi pli ol 50 signojn."),
    description: yup
      .string()
      .required("Bonvolu entajpi priskribon de la oferto.")
      .max(8192, "Priskribo ne povas havi pli ol 8192 signojn."),
    salary: yup.boolean().required(),
    reward: yup
      .string()
      .required("Bonvolu entajpi rekompenson/salajron.")
      .max(70, "Rekompenso ne povas havi pli ol 70 signojn."),
    arrangement: yup
      .mixed()
      .oneOf(workArrangements, "Bonvolu elekti manieron de laborado.")
      .required("Bonvolu elekti manieron de laborado."),
    employment: yup
      .mixed()
      .oneOf(employmentTypes, "Bonvolu elekti tipon de dungeco.")
      .required("Bonvolu elekti tipon de dungeco."),
    country: yup
      .mixed()
      .oneOf(
        countries,
        "Bonvolu elekti landon de la firmao aŭ branĉo de la firmao."
      )
      .required("Bonvolu elekti landon de la firmao aŭ branĉo de la firmao."),
    place: yup
      .string()
      .required("Bonvolu entajpi adreson de la firmao aŭ branĉo de la firmao.")
      .max(100, "Adreso ne povas havi pli ol 100 singojn."),
    categories: yup
      .array()
      .of(
        yup.mixed().oneOf(categories),
        "Bonvolu elekti kategoriojn laŭ kiuj oni povos trovi la oferton."
      )
      .min(1, "Oferto devas havi almenaŭ unu kategorion.")
      .max(3, "Oferto devas havi ĝis tri kategoriojn.")
      .required(
        "Bonvolu elekti kategoriojn laŭ kiuj oni povos trovi la oferton."
      ),
    closed: yup.boolean().required(),
    close_at: yup
      .date("Malfermitaj ofertoj devas havi specifitan fermiĝdaton.")
      .min(tomorrow, "Oferto estu malfermita almenaŭ unu tagon")
      .when("closed", {
        is: true,
        then: (schema) => schema.nullable(),
        otherwise: (schema) =>
          schema.required(
            "Malfermitaj ofertoj devas havi specifitan fermiĝdaton."
          ),
      }),
  });
  let errors = {};
  let companyGlobal = {};
  let date;

  const checkForm = () => {
    errors = {};
    schema
      .validate(toEdit, { abortEarly: false })
      .then(sendChanges)
      .catch((err) => (errors = extractErrors(err)));
  };

  const getOffer = axios.get(`/api/offers/${id}`).then((res) => {
    const { company_ID, company, isOwner, close_at, ID, ...futureToEdit } =
      res.data;
    if (!isOwner) {
      navigate("/ofertoj/" + ID);
    }
    // mozna to latwiutko arrayem zrobic
    futureToEdit.close_at = close_at
      ? format(new Date(close_at))
      : tomorrowFormated;
    original = klona(futureToEdit);
    date = futureToEdit.close_at;
    toEdit = futureToEdit;
    companyGlobal = company;
    visibleCategories = [...futureToEdit.categories];
  });
  const sendChanges = () => {
    toEdit.close_at = new Date(toEdit.close_at);
    toEdit.offerID = id;
    axios.put(`/api/offers/${id}`, toEdit).then(goToOffer).catch(error.change);
  };

  const goToOffer = () => navigate("/ofertoj/" + id);

  //reload on id change
  $: changed = !deepEqual(toEdit, original);
  let visibleCategories = undefined;
</script>

<svelte:head>
  <title>Redakti oferton | Laborperejo</title>
  <meta name="description" content="Paĝo por redakti oferton ĉe laborperejo." />
</svelte:head>
{#await getOffer}
  <div class="spinner__container">
    <Spinner />
  </div>
{:then}
  <div class="offer__container">
    <div class="offer">
      <div class="offer__left">
        <div class="offer__left-top">
          <div class="offer__company-logo-container">
            <img src={companyGlobal.logo} alt="" class="offer__company-logo" />
          </div>
          <div class="offer__left-top-text">
            <label for="" class="offer__name">
              <input
                type="text"
                bind:value={toEdit.title}
                placeholder="Titolo"
              />
            </label>
            {#if errors.title}<div class="error">{errors.title}</div>{/if}
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
              {companyGlobal.name}
            </span>
            <span class="offer__country">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M5 16v6H3V3h9.382a1 1 0 0 1 .894.553L14 5h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6.382a1 1 0 0 1-.894-.553L12 16H5zM5 5v9h8.236l1 2H19V7h-6.236l-1-2H5z"
                /></svg
              >
              <div class="select-container">
                <Select
                  items={countries}
                  value={toEdit.country}
                  on:select={(e) => (toEdit.country = e.detail.value)}
                  on:clear={(e) => (toEdit.country = undefined)}
                  placeholder="Elekti landon"
                  noOptionsMessage="Mankas opcioj"
                />
              </div>
            </span>
            {#if errors.country}<div class="error">{errors.country}</div>{/if}
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
              <input
                type="text"
                bind:value={toEdit.place}
                placeholder="Adreso"
              />
            </span>
            {#if errors.place}<div class="error">{errors.place}</div>{/if}
          </div>
        </div>
        <div class="offer__left-bottom">
          <Editor
            bind:value={toEdit.description}
            placeholder="Priskribo de la oferto"
          />
          {#if errors.description}<div class="error">
              {errors.description}
            </div>{/if}
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
          <div class="select-container">
            <Select
              value={toEdit.employment}
              items={employmentTypes}
              on:select={(e) => (toEdit.employment = e.detail.value)}
              on:clear={(e) => (toEdit.employment = undefined)}
              placeholder="Tipo de dungeco"
              noOptionsMessage="Mankas opcioj"
            />
          </div>
        </div>
        {#if errors.employment}<div class="error">{errors.employment}</div>{/if}
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
          <div class="select-container">
            <Select
              value={toEdit.arrangement}
              items={workArrangements}
              on:select={(e) => (toEdit.arrangement = e.detail.value)}
              on:clear={(e) => (toEdit.arrangement = undefined)}
              placeholder="Maniero de laborado"
              noOptionsMessage="Mankas opcioj"
            />
          </div>
        </div>
        {#if errors.arrangement}<div class="error">
            {errors.arrangement}
          </div>{/if}
        <div class="offer__category">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            ><path fill="none" d="M0 0h24v24H0z" /><path
              d="M7.784 14l.42-4H4V8h4.415l.525-5h2.011l-.525 5h3.989l.525-5h2.011l-.525 5H20v2h-3.784l-.42 4H20v2h-4.415l-.525 5h-2.011l.525-5H9.585l-.525 5H7.049l.525-5H4v-2h3.784zm2.011 0h3.99l.42-4h-3.99l-.42 4z"
            /></svg
          >
          <div class="select-container">
            <Select
              items={categories}
              bind:value={visibleCategories}
              on:select={(e) => {
                errors.categories = null;
                if (e.detail == undefined || e.detail.length < 4) {
                  toEdit.categories = e.detail?.map(({ value }) => value);
                } else {
                  errors.categories = "Oni povas elekti nur 3 kategoriojn";
                  visibleCategories.pop();
                }
              }}
              placeholder="Kategorioj"
              noOptionsMessage="Mankas opcioj"
              isMulti={true}
            />
          </div>
        </div>
        {#if errors.categories}
          <div class="error">{errors.categories}</div>
        {/if}
        <div class="offer__reward">
          <div>
            Ĉu oni ricevos salajron?
            <input type="checkbox" name="" id="" bind:checked={toEdit.salary} />
          </div>
          <div>
            {#if toEdit.salary}<svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M23 12v2c0 3.314-4.925 6-11 6-5.967 0-10.824-2.591-10.995-5.823L1 14v-2c0 3.314 4.925 6 11 6s11-2.686 11-6zM12 4c6.075 0 11 2.686 11 6s-4.925 6-11 6-11-2.686-11-6 4.925-6 11-6z"
                /></svg
              >{:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 9h2v4h2V9h2l-3-3.5L7 9zm10 6h-2v-4h-2v4h-2l3 3.5 3-3.5z"
                /></svg
              >
            {/if}
            <input
              type="text"
              placeholder={toEdit.salary ? "Salajro" : "Rekompenco"}
              bind:value={toEdit.reward}
            />
          </div>
        </div>
        {#if errors.reward}<div class="error">{errors.reward}</div>{/if}
        <div class="offer__close">
          <div>
            Ĉu la oferto estu fermita?
            <input type="checkbox" name="" id="" bind:checked={toEdit.closed} />
          </div>
          <div>
            {#if !toEdit.closed}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M22 14h-2V7.238l-7.928 7.1L4 7.216V19h11v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v10zM4.511 5l7.55 6.662L19.502 5H4.511zm16.903 14l2.122 2.121-1.415 1.415L20 20.414l-2.121 2.122-1.415-1.415L18.586 19l-2.122-2.121 1.415-1.415L20 17.586l2.121-2.122 1.415 1.415L21.414 19z"
                /></svg
              >
              <input
                type="date"
                name=""
                id=""
                class="offer__date"
                placeholder="Fermiĝdato"
                bind:value={date}
                on:change={(e) => (toEdit.close_at = new Date(e.target.value))}
                min={tomorrowFormated}
                required
              />
            {/if}
          </div>
        </div>
        {#if errors.close_at}<div class="error">{errors.close_at}</div>{/if}
        <div class="button__container">
          <button
            on:click={goToOffer}
            disabled={!changed}
            class="button button--red button--round">Nuligi ŝanĝoj</button
          >
        </div>
        <div class="button__container">
          <button
            on:click={checkForm}
            disabled={!changed}
            class="button button--green button--round">Akcepti ŝanĝojn</button
          >
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

  .select-container
    width: 250px

  .spinner__container
    text-align: center
    padding-top: 20px

  .offer
    position: relative
    display: grid
    column-gap: 20px
    grid-template-columns: 642px 287px

    &__date
      color: #ffffff

      &::before 
        content: attr(placeholder)
        position: absolute
        color: #999999
      
      &:focus,
      &:valid 
        color: #666666

        &::before
          content: ""
      
    &__reward, &__close
      display: flex
      flex-direction: column
      row-gap: 5px

      div
        font-family: "Open Sans", sans-serif
        display: flex
        column-gap: 10px
        align-items: center
        text-decoration: none
        font-size: 1.2rem 

    &__company

      &-logo
        width: 200px
        height: 200px
        border-radius: 50%

        &-container
          text-align: center

    &__container
      display: flex
      justify-content: center
      padding: 10px 0

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
        margin-bottom: 10px
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
      flex-direction: column
      row-gap: 10px
      font-family: "Open sans", sans-serif
      font-size: 1rem
      height: max-content

    &__name
      font-size: 2rem
      font-family: 'Raleway', sans-serif

    &__place, &__country, &__company-name, &__employment, &__arrangement, &__category
      font-family: "Open Sans", sans-serif
      display: flex
      column-gap: 10px
      align-items: center
      text-decoration: none
      font-size: 1.2rem 
      
.spinner__container
  text-align: center
  padding-top: 20px

@media (max-width: 1000px)
  .offer
    grid-template-columns: minmax(100%, 642px)
    margin: 0 20px
    row-gap: 20px

  .select-container
    width: 100%
    max-width: 100%

@media (max-width: 700px)

  .offer

    &__name
      text-align: center

    &__left-top
      grid-template-columns: auto

      &-text
        margin: 0
      
    &__avatar
      text-align: center

      &-container
        text-align: center
</style>
