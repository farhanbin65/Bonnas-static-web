/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pink: {
          bonnas: "#F2A8B5",
          dark:   "#E8879A",
          light:  "#FDEEF1",
        },
        night:     "#0D0A07",
        ember:     "#1E160D",
        cream:     "#F5ECD7",
        sand:      "#9D8E7A",
        "gold-dust":"#3D2E1E",
      },
    },
  },
  // Components use Tailwind utilities; avoid shipping unused daisyUI themes.
  plugins: [],
};
