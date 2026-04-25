/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(99,102,241,0.4), 0 12px 40px rgba(99,102,241,0.22)"
      }
    }
  },
  plugins: []
};

