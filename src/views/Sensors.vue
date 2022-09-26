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
  <div v-else-if="hasSensors" class="mt-4">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">
          {{ $t("sensor.title") }}
        </h1>
        <p class="max-w-md mt-2 text-sm text-gray-700">
          {{ $t("sensor.description") }}
          <a
            href="mailto:info@como-berlin.de"
            class="font-medium text-gray-700 underline hover:text-gray-600"
          >
            info@como-berlin.de
          </a>
        </p>
      </div>
    </div>

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div
            class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-md"
          >
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50 text-sm font-medium text-gray-900">
                <tr>
                  <th scope="col" class="px-2 py-3 text-left sm:px-6">
                    {{ $t("node.name") }}
                  </th>
                  <th scope="col" class="py-3 text-left sm:px-6">
                    {{ $t("node.identifier") }}
                  </th>
                  <th scope="col" class="py-3 text-left sm:px-6">
                    {{ $t("node.model") }}
                  </th>
                  <th scope="col" class="px-2 py-3 text-right sm:px-6">
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
                  <td class="whitespace-nowrap py-4 sm:px-6">
                    <pre class="">{{ sensor._jv.id }}</pre>
                  </td>
                  <td class="whitespace-nowrap py-4 sm:px-6">
                    {{ sensor.model.trade_name }}
                  </td>
                  <td class="whitespace-nowrap px-2 py-4 text-right sm:px-6">
                    {{ sensor.sample_count }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="max-w-sm mt-4 flex items-center rounded-sm border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow-md"
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
