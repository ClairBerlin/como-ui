<script setup>
import logo from "@/assets/como-logo-dark.svg";
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();
const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});
</script>

<template>
  <router-link
    :to="{
      name: 'overview',
      params: { orgId: currentOrgId || 1 },
    }"
    class="mb-4 flex flex-shrink-0 items-center px-4 py-0.5"
  >
    <img class="h-12 w-auto" :src="logo" alt="COMo logo" />
  </router-link>
</template>
