<script setup>
defineProps({
  additionalClasses: { type: String, default: "" },
});
</script>
<template>
  <div class="flex items-center justify-center">
    <div
      :class="[
        'm-4 h-24 w-24 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600',
        additionalClasses,
      ]"
    ></div>
  </div>
</template>
