import { createApp } from "vue";
import "./tailwind.css";
import App from "./App.vue";
import { routes } from "./routes.js";
import { createRouter, createWebHistory } from "vue-router";
import { Store } from "./store";
import { createI18n } from "vue-i18n/index";
import messages from "./i18n";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const i18n = createI18n({
  // legacy: false, // to use Composition API. See https://vue-i18n.intlify.dev/guide/advanced/composition.html#basic-usage
  locale: "de",
  fallbackLocale: ["de", "en"],
  messages,
});

const app = createApp(App);
app.use(router);
app.use(Store);
app.use(i18n);
app.use(Toast);
app.mount("#app");
