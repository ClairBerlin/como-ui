<script setup>
import { ref } from "vue";

const isOpen = ref(false);
const panel = ref(null);

defineProps({
  title: { type: String, required: true },
  text: { type: String, required: true },
});

const switchOpen = () => {
  isOpen.value = !isOpen.value;
};

const onKeyDown = (e) => {
  if ((e.key === "Space") | (e.key === "Enter")) {
    switchOpen();
  }
};
</script>

<template>
  <div>
    <div
      class="flex cursor-pointer items-center justify-between py-4"
      @click="switchOpen"
      @keydown="(e) => onKeyDown(e)"
      role="button"
      tabindex="0"
    >
      <p class="font-bold text-[#3B3B3A]">{{ title }}</p>
      <div class="mr-5 flex h-5 w-5 items-center sm:mr-10">
        <div class="absolute h-0.5 w-5 rounded bg-black"></div>
        <div
          :class="[
            'absolute h-0.5 w-5 rounded bg-black duration-300 ease-in-out',
            isOpen ? 'rotate-0' : 'rotate-90',
          ]"
        ></div>
      </div>
    </div>
    <div
      :class="[
        'h-0.5 bg-[#DADADA] duration-150 ease-in-out',
        isOpen ? 'w-0' : 'w-full',
      ]"
    />
    <div
      :class="['overflow-hidden duration-300 ease-in-out']"
      :style="{ 'max-height': [isOpen ? `${panel.clientHeight}px` : 0] }"
    >
      <div ref="panel" class="mr-5 sm:mr-10" v-html="text" />
    </div>
  </div>
</template>
