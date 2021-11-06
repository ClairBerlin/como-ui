<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";

const route = useRoute();
const router = useRouter();
const store = useStore();

const currentOrgId = computed(() => route.params.orgId);
const isOrgContext = computed(() => typeof currentOrgId.value === "string");

const organization = computed(() => {
  if (isOrgContext.value) {
    // Assume that the organization has already been loaded into the store by App.vue.
    return store.getters["jv/get"]({
      _jv: { type: "Organization", id: currentOrgId.value },
    });
  } else {
    return { name: "No Organization" };
  }
});

onMounted(() => {
  if (route.name === "dashboard") {
    // If no organization is selected, default to the user's first organization.
    const memberships = store.getters["authuser/getMemberships"];
    console.log(memberships.value);
    if (memberships.value?.length > 0) {
      const defaultOrgId = memberships[0].orgId;
      router.push({ name: "overview", params: { orgId: defaultOrgId } });
    } else {
      router.push({ name: "org-management-add" });
    }
  }
});
</script>

<template>
  <div>
    <header class="bg-white shadow-md sm:rounded-md" v-if="$route.meta.title">
      <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          {{ organization.name }} – {{ route.meta.title }}
        </h1>
      </div>
    </header>
    <div class="max-w-screen-xl py-6 mx-auto rounded-md">
      <router-view />
    </div>
  </div>
</template>
