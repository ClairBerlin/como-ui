<template>
  <PopoverMenu
    :context-title="contextTitle"
    :title="title"
    :options="options"
    :icon="icon"
  />
</template>

<script>
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

export default {
  components: { PopoverMenu },
  setup() {
    const store = useStore();
    return {
      contextTitle: "User Settings",
      title: computed(() => {
        const { firstName, lastName } = store.state.authuser;
        if (firstName && lastName) {
          return firstName + " " + lastName;
        }
        return "…";
      }),
      icon: UserIcon,
      options: [
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
      ],
    };
  },
};
</script>
