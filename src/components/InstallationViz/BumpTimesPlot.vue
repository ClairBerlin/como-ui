<script setup>
import { computed, ref } from "vue";
import { Bar } from "vue-chartjs";
import { useI18n } from "vue-i18n";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/solid";
import dayjs from "dayjs";

import {
  Chart as ChartJS,
  Title,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

const { tm } = useI18n();

ChartJS.register(Title, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  chartId: {
    type: String,
    default: "bar-chart",
  },
  data: {
    type: Object,
    default() {
      return {};
    },
  },
});

const selectedWeekday = ref(dayjs().day());
const selectedHour = ref(dayjs().hour());

const hoursArray = [];
for (let i = 0; i < 24; i++) {
  hoursArray.push(i);
}

const weekdayIds = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const chartData = computed(() => ({
  labels: hoursArray,
  datasets: [
    {
      data: props.data[weekdayIds[selectedWeekday.value]],
      backgroundColor: (ctx) => {
        return ctx.dataIndex === parseInt(selectedHour.value, 10)
          ? "#1E398F"
          : "#DADADA";
      },
      borderRadius: 50,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  events: [],
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

const rangeHandler = (e) => {
  selectedHour.value = parseInt(e.target.value, 10);
  selectedWeekday.value = selectedWeekday.value + 1;
  selectedWeekday.value = selectedWeekday.value - 1;
};

const toggleWeekday = (index) => {
  selectedWeekday.value = index === -1 ? 6 : index === 7 ? 0 : index;
};
</script>

<template>
  <div
    class="card relative h-full w-full rounded-lg bg-white px-4 py-8 text-black md:px-14"
    id="barChartWrapper"
  >
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
    <Bar
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-id="chartId"
    />
    <input
      type="range"
      min="1"
      max="24"
      :value="selectedHour"
      step="1"
      @change="(e) => rangeHandler(e)"
    />
    <p>
      An {{ tm("weekdays")[selectedWeekday] }}en werden um
      {{ selectedHour }}.00Uhr durchschnittlich
      {{
        Math.round(
          (data?.[weekdayIds[selectedWeekday]]?.[selectedHour] +
            Number.EPSILON) *
            100
        ) /
          100 +
        ""
      }}ppm gemessen
    </p>
  </div>
</template>
