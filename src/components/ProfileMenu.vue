<script setup>
import { computed } from "vue";
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
  const { email } = store.state.authuser;
  return email ? email : "…";
});
const icon = UserIcon;
const menuEntries = [
  {
    icon: AtSymbolIcon,
    name: "user.change-email",
    route: "change-email",
    params: {},
  },
  {
    icon: KeyIcon,
    name: "user.change-password",
    route: "change-password",
    params: {},
  },
  {
    icon: LogoutIcon,
    name: "user.logout",
    route: "logout",
    params: {},
  },
];
</script>

<template>
  <PopoverMenu
    context-title="user.settings"
    :title="title"
    :options="menuEntries"
    :icon="icon"
    pop-over-above
  />
</template>
