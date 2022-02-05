<script setup>
defineProps({
  icon: { type: Function, default: undefined },
  buttonText: { type: String, default: undefined },
  options: { type: Array, required: true },
});
</script>

<template>
  <div class="dropdown-end dropdown text-gray-900">
    <div tabindex="0" class="gray-button btn m-1">
      <component v-if="icon" :is="icon" class="h-5 w-5" />
      <div v-else>{{ buttonText }}</div>
    </div>

    <ul
      tabindex="0"
      class="dropdown-content menu w-52 rounded-md bg-white text-xs shadow-lg ring-1 ring-gray-200"
    >
      <li
        v-for="option in options"
        :key="option.href"
        class="como-focus border-b border-gray-200 font-medium last:border-none hover:bg-gray-50"
      >
        <router-link :to="option.href">{{ $t(option.title) }}</router-link>
      </li>
    </ul>
  </div>
</template>
