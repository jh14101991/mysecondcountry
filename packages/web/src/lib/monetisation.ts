// Monetisation wiring for the static site. The site has no backend (Astro `output: static`,
// no Vercel adapter, ADR-0013), so both surfaces post to a hosted provider's form endpoint.
// There is no provider SDK and no JavaScript here; each block is a plain HTML form POST that
// works on a static page. This file is the single place the founder configures monetisation.
//
// HOW TO GO LIVE (founder):
//   1. Email list: create a form in a list provider (MailerLite recommended; Buttondown,
//      ConvertKit, or Formspree work the same way) and paste its form-POST endpoint into
//      EMAIL_FORM_ACTION. The endpoint must accept a standard HTML form POST with an `email` field.
//   2. Intro form: create a form that emails you on submit (Tally recommended; Formspree also
//      works) and paste its POST endpoint into INTRO_FORM_URL. It receives the reader's fields
//      plus hidden `page_id` and `corridor` fields naming the source page.
//   3. Flip INTRO_LIVE to true only once a vetted adviser is secured. The intro block then renders
//      on exactly the pages whose entry id is in INTRO_CORRIDOR.

/** Provider form-POST endpoint for the email list. Must accept a standard form POST with `email`. */
export const EMAIL_FORM_ACTION = "https://REPLACE.example/email-form-endpoint";

/** Provider form-POST endpoint for the intro request. Emails the founder on submit. */
export const INTRO_FORM_URL = "https://REPLACE.example/intro-form-endpoint";

/** The intro block ships built but hidden. Flip to true once a vetted adviser is secured. */
export const INTRO_LIVE = false;

/**
 * Pages where the intro block may appear, keyed by the collection entry's stable `id`
 * (NOT its URL slug: the Portugal IFICI regime's id is "portugal-ifici" but its slug is "ifici").
 */
export const INTRO_CORRIDOR = new Set<string>([
  "portugal-ifici", // regime  (packages/data/src/regimes/portugal-ifici.json -> id)
  "is-portugals-nhr-tax-regime-still-available", // qa
  "portugal-ifici-the-nhr-successor", // topic
]);

/** Corridor membership for a page, independent of the live flag. Keys on the entry `id`. */
export function isInIntroCorridor(pageId: string): boolean {
  return INTRO_CORRIDOR.has(pageId);
}

/** Whether the intro block should render on a page: the slice is live AND the page is in the corridor. */
export function showIntro(pageId: string): boolean {
  return INTRO_LIVE && INTRO_CORRIDOR.has(pageId);
}
