<script setup>
import { useStore } from "vuex";
import Cookies from "js-cookie";

const store = useStore();

await store.dispatch("authuser/logout");
window.location.href = window.location.origin + "/accounts/login/";
</script>

<template>
  <div>
    <h1>You are being logged out...</h1>
  </div>
</template>
