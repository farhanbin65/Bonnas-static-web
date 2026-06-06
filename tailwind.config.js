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
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        bonnas: {
          primary:        "#F2A8B5",
          secondary:      "#E8879A",
          accent:         "#F2A8B5",
          neutral:        "#1E160D",
          "base-100":     "#0D0A07",
          "base-200":     "#1E160D",
          "base-300":     "#2A1E0D",
          "base-content": "#F5ECD7",
          info:    "#60a5fa",
          success: "#4ade80",
          warning: "#fbbf24",
          error:   "#f87171",
        },
      },
    ],
  },
};