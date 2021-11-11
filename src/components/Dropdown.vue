<script setup>
const props = defineProps({
  icon: { type: Function, default: undefined },
  buttonText: { type: String, default: undefined },
  options: { type: Array, required: true },
});
</script>

<template>
  <div class="dropdown dropdown-end text-gray-900">
    <div tabindex="0" class="m-1 btn gray-button">
      <component v-if="icon" :is="icon" class="h-5 w-5" />
      <div v-else>{{ buttonText }}</div>
    </div>

    <ul
      tabindex="0"
      class="
        shadow-lg
        rounded-md
        menu
        dropdown-content
        w-52
        ring-1 ring-gray-200
        bg-white
        text-xs
      "
    >
      <li
        v-for="option in options"
        :key="option.href"
        class="
          font-medium
          hover:bg-gray-50
          border-b border-gray-200
          last:border-none
          como-focus
        "
      >
        <router-link :to="option.href">{{ $t(option.title) }}</router-link>
      </li>
    </ul>
  </div>
</template>
