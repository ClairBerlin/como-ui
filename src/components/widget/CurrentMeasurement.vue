<script setup>
import MeasurementVisualization from "./MeasurementVisualization.vue";
defineProps({
  ppm: { type: Number, required: true },
  timestamp: { type: Date, required: true },
});
</script>

<template>
  <div
    class="flex max-w-[327px] flex-col items-center gap-2 rounded bg-[#F1F9FE] px-7 pt-7 pb-4 drop-shadow-sm"
  >
    <div class="mt-2 text-lg font-bold leading-5 text-[#1E398F]">
      Aktueller Messwert
    </div>
    <div class="text-sm leading-3 text-[#1E398F]">
      von {{ timestamp.getHours() }}:{{ timestamp.getMinutes() }}h
    </div>
    <div class="mt-4 self-end text-[#1E398F]">
      <span class="text-2xl font-bold">{{ ppm }}</span>
      <span class="text-sm"> ppm</span>
    </div>
    <MeasurementVisualization :ppm="ppm" />
    <div class="mt-4 font-medium text-[#3B3B3A]">
      Der CO2-Gehalt des Raumes liegt bei {{ ppm }} ppm, dies entspricht einem
      normalen Wert und einer niedrigen Aerosollast. Die Raumluft ist gut und du
      kannst durchatmen.
    </div>
  </div>
</template>
