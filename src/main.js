import { createApp } from "vue";
import "./tailwind.css";
import App from "./App.vue";
import { routes } from "./routes.js";
import { createRouter, createWebHistory } from "vue-router";
import { Store } from "./store";
import { createI18n } from "vue-i18n";
import messages from "./i18n";

const app = createApp(App);

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const i18n = createI18n({ locale: "de", fallbackLocale: "en", messages });

app.use(router);
app.use(Store);
app.use(i18n);
app.mount("#app");
