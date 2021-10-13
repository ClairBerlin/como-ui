<script setup>
const props = defineProps({
  icon: { type: Function, default: undefined },
  buttonText: { type: String, default: undefined },
  options: { type: Array, required: true },
});
</script>

<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" class="m-1 btn">
      <component v-if="icon" :is="icon" class="h-5 w-5" />
      <div v-else>{{ buttonText }}</div>
    </div>

    <ul
      tabindex="0"
      class="p-2 shadow menu dropdown-content bg-base-content rounded-box w-52"
    >
      <li
        v-for="option in options"
        :key="option.href"
        class="rounded hover:bg-gray-300"
      >
        <router-link :to="option.href">{{ option.title }}</router-link>
      </li>
    </ul>
  </div>
</template>
