<template>
  <PopoverMenu :title="menu" :options="options"></PopoverMenu>
</template>

<script>
import PopoverMenu from "./PopoverMenu.vue";
import { OfficeBuildingIcon } from "@heroicons/vue/outline";

export default {
  components: { OfficeBuildingIcon, PopoverMenu },
  // props: { title: String, options: Array },
  setup() {
    return {
      menu: { text: "OrgMenu", icon: OfficeBuildingIcon },
      options: [
        {
          name: "Item 1",
          href: "##",
        },
        {
          name: "Item 2",
          href: "##",
        },
        {
          name: "Item 3",
          href: "##",
        },
      ],
    };
  },
};
</script>
