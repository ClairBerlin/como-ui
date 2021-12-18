<script setup>
import { onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const router = useRouter();
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
  if (route.name === "dashboard") {
    // If no organization is selected, default to the user's first organization.
    // TODO: Read most recently used membership from cookie.
    const memberships = store.getters["authuser/getMemberships"];
    if (memberships?.length > 0) {
      const defaultOrgId = memberships[0].orgId;
      await updateInventory(defaultOrgId);
      router.push({ name: "overview", params: { orgId: defaultOrgId } });
    } else {
      router.push({ name: "org-management-add" });
    }
  } else {
    await updateInventory(currentOrgId.value);
  }
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
      <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          {{ organization.orgName }} – {{ $t(route.meta.title) }}
        </h1>
      </div>
    </header>
    <div class="max-w-screen-xl py-6 mx-auto rounded-md">
      <router-view />
    </div>
  </div>
</template>
