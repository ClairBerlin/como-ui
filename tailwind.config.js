const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  important: true,
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', ...defaultTheme.fontFamily.sans],
      },
      width: {
        "1/48": "2.1%",
      },
      boxShadow: {
        round:
          "0px 0px 1px rgba(30, 57, 143, 0.16), 0px 0px 16px rgba(30, 57, 143, 0.08)",
      },
    },
    maxWidth: {
      "2xs": "242px",
      "two-cards": "674px",
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/aspect-ratio"),
    require("daisyui"),
  ],
};
