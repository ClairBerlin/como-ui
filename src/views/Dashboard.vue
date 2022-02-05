<script setup>
import { onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});
const isOrgContext = computed(() => store.getters["nav/isOrgContext"]);

const organization = computed(() => {
  if (isOrgContext.value) {
    return store.getters["nav/getOrgMembership"];
  } else {
    return { orgName: "org.none" };
  }
});

const updateInventory = async (orgId) => {
  store.dispatch("nav/loadInvetory", orgId);
};

onMounted(async () => {
  await updateInventory(currentOrgId.value);
});

watch(
  () => currentOrgId.value,
  async (orgId) => {
    updateInventory(orgId);
  }
);
</script>

<template>
  <div>
    <header class="bg-white shadow-md sm:rounded-md" v-if="$route.meta.title">
      <div class="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          {{ organization.orgName }} – {{ $t(route.meta.title) }}
        </h1>
      </div>
    </header>
    <div class="mx-auto max-w-screen-xl rounded-md py-6">
      <router-view />
    </div>
  </div>
</template>
