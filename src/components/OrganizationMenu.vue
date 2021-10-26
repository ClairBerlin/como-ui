<script setup>
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import PopoverMenu from "./PopoverMenu.vue";
import { PlusIcon, CheckIcon } from "@heroicons/vue/outline";
import { OfficeBuildingIcon } from "@heroicons/vue/solid";

const store = useStore();
const route = useRoute();
const router = useRouter();

const memberships = computed(() => store.getters["authuser/getMemberships"]);

const selectedMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.orgId)
);

const orgName = computed(() => {
  if (selectedMembership.value) {
    return selectedMembership.value.orgName;
  }
  return "…";
});

const orgEntries = computed(() => {
  if (memberships.value?.length) {
    return memberships.value.map((m) => {
      return {
        icon:
          m.orgId === selectedMembership.value.orgId ? CheckIcon : undefined,
        name: m.orgName,
        onClick: async () =>
          router.push({
            name: route.name,
            params: { orgId: m.orgId },
          }),
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
    route: "/org-management",
  },
  {
    icon: PlusIcon,
    name: "Create a new organization",
    href: "/orgs/add",
  },
];

const menuEntries = computed(() => [...orgEntries.value, ...defaultEntries]);

const icon = OfficeBuildingIcon;
</script>

<template>
  <PopoverMenu
    context-title="Switch organization"
    :title="orgName"
    :icon="icon"
    :options="menuEntries"
  />
</template>
