<script setup>
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";
import PopoverMenu from "./PopoverMenu.vue";
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
const menuEntries = [
  {
    icon: AtSymbolIcon,
    name: "Change Email",
    route: "change-email",
    params: {},
  },
  {
    icon: KeyIcon,
    name: "Change Password",
    route: "change-password",
    params: {},
  },
  {
    icon: LogoutIcon,
    name: "Logout",
    route: "logout",
    params: {},
  },
];
</script>

<template>
  <PopoverMenu
    context-title="User Settings"
    :title="title"
    :options="menuEntries"
    :icon="icon"
  />
</template>
