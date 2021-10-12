<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
const props = defineProps({
  icon: { type: Function, default: undefined },
  buttonText: { type: String, default: undefined },
  options: { type: Array, required: true },
});
</script>

<template>
  <Menu>
    <MenuButton
      ><component v-if="icon" :is="icon" class="h-5 w-5" />
      <div v-else>{{ buttonText }}</div></MenuButton
    >
    <MenuItems>
      <MenuItem v-for="option in options" :key="option.href">
        <router-link :to="option.href">{{ option.title }}</router-link>
      </MenuItem>
    </MenuItems>
  </Menu>
</template>
