<script setup>
import AccordionItem from "./AccordionItem.vue";

defineProps({
  title: { type: String, required: true },
  data: { type: Object, required: true },
});
</script>

<template>
  <div class="mt-12 w-full text-2xl font-bold text-[#1E398F]">
    {{ title }}
  </div>
  <div class="flex w-full flex-col gap-7" @click="onClick">
    <AccordionItem
      v-for="(item, index) in data"
      :key="index"
      :title="item.title"
      :text="item.text"
    />
  </div>
</template>
