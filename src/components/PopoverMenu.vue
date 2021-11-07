<script setup>
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "@heroicons/vue/solid";

const props = defineProps({
  icon: { type: Function, default: undefined },
  title: { type: String, required: true },
  contextTitle: { type: String, default: "" },
  popOverAbove: { type: Boolean, default: false },
  options: { type: Array, required: true },
});
</script>

<template>
  <div class="w-full">
    <Popover v-slot="{ open }" class="relative">
      <PopoverButton
        :class="open ? '' : 'text-opacity-90'"
        class="
          w-full
          inline-flex
          items-center
          px-2
          py-4
          text-sm
          font-medium
          text-black
          bg-orange-700
          rounded-md
          group
          hover:text-opacity-100 hover:bg-gray-100
          como-focus
          justify-between
        "
      >
        <div class="flex">
          <component
            v-if="icon"
            :is="icon"
            :class="[
              'text-gray-500 group-hover:text-gray-600',
              'mr-3 flex-shrink-0 h-6 w-6',
            ]"
            aria-hidden="true"
          />
          <span class="text-left">{{ title }}</span>
        </div>
        <component
          :is="popOverAbove ? ChevronUpIcon : ChevronDownIcon"
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
        <PopoverPanel
          :class="[
            popOverAbove ? 'top-[-9rem]' : 'top-16',
            'w-full absolute z-10',
          ]"
          v-slot="{ close }"
        >
          <div class="shadow-lg rounded-lg ring-1 ring-gray-300">
            <div class="relative bg-white text-xs rounded-lg">
              <div class="flex items-center pl-4 pr-2 py-2 justify-between">
                <div class="font-semibold text-gray-500">
                  {{ contextTitle }}
                </div>
                <XIcon
                  class="h-4 w-4 text-gray-600 cursor-pointer"
                  @click="close"
                />
              </div>
              <router-link
                v-for="item in options"
                :key="item.name"
                :to="{
                  name: item.route,
                  params: item.params,
                }"
                @click="close"
                class="
                  flex
                  items-center
                  px-4
                  py-2
                  transition
                  duration-150
                  ease-in-out
                  hover:bg-gray-100
                  como-focus
                  border-t border-gray-200
                  cursor-pointer
                "
              >
                <div class="flex">
                  <component
                    v-if="item.icon"
                    :is="item.icon"
                    class="
                      text-gray-500
                      group-hover:text-gray-600
                      mr-2
                      flex-shrink-0
                      h-4
                      w-4
                    "
                    aria-hidden="true"
                  />
                  <div v-else class="w-6" />
                  <p class="font-medium text-gray-900 whitespace-nowrap">
                    {{ item.name }}
                  </p>
                </div>
              </router-link>
            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>
