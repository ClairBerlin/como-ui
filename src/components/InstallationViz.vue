<script setup>
import { onMounted, ref } from "vue";
import { computed } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import dayjs from "dayjs";
// TODO: update locale when language is changed via UI
dayjs.locale('de');
import "chartjs-adapter-dayjs";
import { LineChart, useLineChart } from "vue-chart-3";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  LinearScale,
  TimeScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
} from "chart.js";

Chart.register(
  LineElement,
  PointElement,
  LineController,
  LinearScale,
  TimeScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip
);

const props = defineProps({
  installationId: { type: Number, required: true },
  // day, week, month
  displayScope: { type: String, required: true },
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

const displayFrom = computed(() => {
  if (props.displayScope === "month") {
    return dayjs().startOf("month");
  } else if (props.displayScope === "week") {
    return dayjs().startOf("week");
  } else {
    return dayjs().startOf("day");
  }
});

const displayTo = computed(() => {
  return dayjs().endOf("day");
});

const displayTimeRange = computed(() => {
  return { min: displayFrom.value.valueOf(), max: displayTo.value.valueOf() };
});

const installation = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Installation", id: props.installationId },
  })
);

const timeseries = computed(() =>
  installation.value.timeseries?.map((s) => {
    return { x: s.timestamp_s * 1000, y: s.co2_ppm };
  })
);

const chartData = computed(() => ({
  datasets: [
    {
      label: "CO2 concentration [PPM]",
      pointRadius: 0,
      lineTension: 0,
      borderWidth: 2,
      borderColor: "#007cb0",
      data: timeseries.value,
      parsing: false,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: "time",
      time: {
        displayFormats: {
          hour: "H",
        },
        isoWeekday: true,
      },
      position: "bottom",
      alignToPixels: true,
      title: {
        color: "red",
        display: true,
        text: "Time",
      },
      ...displayTimeRange.value,
    },
    y: {
      type: "linear",
      position: "left",
      alignToPixels: true,
      title: {
        color: "red",
        display: true,
        text: "CO2-Concentration [PPM]",
      },
      suggestedmin: 400,
      max: 1800,
      grid: {
        color: [
          "#27ff00",
          "#95fe00",
          "#d0fc00",
          "#fff800",
          "#ffd400",
          "#ffaf00",
          "#ff8700",
          "#ff0000",
        ],
      },
    },
  },
}));

const { lineChartProps, lineChartRef } = useLineChart({
  chartData: chartData,
  options: chartOptions,
});

onMounted(async () => loadInstallation(0, dayjs().unix()));
</script>

<template>
  <div>{{ installationId }}</div>
  <div>{{ installation.sample_count }}</div>
  <div>{{ dayjs().format() }}</div>
  <div v-if="timeseries">
    <div>{{ timeseries[0] }}</div>
    <div>{{ timeseries[timeseries.length - 1] }}</div>
  </div>
  <LineChart v-bind="lineChartProps" />
</template>
