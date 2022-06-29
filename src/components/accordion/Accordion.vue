<script setup>
import AccordionItem from "./AccordionItem.vue";
import { useI18n } from "vue-i18n";

const { tm } = useI18n();
</script>

<template>
  <div class="flex w-full flex-col gap-8" @click="onClick">
    <div class="text-2xl font-bold text-[#1E398F]">{{ tm("faq.title") }}</div>
    <AccordionItem
      v-for="(item, index) in tm('faq.accordion')"
      :key="index"
      :title="$t(item.title)"
      :text="$t(item.text)"
    />
  </div>
</template>
