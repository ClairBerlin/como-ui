<script setup>
defineProps({
  time: { type: String, required: true },
  value: { type: String, required: true },
});
</script>

<template>
  <div class="flex h-7 w-full items-center justify-between pl-10">
    <span v-if="time" class="text-xs text-[#7886C2]">{{ time }}</span>
    <span v-if="value" class="text-lg font-bold text-[#1E398F]"
      >{{ value }} ppm</span
    >
  </div>
</template>
