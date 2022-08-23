<script setup>
import MeasurementVisualization from "./MeasurementVisualization.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineProps({
  ppm: { type: Number, default: undefined },
  timestamp: { type: Date, default: undefined },
  whiteBg: { type: Boolean, default: false },
});

const getText = (ppm) => {
  if (ppm <= 1000) {
    return t("widget.text.low_p1") + ppm + t("widget.text.low_p2");
  } else if (ppm <= 1600) {
    return t("widget.text.medium_p1") + ppm + t("widget.text.medium_p2");
  } else {
    return t("widget.text.high_p1") + ppm + t("widget.text.high_p2");
  }
};

const getTimeString = (timestamp) => {
  const hours = timestamp.getHours().toString();
  const minutes =
    timestamp.getMinutes() < 10
      ? "0" + timestamp.getMinutes().toString()
      : timestamp.getMinutes();
  return `von ${hours}:${minutes}h`;
};
</script>

<template>
  <div
    :class="[
      'flex h-[340px] max-w-[327px] flex-col items-center justify-end gap-2 rounded-lg px-7 pt-7 pb-4 shadow-md',
      !ppm || !timestamp
        ? 'bg-[#F6F6F6]'
        : whiteBg
        ? 'bg-white'
        : 'bg-[#F1F9FE]',
    ]"
  >
    <div class="mt-2 text-lg font-bold leading-5 text-[#1E398F]">
      {{ $t("widget.title") }}
    </div>
    <div class="text-sm leading-3 text-[#1E398F]" v-if="timestamp && ppm">
      {{ getTimeString(timestamp) }}
    </div>
    <div class="text-sm leading-3 text-[#1E398F]" v-else>von --:--h</div>
    <div class="mt-4 self-end text-[#1E398F]">
      <span class="text-2xl font-bold">{{ ppm || "---" }}</span>
      <span class="text-sm"> ppm</span>
    </div>
    <MeasurementVisualization :ppm="ppm" v-if="timestamp && ppm" />
    <div class="mt-4 h-1/2 font-medium text-[#3B3B3A]" v-if="timestamp && ppm">
      <span v-html="getText(ppm)"></span>
    </div>
    <div class="mt-4 h-1/2 font-medium text-[#3B3B3A]" v-else>
      <span class="font-bold text-[#E40032]"
        >{{ $t("widget.error.title") }}
      </span>
      <span>
        {{ $t("widget.error.text") }}
      </span>
    </div>
  </div>
</template>
