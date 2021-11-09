<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

// This view is routed to in an organization context only, this orgId is defined.
const currentOrgId = computed(() => route.params.orgId);
const sensors = ref(undefined);

const hasSensors = computed(() => sensors.value?.length > 0);

async function update() {
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
}

onMounted(async () => update());
watch(currentOrgId, () => update());
</script>

<template>
  <div class="bg-white shadow-md p-4 rounded-md max-w-xl mx-auto">
    <pre>VIEW DESCRIPTION (will be removed)</pre>
    This view will provide an overview of all sensors that belong to the
    selected organization, their make and type, the current installation (with a
    link to the inspection views of the room and the sensor installation),
    historical installations, and actions to register a new sensor with The
    Things Network and to completely remove a sensor both from the COMo stack
    and from The Things Network.
  </div>
  <div class="ring-1 ring-gray-300 rounded-md bg-white text-md overflow-hidden">
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
            Sensor Name
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
              sm:table-cell
            "
          >
            Sensor Identifier
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
              sm:table-cell
            "
          >
            Action
          </th>
        </tr>
      </thead>
      <tbody v-if="hasSensors">
        <tr
          v-for="(sensor, sensorIdx) in sensors"
          :key="sensor._jv.id"
          :class="[sensorIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
        >
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            {{ sensor.alias }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            {{ sensor._jv.id }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-row">
              <router-link
                class="gray-button"
                :to="{
                  name: 'sensor',
                  params: { sensorId: sensor._jv.id },
                }"
                >Inspect</router-link
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
