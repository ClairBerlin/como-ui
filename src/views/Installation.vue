<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import InstallationViz from "@/components/InstallationViz/InstallationViz.vue";

const route = useRoute();
const store = useStore();

const currentInstallationId = computed(() => {
  return route.params.installationId;
});

const installation = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Installation", id: currentInstallationId.value },
  })
);

const isInstallationLoaded = computed(() => {
  return typeof installation.value !== "undefined";
});
</script>

<template>
  <div
    class="max-w-screen-xl flex flex-wrap gap-4 px-2 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8"
    v-if="isInstallationLoaded"
  >
    <InstallationViz :installation-id="currentInstallationId" />
  </div>
</template>
