<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import dayjs from "dayjs";
import "chartjs-adapter-dayjs";
import { BarChart, useBarChart } from "vue-chart-3";
// import {
//   Chart,
//   Filler,
//   PointElement,
//   BarElement,
//   LineController,
//   TimeScale,
//   LinearScale,
//   Title,
//   Tooltip as TooltipChartJs,
// } from "chart.js";
import LoadingSpinner from "../LoadingSpinner.vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
const store = useStore();

const isLoading = computed(() => {
  return store.getters["nav/isOrgContextLoading"];
});

// Chart.register(
//   BarElement,
//   PointElement,
//   LineController,
//   TimeScale,
//   LinearScale,
//   Title,
//   TooltipChartJs,
//   Filler
// );

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

const chartData = computed(() => ({
  // datasets: [
  //   {
  //     fill: "origin",
  //     pointRadius: 0,
  //     lineTension: 0,
  //     borderWidth: 1,
  //     borderColor: "#1E398F",
  //     backgroundColor: (ctx) => {
  //       const canvas = ctx.chart.ctx;
  //       const gradient = canvas.createLinearGradient(0, 0, 0, ctx.chart.height);
  //       colors.forEach((color, index) =>
  //         gradient.addColorStop((1 / colors.length) * index, `${color}CC`)
  //       );
  //       return gradient;
  //     },
  //     pointBackgroundColor: "#1E398F",
  //     pointBorderWidth: 0,
  //     pointHoverRadius: 8,
  //     data: timeseries.value,
  //     parsing: false,
  //     ticks: {
  //       color: "red",
  //     },
  //   },
  // ],
}));

const chartPlugins = [
  // {
  //   afterDraw: (chart) => {
  //     if (chart.tooltip?._active?.length) {
  //       let x = chart.tooltip._active[0].element.x;
  //       let yAxis = chart.scales.y;
  //       let ctx = chart.ctx;
  //       ctx.save();
  //       ctx.beginPath();
  //       ctx.moveTo(x, yAxis.top);
  //       ctx.lineTo(x, yAxis.bottom);
  //       ctx.lineWidth = 2;
  //       ctx.strokeStyle = "#1E398F";
  //       ctx.stroke();
  //       ctx.restore();
  //     }
  //   },
  // },
];

const chartOptions = computed(() => ({
  // responsive: true,
  // maintainAspectRatio: false,
  // animation: { duration: 600, easing: "easeOutCubic" },
  // interaction: {
  //   intersect: false,
  //   mode: "index",
  // },
  // plugins: {
  //   tooltip: {
  //     enabled: false,
  //     external: function (context) {
  //       consolingData.value = {
  //         time:
  //           locale.value === "de"
  //             ? dayjs(context.tooltip.title[0]).format("DD.MM.YYYY | HH:mm") +
  //               " Uhr"
  //             : dayjs(context.tooltip.title[0]).format("MM/DD/YYYY | h:m a"),
  //         value: context.tooltip.body[0].lines[0],
  //       };
  //     },
  //   },
  // },
  // scales: {
  //   x: {
  //     ticks: {
  //       color: "#82B1E0",
  //       maxTicksLimit: () => {
  //         return props.displayScope === "month" ? 6 : undefined;
  //       },
  //       callback: (label, index, tick) => {
  //         return props.displayScope === "week"
  //           ? dayjs(tick[index].value).format("dd")
  //           : label;
  //       },
  //     },
  //     grid: {
  //       drawBorder: false,
  //       color: "#A5DBF8",
  //     },
  //     type: "time",
  //     time: {
  //       displayFormats: {
  //         datetime: "YYYY-MM-DD HH:mm:ss",
  //         millisecond: "H:mm:ss.SSS",
  //         second: "H:mm:ss",
  //         minute: "H:mm",
  //         hour: "H",
  //         day: "DD.MM",
  //         week: "ll",
  //         month: "MMM YYYY",
  //         quarter: "[Q]Q - YYYY",
  //         year: "YYYY",
  //       },
  //       isoWeekday: true,
  //       unit: displayUnit.value,
  //     },
  //     position: "bottom",
  //     alignToPixels: true,
  //     title: false,
  //     ...displayTimeRange.value,
  //   },
  //   y: {
  //     type: "linear",
  //     position: "left",
  //     alignToPixels: true,
  //     title: false,
  //     min: 400,
  //     max: 1800,
  //     ticks: {
  //       stepSize: 200,
  //       color: (context) => getColor(context.tick.value),
  //     },
  //     grid: {
  //       drawBorder: false,
  //       color: "#A5DBF8",
  //     },
  //   },
  // },
}));

const { BarChartProps } = useBarChart({
  chartData: chartData,
  options: chartOptions,
  plugins: chartPlugins,
});
</script>

<template>
  <div
    class="flex max-w-[327px] flex-col items-center gap-2 rounded-lg bg-white px-6 pt-7 pb-4 shadow-sm"
  >
    <BarChart v-if="false" v-bind="BarChartProps" />
    <div v-else class="flex h-96 w-full items-center justify-center">
      <LoadingSpinner v-if="isLoading" />
      <div v-else>{{ $t("no-data") }}</div>
    </div>
  </div>
</template>
