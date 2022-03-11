<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import PopoverMenu from '@/components/PopoverMenu.vue';
import { PlusIcon } from '@heroicons/vue/outline';
import { OfficeBuildingIcon } from '@heroicons/vue/solid';

const store = useStore();

const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});
const orgMembership = computed(() => store.getters['nav/getOrgMembership']);

const currentOrgName = computed(() => {
  const orgName = orgMembership.value?.orgName;
  return orgName ? orgName : '———';
});

const orgEntries = computed(() => {
  const memberships = store.getters['authuser/getMemberships'];
  return memberships.map((m) => {
    return {
      selected: m.orgId === currentOrgId.value,
      name: m.orgName,
      route: 'overview',
      params: { orgId: m.orgId },
    };
  });
});

const defaultEntries = [
  {
    icon: OfficeBuildingIcon,
    name: 'org.manage',
    route: 'org-management',
    params: {},
  },
  {
    icon: PlusIcon,
    name: 'org.create',
    route: 'org-management-add',
    params: {},
  },
];

const menuEntries = computed(() => [...orgEntries.value, ...defaultEntries]);

const icon = OfficeBuildingIcon;
</script>

<template>
  <PopoverMenu context-title="org.switch" :title="currentOrgName" :icon="icon" :options="menuEntries" />
</template>
