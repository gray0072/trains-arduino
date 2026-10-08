import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    // GitHub Pages serves this app from https://gray0072.github.io/trains-arduino/
    base: "/trains-arduino/",
});
