<script setup>
import { computed, ref } from "vue";
import { Bar } from "vue-chartjs";
import { useI18n } from "vue-i18n";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/solid";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

const { tm } = useI18n();

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

const weekdayIds = [0, 1, 2, 3, 4, 5, 6];

const weekdays = {};

weekdayIds.forEach(
  (id) =>
    (weekdays[id] = {
      dataset: hoursArray.map(() => Math.floor(gaussRand() * 2000)),
    })
);

weekdayIds.forEach((index) => {
  const dataset = weekdays[index].dataset;
  weekdays[index].lowest = dataset.findIndex(
    (item) => Math.min(...dataset) === item
  );
  weekdays[index].highest = dataset.findIndex(
    (item) => Math.max(...dataset) === item
  );
});

const chartData = computed(() => ({
  labels: hoursArray,
  datasets: [
    {
      data: weekdays[selectedWeekday.value].dataset,
      backgroundColor: (ctx) => {
        return ctx.dataIndex === weekdays[selectedWeekday.value].highest ||
          ctx.dataIndex === weekdays[selectedWeekday.value].lowest
          ? "#1E398F"
          : "#DADADA";
      },
      borderRadius: 50,
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
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        display: false,
      },
    },
  },
}));

const toggleWeekday = (index) => {
  selectedWeekday.value = index === -1 ? 6 : index === 7 ? 0 : index;
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
    />
    <div class="flex w-full flex-wrap justify-center gap-2">
      <button
        v-for="(weekday, index) in tm('weekdays')"
        :key="index"
        :onclick="() => toggleWeekday(index)"
        class="tab w-24 rounded-lg border duration-300 ease-in-out"
        :class="
          index === selectedWeekday
            ? 'border-[#1E398F] bg-[#1E398F] text-white'
            : 'border-[#B1B2B3] bg-white text-[#B1B2B3] shadow-inner'
        "
      >
        {{ weekday }}
      </button>
    </div>
    <div class="flex w-full flex-wrap items-center justify-center gap-2">
      <button
        class="flex h-8 w-10 items-center justify-center rounded-md shadow-md"
        :onclick="() => toggleWeekday(selectedWeekday - 1)"
      >
        <component :is="ChevronLeftIcon" class="h-6 w-6" aria-hidden="true" />
      </button>
      <div class="w-40 text-center text-lg text-[#1E398F]">
        <p>{{ tm("weekdays")[selectedWeekday] }}</p>
      </div>
      <button
        class="flex h-8 w-10 items-center justify-center rounded-md shadow-md"
        :onclick="() => toggleWeekday(selectedWeekday + 1)"
      >
        <component :is="ChevronRightIcon" class="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
