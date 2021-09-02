<template>
  <div
    class="
      shadow-modal
      w-full
      z-50
      flex flex-col
      bg-white
      font-normal
      rounded
      text-gray-800
    "
    ref="menuRef"
  >
    <Transition
      :show="isOpen"
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition easy-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <div>
        <div class="flex items-center h-8 px-3 hover:bg-gray-100">
          View profile
        </div>
        <div class="flex items-center h-8 px-3 hover:bg-gray-100">Settings</div>
        <div class="w-full px-3 my-1 border-b border-gray-200"></div>
        <div class="flex items-center h-8 px-3 hover:bg-gray-100">
          Changelog
        </div>
        <div class="flex items-center h-8 px-3 hover:bg-gray-100">
          Help & Support
        </div>
        <div class="flex items-center h-8 px-3 hover:bg-gray-100">API</div>
        <div class="w-full px-3 my-1 border-b border-gray-200"></div>
        <div class="flex items-center h-8 px-3 hover:bg-gray-100">Logout</div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";
// TODO: refactor and use https://headlessui.dev/vue/menu
export default {
  components: {},
  props: { isOpen: Boolean },
  setup(props, { emit }) {
    const menuRef = ref(null);
    onClickOutside(menuRef, (e) => emit("closeProfile"));
    return { menuRef };
  },
};
</script>
