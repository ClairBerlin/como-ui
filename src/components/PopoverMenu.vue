<script setup>
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
} from "@heroicons/vue/solid";

defineProps({
  icon: { type: Function, default: undefined },
  title: { type: String, required: true },
  contextTitle: { type: String, default: "" },
  popOverAbove: { type: Boolean, default: false },
  options: { type: Array, required: true },
});

const iconClasses = () =>
  `text-gray-500 group-hover:text-gray-600 mr-2 flex-shrink-0 h-4 w-4`;
</script>

<template>
  <div class="w-full">
    <Popover v-slot="{ open }" class="relative">
      <PopoverButton
        :class="open ? '' : 'text-opacity-90'"
        class="group como-focus inline-flex w-full items-center justify-between rounded-md px-2 py-4 text-sm font-medium text-black hover:bg-gray-100 hover:text-opacity-100"
      >
        <div class="flex items-center">
          <component
            v-if="icon"
            :is="icon"
            :class="[
              'text-gray-500 group-hover:text-gray-600',
              'mr-3 h-6 w-6 flex-shrink-0',
            ]"
            aria-hidden="true"
          />
          <span class="text-left">{{ title }}</span>
        </div>
        <component
          :is="popOverAbove ? ChevronUpIcon : ChevronDownIcon"
          :class="open ? '' : 'text-opacity-70'"
          class="ml-2 h-5 w-5 transition duration-150 ease-in-out group-hover:text-opacity-80"
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
            'absolute z-10 w-full',
          ]"
          v-slot="{ close }"
        >
          <div class="rounded-lg shadow-lg ring-1 ring-gray-300">
            <div class="relative rounded-lg bg-white text-xs">
              <div class="flex items-center justify-between py-2 pl-4 pr-2">
                <div class="font-semibold text-gray-500">
                  {{ $t(contextTitle) }}
                </div>
                <XIcon
                  class="h-4 w-4 cursor-pointer text-gray-600"
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
                class="como-focus flex cursor-pointer items-center border-t border-gray-200 px-4 py-2 transition duration-150 ease-in-out last:rounded-b-md hover:bg-gray-100"
              >
                <div class="flex">
                  <CheckIcon :class="iconClasses()" v-if="item.selected" />
                  <component
                    v-else-if="item.icon"
                    :is="item.icon"
                    :class="iconClasses()"
                    aria-hidden="true"
                  />
                  <div v-else class="w-6" />
                  <p class="whitespace-nowrap font-medium text-gray-900">
                    {{ item?.icon ? $t(item.name) : item.name }}
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
