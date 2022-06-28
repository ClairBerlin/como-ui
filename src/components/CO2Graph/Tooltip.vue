<script setup>
const props = defineProps({
  time: { type: String, required: true },
  value: { type: String, required: true },
});

console.log("Props", props.time, props.value);
</script>

<template>
  <div class="flex w-full items-center justify-between pl-10">
    <span class="text-xs text-[#7886C2]">{{ time }} Uhr</span>
    <span class="text-lg text-[#1E398F]">{{ value }} ppm</span>
  </div>
</template>
