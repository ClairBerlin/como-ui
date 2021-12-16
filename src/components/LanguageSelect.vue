<script setup>
import { ref, watchEffect } from "vue";
import Cookies from "js-cookie";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  ListboxLabel,
} from "@headlessui/vue";

import dayjs from "dayjs";
import "dayjs/locale/de";
import "dayjs/locale/en";
import "dayjs/locale/tr";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/outline";
import { useI18n } from "vue-i18n";

const PREFERRED = "preferredlanguage";
const languages = [
  {
    id: 1,
    name: "Deutsch - DE",
    short: "🇩🇪",
    locale: "de",
    unavailable: false,
  },
  {
    id: 2,
    name: "English - EN",
    short: "🇬🇧",
    locale: "en",
    unavailable: false,
  },
  {
    id: 3,
    name: "Türkçe - TR",
    short: "🇹🇷",
    locale: "tr",
    unavailable: true,
  },
];

const { locale } = useI18n({ useScope: "global" });

const updateLocale = (newLocale) => {
  Cookies.set(PREFERRED, newLocale);
  locale.value = newLocale;
  dayjs.locale(newLocale);
};
const preferredlanguage =
  languages.find((l) => l.locale === Cookies.get(PREFERRED)) || languages[0];
const selectedLanguage = ref(preferredlanguage);
watchEffect(() => updateLocale(selectedLanguage.value.locale));
</script>

<template>
  <Listbox as="div" v-model="selectedLanguage">
    <ListboxLabel class="block text-sm font-medium text-gray-700">
    </ListboxLabel>
    <div class="relative">
      <ListboxButton
        class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <span class="w-full inline-flex truncate font-medium text-gray-700">
          <span class="truncate">{{ selectedLanguage.short }}</span>
          <span class="ml-3 truncate">{{ selectedLanguage.name }}</span>
        </span>
        <span
          class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
        >
          <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          <ListboxOption
            as="template"
            v-for="l in languages"
            :key="l.id"
            :value="l"
            v-slot="{ active, selected }"
            :disabled="l.unavailable"
          >
            <li
              :class="[
                active
                  ? 'text-white bg-indigo-500 font-medium'
                  : 'text-gray-900',
                'cursor-default select-none relative py-2 pl-3 pr-9',
              ]"
            >
              <div class="flex">
                <span
                  :class="[
                    selected ? 'font-semibold' : 'font-normal',
                    'truncate',
                  ]"
                >
                  {{ l.short }}
                </span>
                <span
                  :class="[
                    active
                      ? 'text-white'
                      : l.unavailable
                      ? 'text-gray-400'
                      : 'text-gray-700',
                    'ml-2 truncate',
                  ]"
                >
                  {{ l.name }}
                </span>
              </div>

              <span
                v-if="selected"
                :class="[
                  active ? 'text-white' : 'text-indigo-600',
                  'absolute inset-y-0 right-0 flex items-center pr-4',
                ]"
              >
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
