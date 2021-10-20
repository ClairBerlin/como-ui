<script setup>
import { onMounted, ref } from "vue";
import { computed } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import dayjs from "dayjs";
import "dayjs/locale/de";
import DayjsMinMax from "dayjs/plugin/minMax";
// TODO: update locale when language is changed via UI
dayjs.locale("de");
dayjs.extend(DayjsMinMax);

import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
import Co2Graph from "@/components/Co2Graph.vue";

const route = useRoute();
const store = useStore();

let selectedTab = ref(0);
let samplePool = ref([]);

// The window of sample data to display is taken relative to this day
const referenceDay = ref(dayjs().startOf("day"));
const referenceDayFormatted = computed(() =>
  referenceDay.value.format("YYYY-MM-DD")
);

const props = defineProps({
  installationId: { type: Number, required: true },
});

const loadInstallation = (async) => {
  store.dispatch("jv/get", [`installations/${props.installationId}`]);
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
  const installation = await store.dispatch("jv/search", [
    `installations/${props.installationId}`,
    {
      params: params,
    },
  ]);
  return installation.timeseries;
};

// By default, preload one month of sample data
onMounted(async () => {
  await loadInstallation; // Fetch installation information into the store.
  const from = referenceDay.value.startOf("month").unix();
  const to = dayjs().unix();
  // Fetch samples of the installation, bypass the store.
  samplePool.value = await loadSamples(from, to);
});

const installation = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Installation", id: props.installationId },
  })
);

const oldestSampleInstant = computed(() => {
  // samples are ordered from oldest to latest
  return samplePool.value[0]?.timestamp_s;
});
const latestSampleInstant = computed(() => {
  // samples are ordered from oldest to latest
  const sc = samplePool.value.length;
  return samplePool.value[sc - 1]?.timestamp_s;
});

function tabChanged(index) {
  // 0 = day, 1 = week, 2 = month
  selectedTab.value = index;
  console.log(`Select tab ${index}`);
}

async function addOldSamplesToPool(from) {
  if (oldestSampleInstant.value > from) {
    const prevSamples = await loadSamples(from, oldestSampleInstant.value - 1);
    if (prevSamples.length > 0) {
      console.log(`Prepending ${prevSamples.length} to the sample pool`);
      samplePool.value = [...prevSamples, ...samplePool.value];
    }
  }
}

async function previousInstant() {
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
}

async function addNewSamplesToPool() {
  if (!latestSampleInstant) {
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
}

async function nowInstant() {
  addNewSamplesToPool();
  referenceDay.value = dayjs().startOf("day");
}

function nextInstant() {
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
  referenceDay.value = dayjs.min(next, dayjs().startOf("day"));
  console.log(`New reference day: ${referenceDay.value}`);
}
</script>

<template>
  <div>Installation-ID: {{ installationId }}</div>
  <div>Reference day for display: {{ referenceDayFormatted }}</div>
  <TabGroup @change="tabChanged">
    <TabList>
      <Tab>Day</Tab>
      <Tab>Week</Tab>
      <Tab>Month</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <Co2Graph
          :installation-id="props.installationId"
          :referenceInstant="referenceDay"
          displayScope="day"
          :sample-pool="samplePool"
        ></Co2Graph>
      </TabPanel>
      <TabPanel>
        <Co2Graph
          :installation-id="props.installationId"
          :referenceInstant="referenceDay"
          displayScope="week"
          :sample-pool="samplePool"
        ></Co2Graph>
      </TabPanel>
      <TabPanel>
        <Co2Graph
          :installation-id="props.installationId"
          :referenceInstant="referenceDay"
          displayScope="month"
          :sample-pool="samplePool"
        ></Co2Graph>
      </TabPanel>
    </TabPanels>
  </TabGroup>
  <div>
    <button @click="previousInstant">Previous</button>
  </div>
  <div>
    <button @click="nowInstant">Now</button>
  </div>
  <div>
    <button @click="nextInstant">Next</button>
  </div>
</template>
