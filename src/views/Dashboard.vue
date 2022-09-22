<script setup>
import { onMounted, computed, watch, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Breadcrumbs from "@/components/Breadcrumbs.vue";

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

const subheading = ref(undefined);

watch(
  () => currentOrgId.value,
  async (orgId) => {
    updateInventory(orgId);
  }
);

watch(
  () => route.name,
  () => {
    subheading.value = undefined;
  }
);

const changeSubheading = (value) => (subheading.value = value);
</script>

<template>
  <div class="">
    <div class="border-b border-gray-200 bg-white">
      <header
        class="max-w-screen-xl mx-auto flex w-full px-4 pt-12 pb-4"
        v-if="$route.meta.title"
      >
        <div class="">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            {{ organization.orgName }} – {{ $t(route.meta.title) }}
          </h1>
          <h2 class="text-xl font-semibold text-gray-700" v-if="subheading">
            {{ subheading }}
          </h2>
        </div>
      </header>
    </div>
    <Breadcrumbs />
    <div class="max-w-screen-xl mx-auto px-4 py-6">
      <router-view @change-subheading="changeSubheading" />
    </div>
  </div>
</template>
