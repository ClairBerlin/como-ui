<script setup>
import { useStore } from "vuex";
import Cookies from "js-cookie";

const store = useStore();

console.log("Logging out...");
await store.dispatch("authuser/logout");
console.log("Removing CSRF token.");
Cookies.remove("csrftoken");
window.location.href = window.location.origin + "/accounts/login/";
</script>

<template>
  <div>
    <h1>You are being logged out...</h1>
  </div>
</template>
