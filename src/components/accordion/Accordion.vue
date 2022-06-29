<script setup>
import AccordionItem from "./AccordionItem.vue";
const persons = ["1", "2", "3"];
</script>

<template>
  <div class="w-full">
    <div class="text-2xl font-bold text-[#1E398F]">Lorem Ipsum</div>
    <AccordionItem v-for="(person, index) in persons" :key="index" />
  </div>
</template>
