/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brandRed: "rgb(var(--brand-red) / <alpha-value>)",
        brandBlue: "rgb(var(--brand-blue) / <alpha-value>)",
        warmBg: "var(--bg-warm)",
        cardWarm: "var(--bg-card)",
        ink: "rgb(var(--text-ink) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        surface: "var(--bg-surface)",
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
      },
      borderRadius: {
        xl: "14px",
      },
      backgroundImage: {
        "nepal-wash": "var(--bg-nepal-wash)",
        "hero-glow": "linear-gradient(135deg, #D32F2F 0%, #1E3A8A 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0px)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out",
      },
    },
  },
  plugins: [],
};
