<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { ExclamationIcon } from "@heroicons/vue/outline";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const store = useStore();

const isLoading = computed(() => {
  return store.getters["nav/isOrgContextLoading"];
});

const sensors = computed(() => {
  return store.getters["nav/getSensors"];
});

const hasSensors = computed(() => sensors.value?.length > 0);
</script>

<template>
  <LoadingSpinner v-if="isLoading" />
  <div
    v-else-if="hasSensors"
    class="text-md mt-8 overflow-hidden rounded-sm bg-white ring-1 ring-gray-300"
  >
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6"
          >
            {{ $t("node.name") }}
          </th>
          <th
            scope="col"
            class="hidden py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6 xl:table-cell"
          >
            {{ $t("node.identifier") }}
          </th>
          <th
            scope="col"
            class="hidden py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:table-cell sm:px-6"
          >
            {{ $t("node.model") }}
          </th>
          <th
            scope="col"
            class="px-2 py-3 text-right text-xs font-medium tracking-wider text-gray-500 sm:px-6"
          >
            {{ $t("node.sampleCount") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(sensor, sensorIdx) in sensors"
          :key="sensor._jv.id"
          :class="[sensorIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
        >
          <td class="whitespace-nowrap px-2 py-4 sm:px-6">
            <router-link
              class="como-link"
              :to="{
                name: 'sensor',
                params: { sensorId: sensor._jv.id },
              }"
            >
              {{ sensor.alias }}
            </router-link>
          </td>
          <td class="hidden whitespace-nowrap py-4 sm:px-6 xl:table-cell">
            <pre class="">{{ sensor._jv.id }}</pre>
          </td>
          <td class="hidden whitespace-nowrap py-4 sm:table-cell sm:px-6">
            {{ sensor.model.trade_name }}
          </td>
          <td class="whitespace-nowrap px-2 py-4 text-right sm:px-6">
            {{ sensor.sample_count }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div
    v-else
    class="mt-4 flex max-w-sm items-center rounded-sm border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow-md"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <ExclamationIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
      </div>
      <div class="ml-3">
        {{ $t("node.noNodes") }} {{ " " }}
        {{ $t("contactSupportToGetSensors") }} {{ " " }}
        <a
          href="mailto:info@como-berlin.de"
          class="font-medium text-yellow-700 underline hover:text-yellow-600"
        >
          info@como-berlin.de
        </a>
      </div>
    </div>
  </div>
</template>
