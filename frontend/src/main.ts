// * Unocss
import "@unocss/reset/tailwind.css";
import "uno.css";
import "virtual:unocss-devtools";

// * Project
import "./app.css";

// * App
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app"),
});

export default app;
