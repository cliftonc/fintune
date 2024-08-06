import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetUno,
  transformerVariantGroup,
} from "unocss";
import { presetDaisy } from "unocss-preset-daisy";
import presetAnimations from 'unocss-preset-animations';
import { themes } from "./src/themes";

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/**/*.{ts,tsx}"],
      outFile: "assets/style.css",
    },
  },
  presets: [
    presetUno(),
    presetTypography(),
    presetIcons(),
    presetAnimations(),
    presetDaisy({ themes, darkTheme: "black" }),
  ],
  transformers: [transformerVariantGroup()],
});
