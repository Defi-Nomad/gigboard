import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D10",
        panel: "#14171C",
        line: "#262B33",
        paper: "#ECEAE4",
        dim: "#9AA1AC",
        signal: "#F5A623",
        signalDim: "#7A5417",
        good: "#4FAE7A",
        bad: "#E0654F",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["ui-sans-serif", "system-ui", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        sm: "3px",
      },
    },
  },
  plugins: [],
};

export default config;
