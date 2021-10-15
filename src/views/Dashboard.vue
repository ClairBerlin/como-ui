<template>
  <div class="bg-gray-50">
    <div
      class="
        max-w-screen-xl
        px-4
        py-12
        mx-auto
        sm:px-6
        lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between
      "
    >
      <h2
        class="
          text-3xl
          font-extrabold
          leading-9
          tracking-tight
          text-gray-900
          sm:text-4xl sm:leading-10
        "
      >
        Dashboard
      </h2>
    </div>
  </div>
  <InstallationViz :installation-id=1 display-scope="day"></InstallationViz>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import InstallationViz from "@/components/InstallationViz.vue";

const route = useRoute();
const store = useStore();
const orgId = route.params.id;
</script>
