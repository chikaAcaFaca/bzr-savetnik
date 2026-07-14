/**
 * Lokalni PostCSS config — namerno prazan.
 * Triolingos globals.css je čist CSS (bez Tailwind direktiva), pa nam ne treba
 * nijedan plugin. Ovaj fajl SPREČAVA da Next.js pri build-u ode uz stablo
 * direktorijuma i pokupi postcss.config iz roditeljskog bzr-savetnik repoa
 * (koji traži tailwindcss). Bez ovoga i Vercel build pada.
 */
const config = { plugins: {} };
export default config;
