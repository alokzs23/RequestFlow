/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#3b6dff",
          600: "#2952e0",
          700: "#1f3fb3",
        },
      },
    },
  },
  plugins: [],
};
