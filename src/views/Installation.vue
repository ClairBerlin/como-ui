<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import InstallationViz from "@/components/InstallationViz.vue";

// TODO: Ensure that an installation is only displayed if it belongs to the selected organization.

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

onMounted(async () => {
  if (!isInstallationLoaded.value) {
    console.log(`Fetching installation with ID ${currentInstallationId.value}`);
    store.dispatch("jv/get", `installations/${currentInstallationId.value}`);
  }
});
</script>

<template>
  <div
    class="
      max-w-screen-xl
      flex flex-wrap
      gap-4
      px-2
      lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between
    "
    v-if="isInstallationLoaded"
  >
    <InstallationViz :installation-id="currentInstallationId" />
  </div>
</template>
