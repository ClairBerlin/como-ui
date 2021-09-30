<template>
  <PopoverMenu
    :context-title="contextTitle"
    :title="title"
    :icon="icon"
    :options="options"
  />
</template>

<script>
import { computed, ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import PopoverMenu from "./PopoverMenu.vue";
import {
  OfficeBuildingIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/vue/outline";

const defaultOptions = [
  {
    icon: OfficeBuildingIcon,
    name: "Manage organizations",
    href: "/team",
  },
  {
    icon: PlusIcon,
    name: "Create organization",
    // TODO: open modal to create new org
    onClick: () => {
      console.log("clicked to create a new org");
    },
  },
];

export default {
  components: { PopoverMenu },
  setup() {
    const store = useStore();
    const orgIndex = ref(0);
    return {
      contextTitle: "Switch dashboard context",
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
        const options = memberships.map((m, i) => ({
          icon: i === orgIndex.value ? CheckIcon : undefined,
          name: m.orgName,
          onClick: () => (orgIndex.value = i),
        }));
        return [...options, ...defaultOptions];
      }),
    };
  },
};
</script>
