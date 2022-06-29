<script setup>
import AccordionItem from "./AccordionItem.vue";

defineProps({
  title: { type: String, required: true },
  data: { type: Object, required: true },
});
</script>

<template>
  <div class="w-full text-2xl font-bold text-[#1E398F]">
    {{ title }}
  </div>
  <div class="mb-12 flex w-full flex-col gap-8" @click="onClick">
    <AccordionItem
      v-for="(item, index) in data"
      :key="index"
      :title="item.title"
      :text="item.text"
    />
  </div>
</template>
