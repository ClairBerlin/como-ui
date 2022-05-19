<script setup>
import MeasurementVisualization from "./MeasurementVisualization.vue";
defineProps({
  ppm: { type: Number, default: undefined },
  timestamp: { type: Date, default: undefined },
});

const getText = (ppm) => {
  if (ppm <= 1000) {
    return `Der CO2-Gehalt des Raumes liegt bei ${ppm} ppm, dies entspricht einem normalen Wert und einer niedrigen Aerosollast. Die Raumluft ist gut und du kannst durchatmen.`;
  } else if (ppm <= 1600) {
    return `Der CO2-Gehalt des Raumes liegt bei ${ppm} ppm, dies entspricht einem leicht erhöhten Wert und somit auch einer erhöhten Aerosollast. Dem Raum würde etwas frischer Wind gut tun! `;
  } else {
    return `Der CO2-Gehalt des Raumes liegt bei ${ppm} ppm, dies entspricht einem sehr hohen Wert und deutet auf eine hohe Aerosollast hin. Halte lieber die Luft an!`;
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
      'flex h-[340px] max-w-[327px] flex-col items-center gap-2 rounded px-7 pt-7 pb-4 drop-shadow-sm',
      !ppm || !timestamp ? 'bg-[#F6F6F6]' : 'bg-[#F1F9FE]',
    ]"
  >
    <div class="mt-2 text-lg font-bold leading-5 text-[#1E398F]">
      Aktueller Messwert
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
    <div class="mt-4 font-medium text-[#3B3B3A]" v-if="timestamp && ppm">
      {{ getText(ppm) }}
    </div>
    <div class="mt-4 font-medium text-[#3B3B3A]" v-else>
      <span class="text-[#E40032]">STÖRUNG </span>
      <span>
        - Der Sensor macht gerade ein Päuschen! Leider ist gerade keine Anzeige
        möglich, da im Moment keine Daten gesendet werden.
      </span>
    </div>
  </div>
</template>
