<template>
  <PopoverMenu :title="menu" :options="options"></PopoverMenu>
</template>

<script>
import PopoverMenu from "./PopoverMenu.vue";

export default {
  components: { PopoverMenu },
  props: { title: String },
  // TODO: get list of organizations and allow to switch directly from the context menu
  setup(props) {
    return {
      menu: { text: props.title },
      options: [
        {
          name: "Change Email",
          href: "##",
        },
        {
          name: "Change Password",
          href: "##",
        },
      ],
    };
  },
};
</script>
