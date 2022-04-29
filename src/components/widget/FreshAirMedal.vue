<script setup>
import medal from "@/assets/fresh-air-medal.svg";
</script>

<template>
  <div
    class="flex max-w-[327px] flex-col items-center gap-2 rounded bg-[#F1F9FE] px-6 pt-7 pb-4 drop-shadow-sm"
  >
    <img class="mb-4 h-12 w-12" :src="medal" alt="Frischluft Medaille" />
    <div class="mx-0 text-lg font-bold text-[#1E398F]">Frischluft Medaille</div>
    <div class="font-medium text-[#3B3B3A]">
      Unsere Langzeitmessungen zeigen, dass an diesem Ort regelmäßig und
      ausreichend gelüftet wird. Es kann aufgeatmet werden!
    </div>
  </div>
</template>
