<script setup>
const props = defineProps({
  ppm: { type: Number, required: true },
});
const ppm = Math.max(400, Math.min(props.ppm, 2000));
</script>

<template>
  <input
    type="range"
    disabled
    class="form-range h-4 w-full appearance-none bg-transparent p-0 focus:shadow-none focus:outline-none focus:ring-0"
    min="400"
    max="2000"
    :value="ppm"
  />
</template>

<style scoped>
input[type="range"] {
  background: linear-gradient(90deg, #9ccef0 0%, #dddf4a 76.56%, #ff6058 100%);
  border-radius: 48px;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  background-color: #1e398f;
  opacity: 1;
  width: 8px;
  height: 24px;
  border-radius: 10px;
}
input[type="range"]::-moz-range-thumb {
  background-color: #1e398f;
  opacity: 1;
  width: 8px;
  height: 24px;
  border-radius: 10px;
  border: none;
}
</style>
