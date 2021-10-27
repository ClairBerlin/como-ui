<script setup>
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import PopoverMenu from "@/components/PopoverMenu.vue";
import { PlusIcon, CheckIcon } from "@heroicons/vue/outline";
import { OfficeBuildingIcon } from "@heroicons/vue/solid";

const store = useStore();
const route = useRoute();
const router = useRouter();

const currentOrgId = computed(() => route.params.orgId);

const isOrgConext = computed(() => typeof currentOrgId.value === "string");

const memberships = computed(() => store.getters["authuser/getMemberships"]);

const selectedMembership = computed(() =>
  isOrgConext.value ? store.getters["authuser/getMembershipByOrgId"](currentOrgId.value) : undefined
);

const currentOrgName = computed(() => {
  if (isOrgConext.value) {
    return selectedMembership.value.orgName;
  }
  return "No organization selected";
});

const orgEntries = computed(() => {
  if (memberships.value?.length) {
    return memberships.value.map((m) => {
      return {
        icon:
          m.orgId === selectedMembership.value?.orgId ? CheckIcon : undefined,
        name: m.orgName,
        route: route.name,
        params: { orgId: m.orgId },
      };
    });
  } else {
    return [];
  }
});

const defaultEntries = [
  {
    icon: OfficeBuildingIcon,
    name: "Manage organizations",
    route: "org-management",
    params: {}
  },
  {
    icon: PlusIcon,
    name: "Create a new organization",
    route: "org-management-add",
    params: {}
  },
];

const menuEntries = computed(() => [...orgEntries.value, ...defaultEntries]);

const icon = OfficeBuildingIcon;
</script>

<template>
  <PopoverMenu
    context-title="Switch organization"
    :title="currentOrgName"
    :icon="icon"
    :options="menuEntries"
  />
</template>
