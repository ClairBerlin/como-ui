import { createApp } from "vue";
import "./tailwind.css";
import App from "./App.vue";
import { routes } from "./routes.js";
import { createRouter, createWebHistory } from "vue-router";
import { Store } from "./store";
import { createI18n } from "vue-i18n";
import messages from "./i18n";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const i18n = createI18n({ locale: "de", fallbackLocale: "en", messages });

const app = createApp(App);
app.use(router);
app.use(Store);
app.use(i18n);
app.mount("#app");
