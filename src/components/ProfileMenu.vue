<script setup>
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";
import PopoverMenu from "./PopoverMenu.vue";
import Cookies from "js-cookie";
import {
  AtSymbolIcon,
  KeyIcon,
  LogoutIcon,
  UserIcon,
} from "@heroicons/vue/outline";

const store = useStore();
const title = computed(() => {
  const { firstName, lastName } = store.state.authuser;
  if (firstName && lastName) {
    return firstName + " " + lastName;
  }
  return "…";
});
const icon = UserIcon;
const options = [
  {
    name: "Change Email",
    href: "/accounts/email",
    icon: AtSymbolIcon,
  },
  {
    name: "Change Password",
    href: "/accounts/password/change",
    icon: KeyIcon,
  },
  {
    name: "Logout",
    icon: LogoutIcon,
    onClick: async () => {
      await store.dispatch("authuser/logout");
      Cookies.remove("csrftoken");
      window.location.href = window.location.origin + "/accounts/login/";
      return;
    },
  },
];
</script>
<template>
  <PopoverMenu
    context-title="User Settings"
    :title="title"
    :options="options"
    :icon="icon"
  />
</template>
