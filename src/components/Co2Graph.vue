<script setup>
import { computed } from "vue";
import dayjs from "dayjs";
import "chartjs-adapter-dayjs";
import { LineChart, useLineChart } from "vue-chart-3";
import {
  Chart,
  Filler,
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
  Tooltip,
  Filler
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
    return {
      x: dayjs.unix(s.timestamp_s).add(dayjs().utcOffset(), "m"),
      y: s.co2_ppm,
    };
  })
);

const colors = [
  "#FC7057",
  "#EAB150",
  "#D9DF57",
  "#CEDC73",
  "#C2D990",
  "#B8D6AC",
  "#ADD3C6",
  "#ADD3C8",
];

const getColor = (value) => {
  if (value <= 600) return "#ADD3C6";
  if (value <= 800) return "#B8D6AC";
  if (value <= 1000) return "#C2D990";
  if (value <= 1200) return "#CEDC73";
  if (value <= 1400) return "#D9DF57";
  if (value <= 1600) return "#EAB150";
  if (value <= 1800) return "#FC7057";
  return "#ADD3C8";
};

const chartData = computed(() => ({
  datasets: [
    {
      fill: "origin",
      label: t("ppm"),
      pointRadius: 0,
      lineTension: 0,
      borderWidth: 1,
      borderColor: "#1E398F",
      backgroundColor: (ctx) => {
        const canvas = ctx.chart.ctx;
        const gradient = canvas.createLinearGradient(0, 0, 0, ctx.chart.height);

        colors.forEach((color, index) =>
          gradient.addColorStop((1 / colors.length) * index, `${color}CC`)
        );

        return gradient;
      },
      data: timeseries.value,
      parsing: false,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600, easing: "easeOutCubic" },
  scales: {
    x: {
      ticks: {
        color: "#82B1E0",
      },
      grid: {
        drawBorder: false,
        color: "#A5DBF8",
      },
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
        stepSize: 200,
        color: (context) => getColor(context.tick.value),
      },
      grid: {
        drawBorder: false,
        color: "#A5DBF8",
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
  <div>
    <LineChart v-if="props.samplePool.length" v-bind="lineChartProps" />
    <div v-else class="flex h-96 w-96 items-center justify-center">
      <span>Loading...</span>
    </div>
  </div>
</template>
