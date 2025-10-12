// tailwind.config.js
// @type {import('tailwindcss').Config}
export default {
  content: [
    "./index.html",              // arquivo HTML raiz
    "./src/**/*.{js,ts,jsx,tsx}" // todos os arquivos dentro de src
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          green: "#14532d",   // verde principal do app
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],       // fonte padrão
        serif: ["Merriweather", "serif"],                 // títulos
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(2, 44, 34, .05)", // sombra usada nos cards
      },
    },
  },
  plugins: [],
}
