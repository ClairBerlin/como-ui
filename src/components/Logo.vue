<template>
  <div class="flex items-center flex-shrink-0 px-4 py-0.5 mb-4">
    <img class="h-12 w-auto px-4" :src="logo" alt="COMo logo" />
    <div class="text-xl text-black font-bold">
      CO<sub>2</sub> <br />Monitoring
    </div>
  </div>
</template>

<script>
import logo from "@/assets/logo.svg";
export default {
  setup() {
    return { logo };
  },
};
</script>
