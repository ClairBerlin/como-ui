<template>
  <PopoverMenu
    :title="title"
    :icon="icon"
    :options="options"
  />
</template>

<script>
import PopoverMenu from "./PopoverMenu.vue";
import { OfficeBuildingIcon } from "@heroicons/vue/outline";

export default {
  components: { OfficeBuildingIcon, PopoverMenu },
  props: { title: String },
  // TODO: get list of organizations and allow to switch directly from the context menu
  setup() {
    return {
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
