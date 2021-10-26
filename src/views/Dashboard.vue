<script setup>
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

const currentOrgId = computed(() => {
  return route.params.orgId ? route.params.orgId : 0;
});

const organization = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Organization", id: currentOrgId.value },
  })
);
</script>

<template>
  <div>
    <header class="bg-white shadow" v-if="$route.meta.title">
      <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          {{ organization.name }} – {{ route.meta.title }}
        </h1>
      </div>
    </header>
    <div class="max-w-screen-xl py-6 mx-auto sm:px-6 lg:px-8">
      <router-view />
    </div>
  </div>
</template>
