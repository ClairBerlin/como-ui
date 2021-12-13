<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ExclamationIcon } from "@heroicons/vue/outline";
import InstallationCard from "@/components/InstallationCard.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import dayjs from "dayjs";

const route = useRoute();
const store = useStore();
const isLoading = ref(true);

// This view is routed to in an organization context only, this orgId is defined.
const currentOrgId = computed(() => route.params.orgId);
onMounted(async () => update());
watch(currentOrgId, () => update());
const installations = ref(undefined);

const activeInstallations = computed(() =>
  installations.value?.filter(
    (inst) =>
      inst.from_timestamp_s <= inst.query_timestamp_s &&
      inst.to_timestamp_s >= inst.query_timestamp_s
  )
);

const hasActiveSensors = computed(() => {
  if (activeInstallations?.value?.length) {
    return true;
  } else {
    return false;
  }
});

const isRecent = (sample) => {
  return dayjs().diff(dayjs.unix(sample.timestamp_s), "minute") < 30;
};

const getLatestMeasurement = (sample) => {
  if (sample && isRecent(sample) && sample.co2_ppm) {
    return sample.co2_ppm.toString();
  }
  return undefined;
};

const update = async () => {
  isLoading.value = true;
  const instObj = await store.dispatch("jv/get", [
    "installations",
    { params: { "filter[organization]": currentOrgId.value } },
  ]);
  const instList = Object.entries(instObj);
  installations.value = instList.map(([, inst]) => inst);
  const relatedResourcePromises = instList.map(([instId, inst]) => {
    console.log(`Get related objects for installation ${instId}.`);
    return store
      .dispatch("jv/getRelated", `installations/${instId}`)
      .then(() => {
        // At this point vuex-jsonapi has fetched the room object in inst.room, if any
        if (typeof inst.room === "object") {
          store.dispatch("jv/getRelated", `rooms/${inst.room._jv.id}`);
        }
      });
  });
  await Promise.all(relatedResourcePromises);
  isLoading.value = false;
};
</script>

<template>
  <!-- TODO: replace with a spinner or another indication of loading data (e.g. skeleton) -->
  <LoadingSpinner v-if="isLoading" />
  <div v-else class="mx-2">
    <h2 class="font-bold text-xl mt-8">{{ $t("Active Installations") }}</h2>
    <div class="">
      <div v-if="hasActiveSensors">
        <ul
          role="list"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          <li
            v-for="inst in activeInstallations"
            :key="inst._jv.id"
            class="col-span-1 mt-4"
          >
            <InstallationCard
              :installation-id="inst._jv.id"
              :sensor-name="inst.node?.alias || inst.node?.eui64"
              :sensor-id="inst.node._jv.id"
              :room-name="inst.room?.name"
              :room-id="inst.room._jv.id"
              :is-public="inst?.is_public"
              :latest-measurement="getLatestMeasurement(inst?.latest_sample)"
            />
          </li>
        </ul>
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
            <ExclamationIcon
              class="h-5 w-5 text-yellow-400"
              aria-hidden="true"
            />
          </div>
          <div class="ml-3">
            {{ $t("org.noInstallations") }}
            {{ " " }}
            <!-- TODO: use :to="{ name: 'installation-add' }" -->
            <router-link
              to="#"
              class="
                font-medium
                underline
                text-yellow-700
                hover:text-yellow-600
              "
            >
              Click here to add one
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
