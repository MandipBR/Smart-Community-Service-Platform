/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brandRed: "#D32F2F",
        brandBlue: "#1E3A8A",
        warmBg: "#F3E2C7",
        cardWarm: "#FFF9F0",
        ink: "#1F2937",
        muted: "#6B7280",
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 40px rgba(15, 23, 42, 0.12)",
        lift: "0 24px 50px rgba(15, 23, 42, 0.18)",
      },
      borderRadius: {
        xl: "14px",
      },
      backgroundImage: {
        "nepal-wash": "radial-gradient(1000px 400px at 5% -10%, rgba(211,47,47,0.18), transparent 60%), radial-gradient(900px 500px at 95% 0%, rgba(30,58,138,0.14), transparent 60%), linear-gradient(135deg, rgba(243,226,199,0.9), rgba(255,249,240,0.95))",
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
