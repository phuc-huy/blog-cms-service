const colors = require("tailwindcss/colors")
const plugin = require("tailwindcss/plugin")
const defaultTheme = require("tailwindcss/defaultTheme")

const DEFAULT_COLOR = {
    ...colors,
    primary: "var(--color-primary)",
    "primary--bg": "var(--color-primary--bg)",

    border: "var(--color-border)",

    desc: "var(--color-desc)",

    bg: "var(--color-bg)",

    transparent: "transparent",
    current: "currentColor",
    white: colors.white,
    black: colors.black,
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))"
    },
    secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))"
    },
    muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))"
    },
    accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))"
    },
    destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))"
    },
    card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))"
    },
}

module.exports = {
    darkMode: "class",
    mode: "jit",
    purge: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
        // './src/pages/**/*.{js,jsx,ts,tsx}',
        // './src/components/**/*.{js,jsx,ts,tsx}',
        // './src/containers/**/*.{js,jsx,ts,tsx}',
        // './src/layout/**/*.{js,jsx,ts,tsx}'
    ],
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}"
    ],
    theme: {

        screens: {
            ...defaultTheme.screens,
            mobile: { max: "640px" },
            mobile_promax: "428px",
            tablet: "756px",
            tablet_pro: "1024px",
            laptop: "1208px",
            desktop: "1280px",
            extra: "1900px"
        },

        colors: DEFAULT_COLOR,
        textColor: DEFAULT_COLOR,
        borderColor: (theme) => ({
            ...theme("colors"),
            ...DEFAULT_COLOR
        }),
        fontSize: {
            xs: ["0.75rem", "1rem"], // 12px, 16px
            sm: ["0.875rem", "1.25rem"], // 14px, 20px
            base: ["1rem", "1.5rem"], // 16px, 24px
            lg: ["1.125rem", "1.75rem"], // 18px, 28px
            xl: ["1.25rem", "2rem"], // 20px, 32px
            "2xl": ["1.5rem", "2.25rem"], // 24px, 36px
            "3xl": ["1.875rem", "2.25rem"], // 30px, 36px
            "4xl": ["2.25rem", "2.5rem"], // 36px, 40px
            "5xl": ["3rem", "1"], // 48px, 1
            "6xl": ["3.75rem", "1"], // 60px, 1
            "7xl": ["4.5rem", "1"], // 72px, 1
            "8xl": ["6rem", "1"], // 96px, 1
            "9xl": ["8rem", "1"] // 128px, 1
        },
        extend: {
            colors: DEFAULT_COLOR,

            gridTemplateColumns: {
                15: "repeat(15, minmax(0, 1fr))"
            },
            boxShadow: {
                primary: "var(--box-shadow-primary)",
                second: "var(--box-shadow-secondary)"
            },
            maxWidth: {
                primary: "var(--max-width-primary)"
            },
            minWidth: {
                0: "0",
                "1/6": "16.7%",
                "1/5": "20%",
                "1/4": "25%",
                "1/3": "33.3%",
                "1/2": "50%",
                screen: "100vw"
            },
            spacing: {
                0: "0",
                1: "0.25rem",
                2: "0.5rem",
                3: "0.75rem",
                4: "1rem",
                5: "1.25rem",
                6: "1.5rem",
                7: "1.75rem",
                8: "2rem",
                9: "2.25rem",
                10: "2.5rem",
                11: "2.75rem",
                12: "3rem",
                13: "3.25rem",
                14: "3.5rem",
                15: "3.75rem",
                16: "4rem"
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)"
            }
        }
    },
    variants: {
        extend: {
            backgroundColor: ["active"],
            textColor: ["hover"],
            backgroundOpacity: ["hover"],
            opacity: ["active , hover"],
            transform: ["hover"],
            width: ["hover", "focus"],
            boxShadow: ["hover"]
        }
    },
    plugins: [
        require("daisyui"),

        plugin(function ({ addVariant }) {
            addVariant("children", "&>*")
        }),
        require("tailwindcss-animate")
    ],
    corePlugins: {
        preflight: false,
        maxWidth: true,
        minWidth: true,
        height: true
    },
    daisyui: {
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["light"],
                    primary: "#eab308"
                }
            }
        ]
    }
}
