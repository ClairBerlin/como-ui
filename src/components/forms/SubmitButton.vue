<script setup>
defineProps({
  allowSubmit: { type: Boolean, default: false },
});
</script>
<template>
  <button
    type="submit"
    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    v-if="allowSubmit"
  >
    <slot />
  </button>
</template>
