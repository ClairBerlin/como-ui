<script setup>
import medal from "@/assets/fresh-air-medal.svg";
import medalInactive from "@/assets/fresh-air-medal-inactive.svg";

defineProps({
  inactive: { type: Boolean, default: false },
  whiteBg: { type: Boolean, default: false },
});
</script>

<template>
  <div
    v-if="inactive"
    class="flex max-w-[327px] flex-col items-center justify-end gap-2 rounded-lg px-6 pt-7 pb-4 shadow-md"
    :class="[whiteBg ? 'bg-white' : 'bg-[#F1F9FE]']"
  >
    <img
      class="mb-4 h-12 w-12"
      :src="medalInactive"
      alt="Frischluft Medaille"
    />
    <div class="mx-0 text-lg font-bold text-[#878786]">
      {{ $t("fresh-air-medal.inactive.header") }}
    </div>
    <div class="h-1/2 font-medium text-[#B1B2B3]">
      {{ $t("fresh-air-medal.inactive.text") }}
    </div>
  </div>
  <div
    v-else
    class="flex max-w-[327px] flex-col items-center justify-end gap-2 rounded-lg px-6 pt-7 pb-4 shadow-md"
    :class="[whiteBg ? 'bg-white' : 'bg-[#F1F9FE]']"
  >
    <img class="mb-4 h-12 w-12" :src="medal" alt="Frischluft Medaille" />
    <div class="mx-0 text-lg font-bold text-[#1E398F]">
      {{ $t("fresh-air-medal.active.header") }}
    </div>
    <div class="h-1/2 font-medium text-[#3B3B3A]">
      {{ $t("fresh-air-medal.active.text") }}
    </div>
  </div>
</template>
