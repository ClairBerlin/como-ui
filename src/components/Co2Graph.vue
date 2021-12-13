<script setup>
import { computed } from "vue";
import dayjs from "dayjs";
import "chartjs-adapter-dayjs";
import { LineChart, useLineChart } from "vue-chart-3";
import {
  Chart,
  PointElement,
  LineElement,
  LineController,
  TimeScale,
  LinearScale,
  Legend,
  Title,
  Tooltip,
} from "chart.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

Chart.register(
  LineElement,
  PointElement,
  LineController,
  TimeScale,
  LinearScale,
  Legend,
  Title,
  Tooltip
);

const props = defineProps({
  installationId: { type: String, required: true },
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
      label: t("ppm"),
      pointRadius: 0,
      lineTension: 0,
      borderWidth: 3,
      backgroundColor: "#4338CA",
      borderColor: "#4338CA",
      data: timeseries.value,
      parsing: false,
    },
  ],
}));

const getColor = (value) => {
  if (value <= 600) return "#27ff00";
  if (value <= 800) return "#95fe00";
  if (value <= 1000) return "#d0fc00";
  if (value <= 1200) return "#fff800";
  if (value <= 1400) return "#ffd400";
  if (value <= 1600) return "#ff8700";
  return "#ff0000";
};

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600, easing: "easeOutCubic" },
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
        color: "#4338CA",
        display: true,
        font: { weight: "bold", size: 16 },
        text: t("time"),
      },
      ...displayTimeRange.value,
    },
    y: {
      type: "linear",
      position: "left",
      alignToPixels: true,
      title: {
        color: "#4338CA",
        display: true,
        font: { weight: "bold", size: 16 },
        text: t("ppm"),
      },
      min: 400,
      max: 1800,
      ticks: {
        stepSize: 100,
      },
      grid: {
        drawBorder: false,
        color: (context) => getColor(context.tick.value),
      },
    },
  },
}));

const { lineChartProps } = useLineChart({
  chartData: chartData,
  options: chartOptions,
});
</script>

<template>
  <LineChart v-bind="lineChartProps" />
</template>
