<script setup>
import { onMounted, ref } from "vue";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import dayjs from "dayjs";
import "chartjs-adapter-dayjs";
import { LineChart, useLineChart } from "vue-chart-3";
import {
  Chart,
  LineElement,
  LineController,
  TimeScale,
  Legend,
  Title,
  Tooltip,
} from "chart.js";

Chart.register(
  LineElement,
  LineController,
  TimeScale,
  Legend,
  Title,
  Tooltip
);

const props = defineProps({
  installationId: { type: Number, required: true },
  // day, week, month
  displayScope: { type: String, required: true },
  referenceInstant: {
    type: Object,
    default() {
      return dayjs();
    },
  },
  samplePool: { type: Array, required: true },
});

const store = useStore();

const displayFrom = computed(() => {
  if (props.displayScope === "month") {
    return props.referenceInstant.startOf("month");
  } else if (props.displayScope === "week") {
    return props.referenceInstant.startOf("week");
  } else {
    return props.referenceInstant.startOf("day");
  }
});

const displayTo = computed(() => {
  if (props.displayScope === "month") {
    return props.referenceInstant.endOf("month");
  } else if (props.displayScope === "week") {
    return props.referenceInstant.endOf("week");
  } else {
    return props.referenceInstant.endOf("day");
  }
});

const displayTimeRange = computed(() => {
  return { min: displayFrom.value.valueOf(), max: displayTo.value.valueOf() };
});

const displayUnit = computed(() => {
  if (props.displayScope === "month") {
    return "day";
  } else if (props.displayScope === "week") {
    return "day";
  } else {
    return "hour";
  }
});

const timeseries = computed(() =>
  props.samplePool?.map((s) => {
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
          datetime: "YYYY-MM-DD HH:mm:ss",
          millisecond: "H:mm:ss.SSS",
          second: "H:mm:ss",
          minute: "H:mm",
          hour: "H",
          day: "D. MMM",
          week: "ll",
          month: "MMM YYYY",
          quarter: "[Q]Q - YYYY",
          year: "YYYY",
        },
        isoWeekday: true,
        unit: displayUnit.value,
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
</script>

<template>
  <LineChart v-bind="lineChartProps" />
</template>
