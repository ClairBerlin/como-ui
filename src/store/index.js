import { createStore } from "vuex";
import axios from "axios";
import { jsonapiModule } from "jsonapi-vuex";
import authuser from "./authuser";
import nav from "./nav";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

const jsonapi = axios.create({
  baseURL: "/api/v1/",
  headers: {
    "Content-Type": "application/vnd.api+json",
    Accept: "application/vnd.api+json, application/json, text/plain, */*",
  },
  // To work with Django's CSRF protection. Read the CSRF token from the cookie and
  // return it in a CSRF-header with each request.
  // See https://build.vsupalov.com/avoid-csrf-errors-axios-django/
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFTOKEN",
});

const redirectOn401 = (error) => {
  console.log(error);
  if (error.response.status === 401) {
    window.location.href = window.location.origin + "/accounts/login/";
  }
  Promise.reject(error);
};

jsonapi.interceptors.response.use(
  (response) => response,
  (error) => redirectOn401(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => redirectOn401(error)
);

export const Store = createStore({
  modules: {
    authuser,
    jv: jsonapiModule(jsonapi),
    nav,
  },
});

export default Store;
