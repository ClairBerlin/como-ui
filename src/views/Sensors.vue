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
  <div class="bg-white shadow-md rounded-md p-2">
    <div
      class="
        max-w-screen-xl
        px-4
        py-12
        mx-auto
        sm:px-6
        lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between
      "
    >
      <h2
        class="
          text-3xl
          font-extrabold
          leading-9
          tracking-tight
          text-gray-900
          sm:text-4xl sm:leading-10
        "
      >
        Sensors
      </h2>
    </div>
    <div>
      This view will provide an overview of all sensors that belong to the
      selected organization, their make and type, the current installation (with
      a link to the inspection views of the room and the sensor installation),
      historical installations, and actions to register a new sensor with The
      Things Network and to completely remove a sensor both from the COMo stack
      and from The Things Network.
    </div>
    <div v-if="hasSensors">
      Sites:
      <ul id="sensor-list">
        <li v-for="sensor in sensors" :key="sensor._jv.id">
          Alias: {{ sensor.alias }}, Description: {{ sensor.description }}, ID:
          {{ sensor._jv.id }}, Device-EUI: {{ sensor.eui64 }}, Manufacturer:
          {{ sensor.model.manufacturer }}, Model: {{ sensor.model.trade_name }},
          Sensor Element: {{ sensor.model.sensor_type }}
          <router-link
            :to="{
              name: 'sensor',
              params: { sensorId: sensor._jv.id },
            }"
            >Inspect and modify sensor</router-link
          >
        </li>
      </ul>
    </div>
  </div>
</template>
