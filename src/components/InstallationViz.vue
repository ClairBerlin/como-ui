<script setup>
import { onMounted, ref } from "vue";
import { computed } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { LineChart, useLineChart } from "vue-chart-3";
import * as dayjs from "dayjs";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
//   CategoryScale,
  LinearScale,
  TimeScale,
  TimeSeriesScale,
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
//   CategoryScale,
  LinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip
);

const props = defineProps({
  installationId: { type: Number, required: true },
  timeUnit: { type: String, required: true },
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

const timeseries = computed(() => installation.value.timeseries);

// const chartData = {
//   datasets: [
//     {
//       label: "CO2 concentration [PPM]",
//       data: timeseries.value,
//       parsing: {
//         xAxisKey: "timestamp_s",
//         yAxisKey: "co2_ppm",
//       },
//     },
//   ],
// };

const chartData = computed(() => ({
  //   labels: ["1", "3", "5", "7", "10", "12"],
  datasets: [
    {
      label: "Test Data",
      fill: false,
      pointRadius: 2,
      lineTension: 0,
      borderWidth: 2,
      borderColor: "#007cb0",
    //   data: [10, 20, 15, 30, 5],
          data: [
          { x: 1, y: 10 },
          { x: 2, y: 20 },
          { x: 3, y: 15 },
          { x: 4, y: 30 },
          { x: 5, y: 5 },
        ],
        // xAxisID: "xAxis",
      //   yAxisID: "yAxis",
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: [
      {
        type: "linear",
        position: "bottom",
        alignToPixels: true,
        title: {
          color: "red",
          display: true,
          text: "Time",
        },
      },
    ],
    y: [
      {
        type: "linear",
        position: "left",
        alignToPixels: true,
        title: {
          color: "red",
          display: true,
          text: "CO2 [PPM]",
        },
        gridLines: {
          color: [
            "#27ff00",
            "#95fe00",
            "#d0fc00",
            "#fff800",
            "#ffd400",
            "#ffaf00",
            "#ff8700",
            "#ff0000",
          ].reverse(),
        },
      },
    ],
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
  <div v-if="timeseries">
    <div>{{ timeseries[0] }}</div>
    <div>{{ timeseries[timeseries.length - 1] }}</div>
  </div>
  <!-- <LineChart v-bind="lineChartProps" /> -->
  <LineChart :chart-data="chartData" :options="chartOptions"/>
</template>
