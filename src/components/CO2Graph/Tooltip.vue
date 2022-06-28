<script setup>
const props = defineProps({
  time: { type: String, required: true },
  value: { type: String, required: true },
});

console.log("Props", props.time, props.value);
</script>

<template>
  <p>{{ time }}</p>
  <p>{{ value }}</p>
</template>
