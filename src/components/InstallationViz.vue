<script setup>
import { onMounted, ref } from "vue";
import { computed } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import * as dayjs from "dayjs";

const props = defineProps({
  installationId: { type: Number, required: true },
});

const route = useRoute();
const store = useStore();

const loadInstallation = async (from, to) => {
  const params = {
    include_timeseries: 1,
    "filter[from]": from,
    "filter[to]": to,
  };
  await store.dispatch("jv/get", [
    `installations/${props.installationId}`,
    {
      params: params,
    },
  ]);
};

const installation = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Installation", id: props.installationId },
  })
);

const timeseries = computed(() => (installation.value.timeseries));

onMounted(async () => loadInstallation(0, dayjs().unix()));
</script>

<template>
  <div>{{ installationId }}</div>
  <div>{{ installation.sample_count }}</div>
  <div v-if="timeseries">
    <div>{{ timeseries[0] }}</div>
    <div>{{ timeseries[timeseries.length - 1] }}</div>
  </div>
</template>
