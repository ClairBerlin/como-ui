<script setup>
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";
import PopoverMenu from "./PopoverMenu.vue";
import { PlusIcon, CheckIcon } from "@heroicons/vue/outline";
import { OfficeBuildingIcon } from "@heroicons/vue/solid";

const defaultOptions = [
  {
    icon: OfficeBuildingIcon,
    name: "Manage organizations",
    href: "/orgs",
  },
  {
    icon: PlusIcon,
    name: "Create a new organization",
    href: "/orgs/add",
  },
];
const store = useStore();
const title = computed(() => {
  const { memberships } = store.state.authuser;
  const { selectedMembership } = store.state.authuser;
  if (memberships.length) {
    return memberships[selectedMembership].orgName;
  }
  return "…";
});
const icon = OfficeBuildingIcon;
const options = computed(() => {
  const { memberships } = store.state.authuser;
  const { selectedMembership } = store.state.authuser;
  const options = memberships.map((m, i) => ({
    icon: i === selectedMembership ? CheckIcon : undefined,
    name: m.orgName,
    onClick: async () =>
      await store.dispatch("authuser/setSelectedMembership", i),
  }));
  return [...options, ...defaultOptions];
});
</script>

<template>
  <PopoverMenu
    context-title="Switch dashboard context"
    :title="title"
    :icon="icon"
    :options="options"
  />
</template>
