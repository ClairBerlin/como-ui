<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { ExclamationIcon } from "@heroicons/vue/outline";

const route = useRoute();
const store = useStore();

// This view is routed to in an organization context only, this orgId is defined.
const currentOrgId = computed(() => route.params.orgId);
const sensors = ref(undefined);

const hasSensors = computed(() => sensors.value?.length > 0);
const isLoading = ref(true);

async function update() {
  isLoading.value = true;
  const sensorObj = await store.dispatch("jv/get", [
    "nodes",
    { params: { "filter[organization]": currentOrgId.value } },
  ]);
  const sensorList = Object.entries(sensorObj);
  console.log(`Organization has ${sensorList.length} sensor(s).`);
  sensors.value = sensorList.map(([_, sensor]) => sensor);
  const relatedResourcePromises = sensorList.map(([sensorId, _]) => {
    console.log(`Fetch related objects for sensor ${sensorId}.`);
    return store.dispatch("jv/getRelated", `nodes/${sensorId}`);
  });
  await Promise.all(relatedResourcePromises);
  isLoading.value = false;
}

onMounted(async () => update());
watch(currentOrgId, () => update());
</script>

<template>
  <div v-if="isLoading">{{ $t("loading...") }}</div>
  <div
    v-else-if="hasSensors"
    class="
      ring-1 ring-gray-300
      rounded-md
      bg-white
      text-md
      overflow-hidden
      mt-8
    "
  >
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="
              px-2
              sm:px-6
              py-3
              text-left text-xs
              font-medium
              text-gray-500
              tracking-wider
            "
          >
            {{ $t("node.name") }}
          </th>
          <th
            scope="col"
            class="
              sm:px-6
              py-3
              text-left text-xs
              font-medium
              text-gray-500
              tracking-wider
              hidden
              md:table-cell
            "
          >
            {{ $t("node.identifier") }}
          </th>
          <th
            scope="col"
            class="
              sm:px-6
              py-3
              text-left text-xs
              font-medium
              text-gray-500
              tracking-wider
            "
          >
            {{ $t("action") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(sensor, sensorIdx) in sensors"
          :key="sensor._jv.id"
          :class="[sensorIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
        >
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            {{ sensor.alias }}
          </td>
          <td class="hidden md:table-cell px-2 sm:px-6 py-4 whitespace-nowrap">
            <pre class="">{{ sensor._jv.id }}</pre>
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-row">
              <router-link
                class="gray-button"
                :to="{
                  name: 'sensor',
                  params: { sensorId: sensor._jv.id },
                }"
                >{{ $t("inspect") }}</router-link
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div
    v-else
    class="
      shadow-md
      mt-4
      rounded-md
      max-w-sm
      flex
      items-center
      bg-yellow-50
      border-l-4 border-yellow-400
      p-4
    "
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <ExclamationIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
      </div>
      <div class="ml-3">
        {{ $t("node.noNodes") }} {{ " " }}
        <!-- TODO: use :to="{ name: 'sensors-add' }" -->
        <router-link
          to="#"
          class="font-medium underline text-yellow-700 hover:text-yellow-600"
        >
          {{ $t("node.addNode") }}.
        </router-link>
      </div>
    </div>
  </div>
</template>
