<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import dayjs from "dayjs";
import "dayjs/locale/de";
// TODO: update locale when language is changed via UI
dayjs.locale("de");

const route = useRoute();
const store = useStore();

const currentOrgId = computed(() => {
  return route.params.orgId ? route.params.orgId : 0;
});

const installations = ref(undefined);

const activeInstallations = computed(() =>
  installations.value?.map((inst) => {
    if (
      inst.from_timestamp_s <= inst.query_timestamp_s &&
      inst.to_timestamp_s >= inst.query_timestamp_s
    ) {
      return inst;
    }
  })
);

const hasActiveSensors = computed(() => {
  if (activeInstallations?.value?.length) {
    return true;
  } else {
    return false;
  }
});

async function update() {
  const instObj = await store.dispatch("jv/get", [
    "installations",
    { params: { "filter[organization]": currentOrgId.value } },
  ]);
  const instList = Object.entries(instObj);
  installations.value = instList.map(([_, inst]) => inst);
  const relatedResourcePromises = instList.map(([instId, inst]) => {
    console.log(`Get related objects for installation ${instId}.`);
    return store
      .dispatch("jv/getRelated", `installations/${instId}`)
      .then(() => {
        // At this point vuex-jsonapi has fetched the room object in inst.room
        store.dispatch("jv/getRelated", `rooms/${inst.room._jv.id}`);
      });
  });
  await Promise.all(relatedResourcePromises);
}

onMounted(async () => update());

watch(currentOrgId, () => update());
</script>

<template>
  <div class="bg-gray-50">
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
        Overview
      </h2>
    </div>
    <div>
      This view will provide the latest sensor readings at a glance for all
      sites, rooms, and installations of an organization. For example, as a list
      with all installations, a traffic-light display and the latest sensor
      reading, plus links to the corresponding detail view.
    </div>
    <div v-if="hasActiveSensors">
      Active Installations:
      <ul id="sensor-list">
        <li v-for="inst in activeInstallations" :key="inst._jv.id">
          ID: {{ inst._jv.id }}, Description: {{ inst.description }}, from
          {{ dayjs.unix(inst.from_timestamp_s).format("YYYY-MM-DD") }}}, sensor:
          {{ inst?.node.alias }}, room: {{ inst?.room.name }}, site:
          {{ inst?.room?.site.name }},
          <router-link
            :to="{
              name: 'installation',
              params: { installationId: inst._jv.id },
            }"
            >View CO2 concentration</router-link
          >
        </li>
      </ul>
    </div>
  </div>
</template>
