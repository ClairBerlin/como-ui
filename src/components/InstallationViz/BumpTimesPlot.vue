<script setup>
import { computed, ref } from "vue";
import { Bar } from "vue-chartjs";
import { useI18n } from "vue-i18n";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

const { t, tm } = useI18n();

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

defineProps({
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

const selectedWeekday = ref(0);

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

const weekdays = {
  0: {
    dataset: hoursArray.map(() => Math.floor(gaussRand() * 2000)),
    name: t("monday"),
  },
  1: {
    dataset: hoursArray.map(() => Math.floor(gaussRand() * 2000)),
    name: t("next"),
  },
  2: {
    dataset: hoursArray.map(() => Math.floor(gaussRand() * 2000)),
    name: t("next"),
  },
  3: {
    dataset: hoursArray.map(() => Math.floor(gaussRand() * 2000)),
    name: t("next"),
  },
  4: {
    dataset: hoursArray.map(() => Math.floor(gaussRand() * 2000)),
    name: t("next"),
  },
  5: {
    dataset: hoursArray.map(() => Math.floor(gaussRand() * 2000)),
    name: t("next"),
  },
  6: {
    dataset: hoursArray.map(() => Math.floor(gaussRand() * 2000)),
    name: t("next"),
  },
};

const weekdayIds = [0, 1, 2, 3, 4, 5, 6];

weekdayIds.forEach((index) => {
  const dataset = weekdays[index].dataset;
  weekdays[index].lowest = dataset.findIndex(
    (item) => Math.min(...dataset) === item
  );
  weekdays[index].highest = dataset.findIndex(
    (item) => Math.max(...dataset) === item
  );
});

const dataset = hoursArray.map(() => Math.floor(gaussRand() * 2000));

const lowest = dataset.findIndex((item) => Math.min(...dataset) === item);
const highest = dataset.findIndex((item) => Math.max(...dataset) === item);

const chartData = computed(() => ({
  labels: hoursArray,
  datasets: [
    {
      data: weekdays[selectedWeekday.value].dataset,
      backgroundColor: (ctx) => {
        return ctx.dataIndex === highest || ctx.dataIndex === lowest
          ? "red"
          : "white";
      },
      borderColor: "red",
      borderRadius: 50,
      borderWidth: 1,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
}));

const toggleWeekday = (index) => {
  console.log("CLICK", index);
  selectedWeekday.value = index;
};
</script>

<template>
  <div
    class="card relative h-full w-full rounded-lg bg-white p-4 text-black"
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
    <div>
      <button
        v-for="(weekday, index) in tm('weekdays')"
        :key="index"
        :onclick="() => toggleWeekday(index)"
      >
        {{ weekday }}
      </button>
    </div>
  </div>
</template>
