<script setup>
import { computed, ref } from "vue";
import { Bar } from "vue-chartjs";
import { useI18n } from "vue-i18n";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/solid";
import dayjs from "dayjs";
import VueSlider from "vue-slider-component";

import {
  Chart as ChartJS,
  Title,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

const { tm, locale } = useI18n();

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
      ticks: {
        display: false,
      },
      display: false,
    },
  },
}));

const rangeHandler = (value) => {
  selectedHour.value = parseInt(value, 10);
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
    <h2 class="header-h2 mb-6 text-center text-lg font-bold text-[#1E398F]">
      CO<sub>2</sub>-{{ $t("histogram") }}
    </h2>
    <div class="flex flex-col-reverse md:flex-col">
      <div class="flex w-full flex-wrap items-center justify-center gap-2">
        <button
          class="flex h-8 w-10 items-center justify-center rounded-md text-[#1E398F] shadow-round"
          :onclick="() => toggleWeekday(selectedWeekday - 1)"
        >
          <component :is="ChevronLeftIcon" class="h-6 w-6" aria-hidden="true" />
        </button>
        <div class="w-40 text-center text-lg text-[#1E398F]">
          <p>{{ tm("weekdays")[selectedWeekday] }}</p>
        </div>
        <button
          class="flex h-8 w-10 items-center justify-center rounded-md text-[#1E398F] shadow-round"
          :onclick="() => toggleWeekday(selectedWeekday + 1)"
        >
          <component
            :is="ChevronRightIcon"
            class="h-6 w-6"
            aria-hidden="true"
          />
        </button>
      </div>
      <div class="my-6 flex flex-col">
        <Bar
          :chart-options="chartOptions"
          :chart-data="chartData"
          :chart-id="chartId"
        />
        <div class="mt-4 flex">
          <div class="w-1/48"></div>
          <vue-slider
            min="0"
            max="23"
            :value="selectedHour"
            @change="(value) => rangeHandler(value)"
          />
          <div class="w-1/48"></div>
        </div>
      </div>
      <div v-if="data && locale === `de`">
        <p
          v-if="data[weekdayIds[selectedWeekday]]?.[selectedHour] >= 1"
          class="text-center"
        >
          An
          <span class="font-bold text-[#1E398F]"
            >{{ tm("weekdays")[selectedWeekday] }}en</span
          >
          wurde <br class="md:hidden" />in den letzten 30 Tagen
          <br class="md:hidden" />um
          <span class="font-bold text-[#1E398F]"
            >{{ selectedHour }}.00 Uhr</span
          >
          ein Überschreitungsscore <br class="md:hidden" />von
          <span class="font-bold text-[#1E398F]"
            >{{
              Math.round(
                data[weekdayIds[selectedWeekday]]?.[selectedHour] +
                  Number.EPSILON
              ) + ""
            }}
          </span>
          gemessen.
        </p>
        <p v-else class="text-center">
          An
          <span class="font-bold text-[#1E398F]"
            >{{ tm("weekdays")[selectedWeekday] }}en</span
          >
          wurde <br class="sm:hidden" />in den letzten 30 Tagen
          <br class="sm:hidden" />um
          <span class="font-bold text-[#1E398F]"
            >{{ selectedHour }}.00 Uhr</span
          >
          der Grenzwert kein einziges mal überschritten.
        </p>
      </div>
      <div v-else-if="data && locale === `en`">
        <p
          v-if="data[weekdayIds[selectedWeekday]]?.[selectedHour] >= 1"
          class="text-center"
        >
          On
          <span class="font-bold text-[#1E398F]"
            >{{ tm("weekdays")[selectedWeekday] }}s</span
          >, <br class="sm:hidden" />an exceedance score
          <br class="sm:hidden" />of
          <span class="font-bold text-[#1E398F]"
            >{{
              Math.round(
                data[weekdayIds[selectedWeekday]]?.[selectedHour] +
                  Number.EPSILON
              ) + ""
            }}
            <br class="md:hidden" /></span
          >has been measured <br class="md:hidden" />at
          <span class="font-bold text-[#1E398F]">
            {{
              selectedHour > 12
                ? `${selectedHour - 12} p.m.`
                : `${selectedHour} a.m.`
            }}
          </span>
          for the past 30 days.
        </p>
        <p v-else class="text-center">
          On
          <span class="font-bold text-[#1E398F]"
            >{{ tm("weekdays")[selectedWeekday] }}s</span
          >
          , the limit has not been exceeded once at
          <span class="font-bold text-[#1E398F]">
            {{
              selectedHour > 12
                ? `${selectedHour - 12} p.m.`
                : `${selectedHour} a.m.`
            }}
          </span>
          in the last 30 days.
        </p>
      </div>
    </div>
  </div>
</template>

<style>
.vue-slider {
  width: 100% !important;
}

.vue-slider-dot-tooltip {
  display: none;
}

.vue-slider-rail {
  background: #f6f6f6;
  height: 2px;
}

.vue-slider-dot-handle {
  cursor: pointer;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #1e398f;
  border-width: 0;
  box-sizing: border-box;
  transition: box-shadow 0.3s, border-color 0.3s;
  transform: translateY(-2px);
}
</style>
