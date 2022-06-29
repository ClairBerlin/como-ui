<script setup>
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import DayjsMinMax from "dayjs/plugin/minMax";
import utc from "dayjs/plugin/utc";

import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
import Co2Graph from "@/components/Co2Graph.vue";
import Accordion from "@/components/accordion/Accordion.vue";
import { EyeIcon, EyeOffIcon } from "@heroicons/vue/outline";

dayjs.extend(DayjsMinMax);
dayjs.extend(utc);

const store = useStore();

const selectedTab = ref(0);
const samplePool = ref([]);
const { t } = useI18n();

// The window of sample data to display is taken relative to this day
const referenceDay = ref(dayjs().utc().startOf("day"));
// const referenceDayFormatted = computed(() =>
//   referenceDay.value.format("YYYY-MM-DD")
// );
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
  const from = referenceDay.value.utc().startOf("month").unix();
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
    addOldSamplesToPool(prev.startOf("month").unix());
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

const nowInstant = async () => {
  addNewSamplesToPool();
  referenceDay.value = dayjs().utc().startOf("day");
};

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
  <div class="card max-w-xs bg-white p-4 text-black sm:max-w-lg">
    <div class="flex justify-between">
      <div class="card-title">
        Installation #{{ installationId }} in {{ roomName }}
      </div>
      <div
        :data-tip="installationTooltip(installation['is_public'])"
        class="tooltip tooltip-left h-6 w-6"
      >
        <EyeIcon v-if="installation['is_public']" />
        <EyeOffIcon v-else />
      </div>
    </div>
    <TabGroup @change="tabChanged">
      <TabList class="tabs py-2">
        <Tab
          :class="[
            'tab tab-bordered flex-grow',
            isTabActive(0) ? 'tab-active' : '',
          ]"
          >{{ $t("day") }}</Tab
        >
        <Tab
          :class="[
            'tab tab-bordered flex-grow',
            isTabActive(1) ? 'tab-active' : '',
          ]"
          >{{ $t("week") }}</Tab
        >
        <Tab
          :class="[
            'tab tab-bordered flex-grow',
            isTabActive(2) ? 'tab-active' : '',
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
    <div class="flex justify-between">
      <div>
        <div class="gray-button btn-sm" @click="previousInstant">
          {{ $t("previous") }}
        </div>
      </div>
      <div>
        <div class="gray-button btn-sm" @click="nowInstant">
          {{ $t("now") }}
        </div>
      </div>
      <div>
        <div class="gray-button btn-sm" @click="nextInstant">
          {{ $t("next") }}
        </div>
      </div>
    </div>
  </div>
  <Accordion />
</template>
