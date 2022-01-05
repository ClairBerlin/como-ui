<script setup>
defineProps({
  allowSubmit: { type: Boolean, default: false },
});
</script>
<template>
  <button
    type="submit"
    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    v-if="allowSubmit"
  >
    <slot />
  </button>
</template>
