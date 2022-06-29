<script setup>
import { ref } from "vue";
const isOpen = ref(false);

const switchOpen = () => {
  console.log("click");
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="{cn.clickable}" :click="switchOpen">
    <p class="{cn.title}">Title</p>
    <div class="flex h-5 w-5 items-center">
      <div class="absolute h-1 w-5 bg-black"></div>
      <div
        :class="[
          'bg-black duration-300 ease-in-out',
          isOpen ? 'rotate-0' : 'rotate-90',
        ]"
      ></div>
    </div>
  </div>
  <div :class="['overflow-hidden', isOpen ? 'max-h-max' : 'max-h-0']">
    <div ref="{panelEl}" class="{cn.paragraph}">Dummy Text</div>
  </div>
</template>
