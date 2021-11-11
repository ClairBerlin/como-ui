<script setup>
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import PopoverMenu from "@/components/PopoverMenu.vue";
import { PlusIcon } from "@heroicons/vue/outline";
import { OfficeBuildingIcon } from "@heroicons/vue/solid";

const store = useStore();
const route = useRoute();

const currentOrgId = computed(() => route.params.orgId);
const isOrgContext = computed(() => typeof currentOrgId.value === "string");

const selectedMembership = computed(() =>
  isOrgContext.value
    ? store.getters["authuser/getMembershipByOrgId"](currentOrgId.value)
    : undefined
);

const currentOrgName = computed(() => {
  const orgName = selectedMembership.value?.orgName;
  return orgName ? orgName : "———";
});

const orgEntries = computed(() => {
  const memberships = store.getters["authuser/getMemberships"];
  return memberships.map((m) => {
    return {
      selected: m.orgId === selectedMembership.value?.orgId,
      name: m.orgName,
      route: route.name,
      params: { orgId: m.orgId },
    };
  });
});

const defaultEntries = [
  {
    icon: OfficeBuildingIcon,
    name: "org.manage",
    route: "org-management",
    params: {},
  },
  {
    icon: PlusIcon,
    name: "org.create",
    route: "org-management-add",
    params: {},
  },
];

const menuEntries = computed(() => [...orgEntries.value, ...defaultEntries]);

const icon = OfficeBuildingIcon;
</script>

<template>
  <PopoverMenu
    context-title="org.switch"
    :title="currentOrgName"
    :icon="icon"
    :options="menuEntries"
  />
</template>
