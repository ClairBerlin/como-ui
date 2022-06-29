<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
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
  Title,
  Tooltip as TooltipChartJs,
} from "chart.js";
import LoadingSpinner from "../LoadingSpinner.vue";
import Tooltip from "./Tooltip.vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const consolingData = ref(undefined);
const store = useStore();

const isLoading = computed(() => {
  return store.getters["nav/isOrgContextLoading"];
});

Chart.register(
  LineElement,
  PointElement,
  LineController,
  TimeScale,
  LinearScale,
  Title,
  TooltipChartJs,
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
    return props.referenceInstant.subtract(1, "M");
  } else if (props.displayScope === "week") {
    return props.referenceInstant.subtract(1, "w");
  } else {
    return props.referenceInstant.startOf("day");
  }
});

const displayTo = computed(() => {
  return props.referenceInstant.endOf("day");
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
  "#9CCEF0",
];

const getColor = (value) => {
  if (value <= 400) return "#9CCEF0";
  if (value <= 600) return "#ADD3C6";
  if (value <= 800) return "#B8D6AC";
  if (value <= 1000) return "#C2D990";
  if (value <= 1200) return "#CEDC73";
  if (value <= 1400) return "#D9DF57";
  if (value <= 1600) return "#EAB150";
  if (value <= 1800) return "#FC7057";
  return "#FC7057";
};

const chartData = computed(() => ({
  datasets: [
    {
      fill: "origin",
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
      pointBackgroundColor: "#1E398F",
      pointBorderWidth: 0,
      pointHoverRadius: 8,
      data: timeseries.value,
      parsing: false,
      ticks: {
        color: "red",
      },
    },
  ],
}));

const chartPlugins = [
  {
    afterDraw: (chart) => {
      if (chart.tooltip?._active?.length) {
        let x = chart.tooltip._active[0].element.x;
        let yAxis = chart.scales.y;
        let ctx = chart.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, yAxis.top);
        ctx.lineTo(x, yAxis.bottom);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#1E398F";
        ctx.stroke();
        ctx.restore();
      }
    },
  },
];

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600, easing: "easeOutCubic" },
  interaction: {
    intersect: false,
    mode: "index",
  },
  plugins: {
    tooltip: {
      enabled: false,
      external: function (context) {
        consolingData.value = {
          time:
            locale.value === "de"
              ? dayjs(context.tooltip.title[0]).format("DD.MM.YYYY | HH:mm") +
                " Uhr"
              : dayjs(context.tooltip.title[0]).format("MM/DD/YYYY | h:m a"),
          value: context.tooltip.body[0].lines[0],
        };
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#82B1E0",
        maxTicksLimit: () => {
          return props.displayScope === "month" ? 6 : undefined;
        },
        callback: (label, index, tick) => {
          return props.displayScope === "week"
            ? dayjs(tick[index].value).format("dd")
            : label;
        },
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
          day: "DD.MM",
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
      title: false,
      ...displayTimeRange.value,
    },
    y: {
      type: "linear",
      position: "left",
      alignToPixels: true,
      title: false,
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
  plugins: chartPlugins,
});
</script>

<template>
  <div>
    <Tooltip :time="consolingData?.time" :value="consolingData?.value" />
    <LineChart v-if="props.samplePool.length" v-bind="lineChartProps" />
    <div v-else class="flex h-96 w-full items-center justify-center">
      <LoadingSpinner v-if="isLoading" />
      <div v-else>{{ $t("no-data") }}</div>
    </div>
  </div>
</template>
