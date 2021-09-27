<template>
  <PopoverMenu :title="title" :options="options" />
</template>

<script>
import getInitials from "@/utils";
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";
import PopoverMenu from "./PopoverMenu.vue";

export default {
  components: { PopoverMenu },
  setup() {
    const store = useStore();
    return {
      title: computed(() => {
        const { firstName, lastName } = store.state.authuser;
        if (firstName && lastName) {
          return getInitials(firstName, lastName);
        }
        return "...";
      }),
      options: [
        {
          name: "Change Email",
          href: "/accounts/email",
        },
        {
          name: "Change Password",
          href: "/accounts/password/change",
        },
      ],
    };
  },
};
</script>
