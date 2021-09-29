<template>
  <PopoverMenu :title="title" :options="options" :icon="icon" />
</template>

<script>
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";
import PopoverMenu from "./PopoverMenu.vue";
import Cookies from "js-cookie";
import { UserIcon } from "@heroicons/vue/outline";

export default {
  components: { PopoverMenu },
  setup() {
    const store = useStore();
    return {
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
        },
        {
          name: "Change Password",
          href: "/accounts/password/change",
        },
        {
          name: "Logout",
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
