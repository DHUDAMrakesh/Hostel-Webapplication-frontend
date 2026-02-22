/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                bg: {
                    base: "#f0f4ff",
                    surface: "#ffffff",
                    elevated: "#eef1fb",
                    overlay: "#e4e9f7",
                },
                brand: {
                    indigo: "#4f46e5",
                    purple: "#9333ea",
                    pink: "#db2777",
                    cyan: "#0891b2",
                    emerald: "#059669",
                    amber: "#d97706",
                    rose: "#e11d48",
                },
                text: {
                    primary: "#0f172a",
                    secondary: "#334155",
                    muted: "#64748b",
                    disabled: "#94a3b8",
                },
                border: {
                    subtle: "rgba(0,0,0,0.07)",
                    default: "rgba(0,0,0,0.11)",
                    strong: "rgba(0,0,0,0.18)",
                },
            },
            fontFamily: {
                sans: ["Outfit", "system-ui", "sans-serif"],
            },
            fontSize: {
                "2xs": ["0.65rem", { lineHeight: "1rem" }],
            },
            letterSpacing: {
                widest2: "0.2em",
            },
            boxShadow: {
                "glow-indigo": "0 0 30px rgba(99,102,241,0.3)",
                "glow-purple": "0 0 30px rgba(168,85,247,0.3)",
                "glow-emerald": "0 0 30px rgba(16,185,129,0.3)",
                "glow-rose": "0 0 30px rgba(244,63,94,0.3)",
                "card": "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                "card-hover": "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
            },
            animation: {
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "float": "float 6s ease-in-out infinite",
                "shimmer": "shimmer 2s linear infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-8px)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
            },
        },
    },
    plugins: [],
};
