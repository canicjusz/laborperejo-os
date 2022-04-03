<script>
  import axios from "axios";
  import { user, error } from "../stores";
  import { navigate } from "svelte-routing";
  import { extractErrors } from "../shared";
  import Editor from "../components/Editor.svelte";
  import countries from "../../../countries";
  import * as yup from "yup";
  import Select from "svelte-select";
  import { deepEqual } from "fast-equals";
  import { klona } from "klona/json";

  export let id;

  let levels = ["baznivele", "meznivele", "altnivele", "flue", "denaske"];

  const schema = yup.object({
    content: yup
      .string()
      .required("Bonvolu entajpi priskribon de la profilo.")
      .max(8192, "Priskribo ne povas havi pli ol 8192 signojn."),
    phone: yup
      .string()
      .transform((string) => (string == null ? null : string))
      .matches(
        /^\+(?:[0-9] ?){6,14}[0-9]$/,
        "La numero ne validas. Memoru pri telefona landokodo, por klareco vi povas dividi la numeron per spacetoj."
      )
      .transform((string) => (string == null ? null : string))
      .nullable(),
    email: yup
      .string()
      .email("Ĉi tio ne estas valida retpoŝtadreso.")
      .required(
        "Bonvolu entajpi retpoŝtadreson, kiun uzu rekrutistoj por kontakti vin."
      )
      .max(320, "Retpoŝtadreso ne povas havi pli ol 320 signojn."),
    fb: yup
      .string()
      .transform((string) => (string == null ? null : string))
      .url("La ligilo ne estas valida.")
      .matches(
        /^(?:(?:http|https):\/\/)?(?:www.)?facebook.com.*/,
        "La ligilo ne navigu al retejo facebook.com."
      )
      .max(500, "Ligilo ne povas havi pli ol 500 signojn.")
      .nullable(),
    vk: yup
      .string()
      .transform((string) => (string == null ? null : string))
      .url("La ligilo ne estas valida.")
      .matches(
        /^(?:(?:http|https):\/\/)?(?:www.)?vk.com.*/,
        "La ligilo ne navigu al retejo vk.com."
      )
      .max(500, "Ligilo ne povas havi pli ol 500 signojn.")
      .nullable(),
    mv: yup
      .string()
      .transform((string) => (string == "" ? null : string))
      .url("La ligilo ne estas valida.")
      .matches(
        /^(?:(?:http|https):\/\/)?(?:www.)?miavivo.net.*/,
        "Ligilo navigu al retejo miavivo.net."
      )
      .max(500, "Ligilo ne povas havi pli ol 500 signojn.")
      .nullable(),
    searching: yup.boolean().required(),
    job: yup
      .string()
      .max(100, "Posteno ne povas havi pli ol 100 signojn")
      .when("searching", {
        is: true,
        then: (schema) =>
          schema.required("Bonvolu entajpi laborpostenon, kiun vi serĉas."),
        otherwise: (schema) => schema.nullable(),
      }),
    avatar: yup.string().required(),
    place: yup
      .string()
      .required(
        "Bonvolu entajpi vian loĝlokon (ekz. nomo de via urbo, vilaĝo aŭ muncipo)."
      )
      .max(100, "Loĝloko ne povas havi pli ol 100 signojn."),
    country: yup
      .mixed()
      .oneOf(countries, "Bonvolu elekti landon.")
      .required("Bonvolu elekti landon."),
    resume: yup.string().nullable(),
    languages: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required("Bonvolu aldoni nomon"),
          level: yup
            .string()
            .oneOf(levels, "Bonvolu elekti nivelon")
            .required("Bonvolu elekti nivelon"),
        })
      )
      .min(1, "Aldonu almenaŭ unu lingvon")
      .max(50, "Oni ne povas aldoni pli ol 50 lingvojn"),
    li: yup
      .string()
      .transform((string) => (string == "" ? null : string))
      .url("La ligilo ne estas valida.")
      .matches(
        /^(?:(?:http|https):\/\/)?(?:www.)?linkedin.com.*/,
        "Ligilo navigu al retejo linkedin.com."
      )
      .max(500, "Ligilo ne povas havi pli ol 500 signojn.")
      .nullable(),
      website: yup
      .string()
      .transform((string) => (string == "" ? null : string))
      .url("La ligilo ne estas valida.")
      .max(500, "Ligilo ne povas havi pli ol 500 signojn.")
      .nullable(),
  });

  let errors = {};

  const checkForm = () => {
    errors = {};
    schema
      .validate(toEdit, { abortEarly: false })
      .then(sendChanges)
      .catch((err) => (errors = extractErrors(err)));
  };

  const toEdit = klona($user.profile);

  const beforeUnload = (e) => {
    if (changed) {
      const confirmationMessage =
        "Ŝajnas, ke vi ne konservis ŝanĝojn. Se vi foriros la retpaĝon antaŭ konservado, ĉiuj ŝanĝoj nuliĝos.";
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    }
  };

  const addLanguage = () => {
    toEdit.languages = [...toEdit.languages, { name: "", level: undefined }];
  };

  const removeLanguage = (i) => {
    toEdit.languages.splice(i, 1);
    toEdit.languages = toEdit.languages;
    delete errors[`languages[${i}].level`];
    delete errors[`languages[${i}].name`];
  };

  let newImg;
  let newResume;

  const goToProfile = () => navigate(`/profiloj/${id}`);

  const updateLocalUser = (values) => {
    $user.profile = values;
    goToProfile();
  };

  const sendChanges = (values) => {
    const data = new FormData();
    data.append("json", JSON.stringify(values));
    if (newImg) {
      data.append("avatar", newImg);
      values.avatar = avatarSrc;
    }
    if (newResume) {
      data.append("resume", newResume);
      values.resume = resumeSrc;
    }
    axios
      .put("/api/users/mine", data)
      .then(() => updateLocalUser(values))
      .catch(error.change);
  };

  const showImage = (changeEvent) => {
    const element = changeEvent.target;
    if (element.files) {
      const file = element.files[0];
      if (file.type.startsWith("image/")) {
        URL.revokeObjectURL(avatarSrc);
        newImg = file;
      } else {
        error.change({
          response: {
            status: "",
            data: {
              error: "Nur bildoj kaj GIF-movbildoj alŝuteblas.",
            },
          },
        });
      }
    }
  };

  const setResume = (changeEvent) => {
    const element = changeEvent.target;
    if (element.files) {
      const file = element.files[0];
      if (file.type === "application/pdf") {
        URL.revokeObjectURL(resumeSrc);
        newResume = file;
      } else {
        error.change({
          response: {
            status: "",
            data: {
              error: "Nur dosieroj kun etendaĵo .pdf alŝuteblas.",
            },
          },
        });
      }
    }
  };

  $: avatarSrc = newImg ? URL.createObjectURL(newImg) : toEdit?.avatar;
  $: resumeSrc = newResume ? URL.createObjectURL(newResume) : toEdit?.resume;
  $: changed = !deepEqual(toEdit, $user?.profile) || newImg || newResume;
</script>

<svelte:window on:beforeunload|preventDefault={beforeUnload} />
<svelte:head>
  <title>Redakti profilon | Laborperejo</title>
  <meta
    name="description"
    content="Paĝo por redakti profilon ĉe laborperejo."
  />
</svelte:head>
{#if $user}
  <div class="profile__container">
    <div class="profile">
      <div class="profile__left">
        <div class="profile__left-top">
          <div style="display: flex; justify-content: center">
            <div class="avatar__container">
              <input
                class="file-input"
                type="file"
                id="avatar"
                name="avatar"
                on:change={showImage}
                accept="image/png, image/jpeg, image/gif"
              />
              <label for="avatar" class="avatar__label"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  ><path fill="none" d="M0 0h24v24H0z" /><path
                    d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"
                  /></svg
                ></label
              >
              <img src={avatarSrc} alt="" class="avatar__image" />
            </div>
          </div>
          <div class="profile__left-top-text">
            <span class="profile__name">
              {$user.name}
            </span>
            <div>
              <span class="profile__country">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  ><path fill="none" d="M0 0h24v24H0z" /><path
                    d="M3 3h9.382a1 1 0 0 1 .894.553L14 5h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6.382a1 1 0 0 1-.894-.553L12 16H5v6H3V3z"
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
            </div>
            <span class="profile__place"
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
                placeholder="Loĝloko"
              />
            </span>
          </div>
        </div>
        <div class="profile__left-bottom">
          <Editor bind:value={toEdit.content} placeholder="Priskribo de vi" />
          {#if errors.content}<div class="error">{errors.content}</div>{/if}
        </div>
        <div class="profile__resume">
          <span class="profile__resume-text">
            Vivresumo:
            <label for="resume" class="resume__label"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                ><path fill="none" d="M0 0h24v24H0z" /><path
                  d="M15 4H5v16h14V8h-4V4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008V2.992zM11 11V8h2v3h3v2h-3v3h-2v-3H8v-2h3z"
                /></svg
              ></label
            >
          </span>
        </div>
        <input
          id="resume"
          type="file"
          accept="application/pdf"
          on:change={setResume}
          class="file-input"
        />
        {#if resumeSrc}
          <object
            data={resumeSrc}
            type="application/pdf"
            title="vivresumo"
            class="resume"
          >
            Pardonon, ni ne povis montri la dosieron ĉi tie. Ne maltrankviliĝu,
            la vivresumo estos videbla ĉe <a
              href={"/profiloj/" + id}
              target="_blank">paĝo de via profilo</a
            >.
          </object>
        {/if}
      </div>
      <div class="profile__right">
        <div class="profile__status">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            ><path fill="none" d="M0 0h24v24H0z" /><path
              d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z"
            /></svg
          >Serĉanta laboron:
          <input
            type="checkbox"
            name=""
            id=""
            bind:checked={toEdit.searching}
          />
        </div>
        <div class="profile__job">
          <span class="profile__job-text">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              ><path fill="none" d="M0 0h24v24H0z" /><path
                d="M7 5V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4zM4 16v3h16v-3H4zm0-2h16V7H4v7zM9 3v2h6V3H9zm2 8h2v2h-2v-2z"
              /></svg
            >
            {toEdit.searching
              ? "Kiun laborpostenon vi serĉas?"
              : "Kio estas via laborposteno?"}
          </span>
          <input
            type="text"
            bind:value={toEdit.job}
            placeholder="Laborposteno"
          />
          {#if errors.job}<div class="error">{errors.job}</div>{/if}
        </div>
        <div class="profile__languages">
          <span class="profile__languages-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              ><path fill="none" d="M0 0h24v24H0z" /><path
                d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.29-2.333A17.9 17.9 0 0 1 8.027 13H4.062a8.008 8.008 0 0 0 5.648 6.667zM10.03 13c.151 2.439.848 4.73 1.97 6.752A15.905 15.905 0 0 0 13.97 13h-3.94zm9.908 0h-3.965a17.9 17.9 0 0 1-1.683 6.667A8.008 8.008 0 0 0 19.938 13zM4.062 11h3.965A17.9 17.9 0 0 1 9.71 4.333 8.008 8.008 0 0 0 4.062 11zm5.969 0h3.938A15.905 15.905 0 0 0 12 4.248 15.905 15.905 0 0 0 10.03 11zm4.259-6.667A17.9 17.9 0 0 1 15.973 11h3.965a8.008 8.008 0 0 0-5.648-6.667z"
              /></svg
            >
            Lingvokapabloj:</span
          >
          <div>
            <div>
              {#each toEdit.languages as language, i}
                <div class="languages">
                  <input
                    type="text"
                    bind:value={language.name}
                    placeholder="Lingvo"
                  />
                  <div class="select-container">
                    <Select
                      items={levels}
                      value={language.level}
                      placeholder="Elekti nivelon"
                      noOptionsMessage="Mankas opcioj"
                      on:select={(e) => (language.level = e.detail.value)}
                      on:clear={(e) => (language.level = undefined)}
                    />
                  </div>
                  <button
                    on:click={() => removeLanguage(i)}
                    class="language-remove"
                  >
                    <svg
                      viewBox="-2 -2 50 50"
                      focusable="false"
                      aria-hidden="true"
                      role="presentation"
                      ><path
                        fill="currentColor"
                        d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124
                  l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"
                      /></svg
                    >
                  </button>
                  <div class="error">
                    {#if errors[`languages[${i}].name`]}{errors[
                        `languages[${i}].name`
                      ]}{/if}
                  </div>
                  <div class="error">
                    {#if errors[`languages[${i}].level`]}{errors[
                        `languages[${i}].level`
                      ]}{/if}
                  </div>
                </div>
              {/each}
              <div class="error">
                {#if errors.languages}{errors.languages}{/if}
              </div>
            </div>
            <!-- <div class="button__container"> -->
            <button
              on:click={addLanguage}
              type="button"
              class="button button--blue">Aldoni novan lingvon</button
            >
            <!-- </div> -->
          </div>
        </div>
        <ul class="profile__contact">
          <li class="profile__contact-element">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              ><path fill="none" d="M0 0h24v24H0z" /><path
                d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z"
              /></svg
            >
            <input
              type="email"
              bind:value={toEdit.email}
              placeholder="Retpoŝtadreso sur via profilo"
            />
          </li>
          <div class="error">
            {#if errors.email}{errors.email}{/if}
          </div>
          <li class="profile__contact-element">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              ><path fill="none" d="M0 0h24v24H0z" /><path
                d="M21 16.42v3.536a1 1 0 0 1-.93.998c-.437.03-.794.046-1.07.046-8.837 0-16-7.163-16-16 0-.276.015-.633.046-1.07A1 1 0 0 1 4.044 3H7.58a.5.5 0 0 1 .498.45c.023.23.044.413.064.552A13.901 13.901 0 0 0 9.35 8.003c.095.2.033.439-.147.567l-2.158 1.542a13.047 13.047 0 0 0 6.844 6.844l1.54-2.154a.462.462 0 0 1 .573-.149 13.901 13.901 0 0 0 4 1.205c.139.02.322.042.55.064a.5.5 0 0 1 .449.498z"
              /></svg
            >
            <input
              type="tel"
              bind:value={toEdit.phone}
              placeholder="+48 123 456 789"
            />
          </li>
          <div class="error">
            {#if errors.phone}{errors.phone}{/if}
          </div>
          <li class="profile__contact-element">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              ><path fill="none" d="M0 0h24v24H0z" /><path
                d="M18.335 18.339H15.67v-4.177c0-.996-.02-2.278-1.39-2.278-1.389 0-1.601 1.084-1.601 2.205v4.25h-2.666V9.75h2.56v1.17h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.2 1.778 3.2 4.091v4.715zM7.003 8.575a1.546 1.546 0 0 1-1.548-1.549 1.548 1.548 0 1 1 1.547 1.549zm1.336 9.764H5.666V9.75H8.34v8.589zM19.67 3H4.329C3.593 3 3 3.58 3 4.297v15.406C3 20.42 3.594 21 4.328 21h15.338C20.4 21 21 20.42 21 19.703V4.297C21 3.58 20.4 3 19.666 3h.003z"
              /></svg
            >
            <input
              type="url"
              bind:value={toEdit.li}
              placeholder="https://www.linkedin.com"
            />
          </li>
          <div class="error">
            {#if errors.li}{errors.li}{/if}
          </div>
          <li class="profile__contact-element">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              ><path fill="none" d="M0 0h24v24H0z" /><path
                d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
              /></svg
            >
            <input
              type="url"
              bind:value={toEdit.fb}
              placeholder="http://www.facebook.com"
            />
          </li>
          <div class="error">
            {#if errors.fb}{errors.fb}{/if}
          </div>
          <li class="profile__contact-element">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                class="st0"
                d="M13.162 18.994c.609 0 .858-.406.851-.915-.031-1.917.714-2.949 2.059-1.604 1.488 1.488 1.796 2.519 3.603 2.519h3.2c.808 0 1.126-.26 1.126-.668 0-.863-1.421-2.386-2.625-3.504-1.686-1.565-1.765-1.602-.313-3.486 1.801-2.339 4.157-5.336 2.073-5.336h-3.981c-.772 0-.828.435-1.103 1.083-.995 2.347-2.886 5.387-3.604 4.922-.751-.485-.407-2.406-.35-5.261.015-.754.011-1.271-1.141-1.539-.629-.145-1.241-.205-1.809-.205-2.273 0-3.841.953-2.95 1.119 1.571.293 1.42 3.692 1.054 5.16-.638 2.556-3.036-2.024-4.035-4.305-.241-.548-.315-.974-1.175-.974h-3.255c-.492 0-.787.16-.787.516 0 .602 2.96 6.72 5.786 9.77 2.756 2.975 5.48 2.708 7.376 2.708z"
              /></svg
            >
            <input
              type="url"
              bind:value={toEdit.vk}
              placeholder="http://www.vk.com"
            />
          </li>
          <div class="error">
            {#if errors.vk}{errors.vk}{/if}
          </div>
          <li class="profile__contact-element">
            <i class="mv-icon" />
            <input
              type="url"
              bind:value={toEdit.mv}
              placeholder="http://www.miavivo.net"
            />
          </li>
          <div class="error">
            {#if errors.mv}{errors.mv}{/if}
          </div>
          <li class="profile__contact-element">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              ><path fill="none" d="M0 0h24v24H0z" /><path
                d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z"
              /></svg
            >
            <input
              type="url"
              bind:value={toEdit.website}
              placeholder="https://www.via-pagxaro.com"
            />
          </li>
          <div class="error">
            {#if errors.website}{errors.website}{/if}
          </div>
        </ul>
        <!-- <div class="button__container"> -->
        <button
          on:click={goToProfile}
          disabled={!changed}
          class="button button--red button--round">Nuligi ŝanĝoj</button
        >
        <!-- </div> -->
        <!-- <div class="button__container"> -->
        <button
          on:click={checkForm}
          disabled={!changed}
          class="button button--green button--round">Akcepti ŝanĝojn</button
        >
        <!-- </div> -->
      </div>
    </div>
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
  .file-input
    display: none

  .avatar
    &__image
      object-fit: cover
      width: 100%
      height: 100%

    &__container
      overflow: hidden
      position: relative 
      height: 200px
      width: 200px
      clip-path: circle(50% at 50% 50%)

    &__label
      cursor: pointer
      display: flex
      justify-content: center
      bottom: 0
      left: 0
      width: 100%
      height: 30px
      align-items: center
      background: $czarny
      opacity: 0.9
      color: white
      position: absolute
      transition: color 0.3s

      svg
        fill: currentColor

      &:hover
        color: $niebieski-link

  .profile
    display: grid
    column-gap: 20px
    grid-template-columns: 642px 287px

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
      display: flex
      flex-direction: column
      row-gap: 10px
      font-family: "Open sans", sans-serif
      font-size: 1rem
      height: max-content

    &__contact
      margin: 0
      padding: 0
      
      &-element
        margin: 10px 0 0 0
        display: flex
        align-items: center
        column-gap: 10px

      &-element:first-child
        margin: 0

    &__resume
      font-family: "Open Sans", sans-serif
      margin: 10px 0

      &-text
        margin-bottom: 5px
        display: flex
        align-items: flex-end
        column-gap: 10px

    &__status
      display: flex
      column-gap: 10px
      align-items: center
      // border-bottom: 1px solid $szarszy
      input
        width: 1rem
        height: 1rem

    &__name
      font-size: 2rem
      font-family: 'Raleway', sans-serif

    &__place, &__country
      font-family: "Open Sans", sans-serif
      display: flex
      column-gap: 10px
      align-items: center
      text-decoration: none

  .resume
    width: 100%
    min-height: 500px

    &__label
      cursor: pointer
      height: 24px
      display: inline

.languages
  column-gap: 5px
  display: grid
  grid-template-columns: 105px 120px 20px

.language-remove
  box-sizing: content-box
  align-self: center
  padding: 5px
  border-radius: 50%
  width: 20px
  height: 20px
  border: none
  background: #d7d7d7
  cursor: pointer

  &:hover
    background: $crimson
    color: $bialy

@media (max-width: 1000px)
  .profile
    grid-template-columns: minmax(100%, 642px)
    margin: 0 20px
    row-gap: 20px

  .languages
    grid-template-columns: 1fr 1fr 30px

  .select-container
    max-width: 100%

@media (max-width: 700px)
  .profile

    &__left-top-text
      text-align: center
      margin-left: 0

    &__left-top
      grid-template-columns: auto
      
    &__avatar
      text-align: center

      &-container
        text-align: center
</style>
