<script setup>
defineProps({
  numberOfInstallations: { type: Number, required: true },
  currentInstallation: { type: Number, required: true },
  roomName: { type: String, required: true },
});
const emit = defineEmits(["previous", "next"]);
const prev = () => emit("previous");
const next = () => emit("next");
</script>

<template>
  <div class="flex w-full flex-row items-center justify-between">
    <div class="rounded p-6 hover:bg-[#F1F9FE]" @click="prev">
      <svg
        width="16"
        height="24"
        viewBox="0 0 16 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.7871 22L2 12L13.7871 2"
          stroke="#385BA7"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <div class="flex select-none flex-col items-center text-[#385BA7]">
      <div class="text-sm">
        {{ currentInstallation }}/{{ numberOfInstallations }}
      </div>
      <div class="text-sm font-bold">{{ roomName }}</div>
    </div>
    <div class="rounded p-6 hover:bg-[#F1F9FE]" @click="next">
      <svg
        width="16"
        height="24"
        viewBox="0 0 16 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.00004 2L13.7871 12L2.00004 22"
          stroke="#385BA7"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>
