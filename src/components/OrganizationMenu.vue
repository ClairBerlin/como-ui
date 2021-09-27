<template>
  <PopoverMenu :title="title" :icon="icon" :options="options" />
</template>

<script>
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";
import PopoverMenu from "./PopoverMenu.vue";
import { OfficeBuildingIcon } from "@heroicons/vue/outline";

export default {
  components: { PopoverMenu },
  setup() {
    // TODO: get list of organizations and allow to switch directly from the context menu
    const store = useStore();
    return {
      title: computed(() => {
        const { memberships } = store.state.authuser;
        if (memberships.length) {
          return memberships[0].orgName;
        }
        return "...";
      }),
      icon: OfficeBuildingIcon,
      options: [
        {
          name: "Change organization",
          href: "##",
        },
        {
          name: "Manage Organizations",
          href: "##",
        },
      ],
    };
  },
};
</script>
