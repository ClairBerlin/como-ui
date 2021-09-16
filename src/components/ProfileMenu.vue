<template>
  <PopoverMenu :title="title" :options="options"></PopoverMenu>
</template>

<script>
import PopoverMenu from "./PopoverMenu.vue";

export default {
  components: { PopoverMenu },
  props: { title: String },
  setup() {
    return {
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
