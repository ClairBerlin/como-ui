<template>
  <div class="w-full">
    <Popover v-slot="{ open }" class="relative">
      <PopoverButton
        :class="open ? '' : 'text-opacity-90'"
        class="
          inline-flex
          items-center
          p-2
          text-sm
          font-medium
          text-black
          bg-orange-700
          rounded-md
          group
          hover:text-opacity-100 hover:bg-gray-100
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-black
          focus-visible:ring-opacity-75
        "
      >
        <component
          v-if="icon"
          :is="icon"
          :class="[
            'text-gray-400 group-hover:text-gray-500',
            'mr-3 flex-shrink-0 h-6 w-6',
          ]"
          aria-hidden="true"
        />
        <span class="text-left">{{ title }}</span>
        <ChevronDownIcon
          :class="open ? '' : 'text-opacity-70'"
          class="
            w-5
            h-5
            ml-2
            transition
            duration-150
            ease-in-out
            group-hover:text-opacity-80
          "
          aria-hidden="true"
        />
      </PopoverButton>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <PopoverPanel class="w-auto absolute z-10" v-slot="{ close }">
          <div class="shadow-lg ring-1 ring-black ring-opacity-5">
            <div class="relative bg-white rounded-md">
              <a
                v-for="item in options"
                :key="item.name"
                :href="item.href"
                @click="
                  () => {
                    item.onClick();
                    close();
                  }
                "
                class="
                  flex
                  items-center
                  p-4
                  transition
                  duration-150
                  ease-in-out
                  rounded-md
                  hover:bg-gray-100
                  focus:outline-none
                  focus-visible:ring
                  focus-visible:ring-orange-500
                  focus-visible:ring-opacity-50
                "
              >
                <div class="">
                  <p
                    class="text-sm font-medium text-gray-900 whitespace-nowrap"
                  >
                    {{ item.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ item.description }}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>

<script>
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/solid";

export default {
  components: {
    Popover,
    PopoverButton,
    PopoverPanel,
    ChevronDownIcon,
  },
  props: {
    icon: { type: Function, default: undefined },
    title: { type: String, required: true },
    options: { type: Array, required: true },
  },
  setup() {
    return {};
  },
};
</script>
