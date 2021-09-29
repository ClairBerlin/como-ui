<template>
  <PopoverMenu :title="title" :icon="icon" :options="options" />
</template>

<script>
import { computed, ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import PopoverMenu from "./PopoverMenu.vue";
import { OfficeBuildingIcon } from "@heroicons/vue/outline";

export default {
  components: { PopoverMenu },
  setup() {
    // TODO: get list of organizations and allow to switch directly from the context menu
    const store = useStore();
    const orgIndex = ref(0);
    return {
      title: computed(() => {
        const { memberships } = store.state.authuser;
        if (memberships.length) {
          return memberships[orgIndex.value].orgName;
        }
        return "…";
      }),
      icon: OfficeBuildingIcon,
      options: computed(() => {
        const { memberships } = store.state.authuser;
        return memberships.map((m, i) => ({
          name: m.orgName,
          onClick: () => (orgIndex.value = i),
        }));
      }),
    };
  },
};
</script>
