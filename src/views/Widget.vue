<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import ComoLogo from "@/assets/como-logo.svg";
import FreshAirMedal from "@/components/widget/FreshAirMedal.vue";
import InstallationSwitch from "@/components/widget/InstallationSwitch.vue";
import CurrentMeasurement from "@/components/widget/CurrentMeasurement.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { isInstallationActive } from "@/utils";

const route = useRoute();
const isLoading = ref(false);
const store = useStore();
const widgetData = ref([]);

onMounted(async () => {
  isLoading.value = true;
  const siteId = route.params.siteId;
  const siteData = await store.dispatch("jv/get", `sites/${siteId}`);
  const roomsResponse = await store.dispatch("jv/get", `sites/${siteId}/rooms`);
  const promise = Object.entries(roomsResponse).map(
    async ([roomId, roomData]) => {
      const installationsResponse = await store.dispatch(
        "jv/get",
        `rooms/${roomId}/installations`
      );
      Object.entries(installationsResponse).map(([instId, instData]) => {
        if (instData?.is_public && isInstallationActive(instData)) {
          widgetData.value.push({
            roomId,
            site: siteData,
            room: roomData,
            installationId: instId,
            installation: instData,
          });
        }
      });
    }
  );
  await Promise.all(promise);
  isLoading.value = false;
});

const current = ref(1);
const isFresh = ref(false);

const prev = () => {
  if (current.value - 1 <= 0) {
    current.value = widgetData.value.length;
  } else {
    current.value -= 1;
  }
};
const next = () => {
  if (current.value + 1 > widgetData.value.length) {
    current.value = 1;
  } else {
    current.value += 1;
  }
};
</script>

<template>
  <div
    v-if="isLoading"
    class="mx-auto flex min-h-[359px] max-w-[359px] flex-col items-center justify-center gap-6 rounded-lg bg-white p-4"
  >
    <LoadingSpinner additional-classes="border-[#1e398f]" />
  </div>
  <div
    v-else-if="widgetData.length === 0"
    class="flex justify-center font-semibold"
  >
    Keine Daten vorhanden.
  </div>
  <div
    class="mx-auto flex max-w-[359px] flex-col items-center gap-6 rounded-lg bg-white p-4"
    v-else
  >
    <img class="mt-6 h-12 w-auto" :src="ComoLogo" alt="COMo Logo" />
    <div class="mt-[-12px] mb-4 text-[#7886C2]">
      <div class="flex gap-2">
        <svg
          width="18"
          height="24"
          viewBox="0 0 18 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.57147 0C3.20402 0 0 3.52459 0 9.42862C0 15.8692 7.64575 23.4361 7.97147 23.755C8.13169 23.912 8.34711 24 8.57147 24C8.79583 24 9.01125 23.912 9.17148 23.755C9.49719 23.4361 17.1429 15.8692 17.1429 9.42862C17.1429 3.52459 13.9389 0 8.57147 0ZM8.57147 12.0001C7.72383 12.0001 6.89523 11.7487 6.19044 11.2778C5.48566 10.8069 4.93635 10.1375 4.61197 9.3544C4.28759 8.57129 4.20272 7.70957 4.36808 6.87822C4.53345 6.04687 4.94163 5.28322 5.541 4.68385C6.14037 4.08448 6.90402 3.6763 7.73537 3.51094C8.56672 3.34557 9.42844 3.43044 10.2116 3.75482C10.9947 4.0792 11.664 4.62851 12.1349 5.3333C12.6059 6.03808 12.8572 6.86669 12.8572 7.71432C12.8558 8.85056 12.4039 9.93986 11.6004 10.7433C10.797 11.5467 9.7077 11.9987 8.57147 12.0001Z"
            fill="currentColor"
          />
        </svg>

        <div class="text-lg font-bold">
          {{ widgetData[current - 1].site.name }}
        </div>
      </div>
    </div>
    <CurrentMeasurement
      :ppm="widgetData[current - 1].installation?.latest_sample?.co2_ppm"
      :timestamp="
        new Date(
          widgetData[current - 1].installation?.latest_sample?.timestamp_s *
            1000
        )
      "
    />
    <FreshAirMedal v-if="isFresh" />
    <InstallationSwitch
      :number-of-installations="widgetData.length"
      :current-installation="current"
      :room-name="widgetData[current - 1].room.name"
      @previous="prev"
      @next="next"
    />
  </div>
</template>
