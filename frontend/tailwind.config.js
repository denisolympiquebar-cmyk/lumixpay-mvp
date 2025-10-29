/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0A84FF",
        darkbg: "#0A0D14",
        darkcard: "#121621",
        ink: "#E6EAF2"
      },
      boxShadow: {
        card: "0 10px 30px rgba(10,132,255,0.10)"
      }
    },
  },
  plugins: [],
}
