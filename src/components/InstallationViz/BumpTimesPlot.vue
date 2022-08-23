<script setup>
import { computed, onMounted } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps({
  chartId: {
    type: String,
    default: "bar-chart",
  },
  datasetIdKey: {
    type: String,
    default: "label",
  },
  height: {
    type: Number,
    default: 300,
  },
  width: {
    type: Number,
    default: 300,
  },
  cssClasses: {
    default: "",
    type: String,
  },
  styles: {
    type: Object,
    default: () => {},
  },
  plugins: {
    type: Object,
    default: () => {},
  },
});

onMounted(async () => {
  const chart = document.getElementById(props.chartId);
  window.addEventListener("resize", () => chart.resize());
});

const hoursArray = [];
for (let i = 0; i < 24; i++) {
  hoursArray.push(i);
}

const gaussRand = () => {
  let r = 0;
  for (let i = 8; i > 0; i--) {
    r += Math.random();
  }
  return r / 8;
};

const dataset = hoursArray.map(() => Math.floor(gaussRand() * 2000));

const lowest = dataset.findIndex((item) => Math.min(...dataset) === item);
const highest = dataset.findIndex((item) => Math.max(...dataset) === item);

const chartData = {
  labels: hoursArray,
  datasets: [
    {
      data: dataset,
      backgroundColor: (ctx) => {
        return ctx.dataIndex === highest || ctx.dataIndex === lowest
          ? "red"
          : "white";
      },
      borderColor: "red",
      borderWidth: 1,
    },
  ],
};

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
}));
</script>

<template>
  <div
    class="card relative h-full w-full rounded-lg bg-white p-4 text-black shadow-sm"
    id="barChartWrapper"
  >
    <Bar
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-id="chartId"
      :dataset-id-key="datasetIdKey"
      :plugins="plugins"
      :css-classes="cssClasses"
      :styles="styles"
    />
  </div>
</template>
