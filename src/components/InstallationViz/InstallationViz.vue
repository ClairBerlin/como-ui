<script setup>
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import DayjsMinMax from "dayjs/plugin/minMax";
import utc from "dayjs/plugin/utc";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/solid";

import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
import Co2Graph from "./Co2Graph.vue";
import CurrentMeasurement from "@/components/widget/CurrentMeasurement.vue";
import FreshAirMedal from "@/components/widget/FreshAirMedal.vue";
import { EyeIcon, EyeOffIcon } from "@heroicons/vue/outline";

dayjs.extend(DayjsMinMax);
dayjs.extend(utc);

const store = useStore();

const selectedTab = ref(0);
const samplePool = ref([]);
const { t } = useI18n();

// The window of sample data to display is taken relative to this day
const referenceDay = ref(dayjs().utc().startOf("day"));

const props = defineProps({
  installationId: { type: String, required: true },
});

const installation = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Installation", id: props.installationId },
  })
);

const room = ref();
const roomName = computed(() => room.value?.name);

const loadRoom = async () => {
  return await store.dispatch(
    "jv/get",
    `installations/${props.installationId}/room`,
    { root: true }
  );
};

const loadInstallation = async () => {
  return await store.dispatch(
    "jv/get",
    `installations/${props.installationId}`,
    { root: true }
  );
};

const loadSamples = async (from, to) => {
  const params = {
    include_timeseries: 1,
    "filter[from]": from,
    "filter[to]": to,
  };
  console.log(
    `Fetching sample data from ${dayjs.unix(
      params["filter[from]"]
    )} to ${dayjs.unix(params["filter[to]"])}`
  );
  // jv/search bypasses the vuex store.
  const { timeseries } = await store.dispatch("jv/search", [
    `installations/${props.installationId}`,
    {
      params: params,
    },
  ]);
  return timeseries;
};

// By default, preload one month of sample data
onMounted(async () => {
  await loadInstallation(); // Fetch installation information into the store.
  room.value = await loadRoom();
  const from = referenceDay.value.utc().subtract(1, "M").unix();
  const to = dayjs().utc().unix();
  // Fetch samples of the installation, bypass the store.
  samplePool.value = await loadSamples(from, to);
});

const oldestSampleInstant = computed(() => {
  // samples are ordered from oldest to latest
  return samplePool.value[0]?.timestamp_s;
});

const latestSampleInstant = computed(() => {
  // samples are ordered from oldest to latest
  const sc = samplePool.value.length;
  return samplePool.value[sc - 1]?.timestamp_s;
});

const currentMeasurement = computed(() => {
  // samples are ordered from oldest to latest
  const sc = samplePool.value.length;
  console.log(samplePool.value[sc - 1]);
  return samplePool.value[sc - 1]?.co2_ppm;
});

const tabChanged = (index) => {
  // 0 = day, 1 = week, 2 = month
  selectedTab.value = index;
};

const addOldSamplesToPool = async (from) => {
  if (oldestSampleInstant.value > from) {
    const prevSamples = await loadSamples(from, oldestSampleInstant.value - 1);
    if (prevSamples.length > 0) {
      console.log(`Prepending ${prevSamples.length} to the sample pool`);
      samplePool.value = [...prevSamples, ...samplePool.value];
    }
  }
};

const previousInstant = async () => {
  let prev = referenceDay.value;
  console.log(`Current reference day: ${prev}`);
  if (selectedTab.value == 0) {
    prev = referenceDay.value.subtract(1, "d");
  } else if (selectedTab.value == 1) {
    prev = referenceDay.value.subtract(1, "w");
  } else {
    prev = referenceDay.value.subtract(1, "M");
  }
  referenceDay.value = prev;
  console.log(`New reference day: ${referenceDay.value}`);
  if (oldestSampleInstant.value > prev.unix()) {
    addOldSamplesToPool(prev.subtract(1, "M").unix());
  }
};

const addNewSamplesToPool = async () => {
  if (!latestSampleInstant.value) {
    // In case the sample pool is still empty.
    return;
  }
  const now = dayjs().unix();
  if (latestSampleInstant.value < now) {
    console.log(
      `Current time: ${dayjs.unix(now)}. Latest sample instant: ${dayjs.unix(
        latestSampleInstant.value
      )}`
    );

    const nextSamples = await loadSamples(latestSampleInstant.value + 1, now);
    if (nextSamples.length > 0) {
      console.log(`Appending ${nextSamples.length} to the sample pool`);
      samplePool.value = [...samplePool.value, ...nextSamples];
    }
  }
};

// Disabled in current design
// const nowInstant = async () => {
//   addNewSamplesToPool();
//   referenceDay.value = dayjs().utc().startOf("day");
// };

const nextInstant = () => {
  let next = referenceDay.value;
  console.log(`Current reference day: ${next}`);
  if (selectedTab.value == 0) {
    next = referenceDay.value.add(1, "d");
  } else if (selectedTab.value == 1) {
    next = referenceDay.value.add(1, "w");
  } else {
    next = referenceDay.value.add(1, "M");
  }
  addNewSamplesToPool();
  referenceDay.value = dayjs.min(next, dayjs().utc().startOf("day"));
  console.log(`New reference day: ${referenceDay.value}`);
};

const installationTooltip = (isPublic) => {
  const tip = isPublic
    ? "This installation is public."
    : "This installation is not public.";
  return t(tip);
};

const isTabActive = (index) => selectedTab.value === index;
</script>

<template>
  <div class="flex flex-col justify-between gap-5">
    <h1>Installation #{{ installationId }} in {{ roomName }}</h1>
    <div
      :data-tip="installationTooltip(installation['is_public'])"
      class="tooltip tooltip-left h-6 w-6"
    >
      <EyeIcon v-if="installation['is_public']" />
      <EyeOffIcon v-else />
    </div>
    <div class="flex flex-wrap gap-5">
      <CurrentMeasurement
        :ppm="currentMeasurement"
        :timestamp="new Date(latestSampleInstant)"
      />
      <FreshAirMedal />
    </div>
    <div class="card w-full max-w-none bg-white p-4 text-black">
      <h1 class="text-center text-lg font-bold text-[#1E398F]">
        CO<sub>2</sub>-{{ $t("measurement-process") }}
      </h1>
      <TabGroup @change="tabChanged">
        <TabList class="tabs flex justify-center py-2">
          <Tab
            :class="[
              'tab w-24 border duration-300 ease-in-out',
              isTabActive(0)
                ? 'border-[#1E398F] bg-[#1E398F] text-white'
                : 'border-[#B1B2B3] text-[#B1B2B3]',
            ]"
            >{{ $t("day") }}</Tab
          >
          <Tab
            :class="[
              'tab w-24 border duration-300 ease-in-out',
              isTabActive(1)
                ? 'border-[#1E398F] bg-[#1E398F] text-white'
                : 'border-[#B1B2B3] text-[#B1B2B3]',
            ]"
            >{{ $t("week") }}</Tab
          >
          <Tab
            :class="[
              'tab w-24 border duration-300 ease-in-out',
              isTabActive(2)
                ? 'border-[#1E398F] bg-[#1E398F] text-white'
                : 'border-[#B1B2B3] text-[#B1B2B3]',
            ]"
            >{{ $t("month") }}</Tab
          >
        </TabList>
        <TabPanels>
          <TabPanel>
            <Co2Graph
              :installation-id="props.installationId"
              :reference-instant="referenceDay"
              display-scope="day"
              :sample-pool="samplePool"
            ></Co2Graph>
          </TabPanel>
          <TabPanel>
            <Co2Graph
              :installation-id="props.installationId"
              :reference-instant="referenceDay"
              display-scope="week"
              :sample-pool="samplePool"
            ></Co2Graph>
          </TabPanel>
          <TabPanel>
            <Co2Graph
              :installation-id="props.installationId"
              :reference-instant="referenceDay"
              display-scope="month"
              :sample-pool="samplePool"
            ></Co2Graph>
          </TabPanel>
        </TabPanels>
      </TabGroup>
      <!-- <div>Reference day for display: {{ referenceDayFormatted }}</div> -->
      <div class="mt-4 flex justify-center gap-2">
        <div>
          <div
            class="btn-sm flex cursor-pointer items-center rounded text-[#1E398F] shadow-sm shadow-[#1E398F29]"
            @click="previousInstant"
          >
            <component
              :is="ChevronLeftIcon"
              class="h-5 w-5"
              aria-hidden="true"
            />
            {{ $t("previous") }}
          </div>
        </div>
        <div>
          <div
            class="btn-sm flex cursor-pointer items-center rounded text-[#1E398F] shadow-sm shadow-[#1E398F29]"
            @click="nextInstant"
          >
            {{ $t("next") }}
            <component
              :is="ChevronRightIcon"
              class="h-5 w-5"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
