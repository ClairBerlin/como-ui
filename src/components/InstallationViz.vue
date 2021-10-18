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

// The window of sample data to display is taken relative to this day
const referenceDay = ref(dayjs().startOf("day"));
const referenceDayFormatted = computed(() =>
  referenceDay.value.format("YYYY-MM-DD")
);

const props = defineProps({
  installationId: { type: Number, required: true },
});

const loadInstallation = async (from, to) => {
  const params = {
    include_timeseries: 1,
    "filter[from]": from,
    "filter[to]": to,
  };
  await store.dispatch("jv/get", [
    `installations/${props.installationId}`,
    {
      params: params,
    },
  ]);
};

// By default, preload one month of sample data
onMounted(async () => {
  const from = referenceDay.value.startOf("month").unix();
  const to = dayjs().unix();
  loadInstallation(from, to);
});

const installation = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Installation", id: props.installationId },
  })
);

const oldestInstantInStore = computed(() => {
  // samples are ordered from oldest to latest
  return installation.value.timeseries[0]?.timestamp_s;
});
const oldestInstantFormatted = computed(() => {
  return dayjs.unix(oldestInstantInStore.value);
});

const latestInstantInStore = computed(() => {
  // samples are ordered from oldest to latest
  const sc = installation.value.timeseries.length;
  return installation.value.timeseries[sc - 1]?.timestamp_s;
});
const latestInstantFormatted = computed(() => {
  return dayjs.unix(latestInstantInStore.value);
});

function tabChanged(index) {
  // 0 = day, 1 = week, 2 = month
  selectedTab.value = index;
}

function previousInstant() {
  let prev = referenceDay.value;
  if (selectedTab.value == 0) {
    prev = referenceDay.value.subtract(1, "d");
  } else if (selectedTab.value == 1) {
    prev = referenceDay.value.subtract(1, "w");
  } else {
    prev = referenceDay.value.subtract(1, "M");
  }
  if (prev.unix() < oldestInstantInStore.value) {
    loadInstallation(prev.startOf("month").unix(), oldestInstantInStore.value);
  }
  referenceDay.value = prev;
}

function nowInstant() {
  referenceDay.value = dayjs().startOf("day");
}

function nextInstant() {
  let next = dayjs();
  if (selectedTab.value == 0) {
    next = referenceDay.value.add(1, "d");
  } else if (selectedTab.value == 1) {
    next = referenceDay.value.add(1, "w");
  } else {
    next = referenceDay.value.add(1, "M");
  }
  referenceDay.value = dayjs.min(next, dayjs().startOf("day"));
}
</script>

<template>
  <div>{{ referenceDayFormatted }}</div>
  <!-- <div>{{ oldestInstantFormatted }}</div>
  <div>{{ latestInstantFormatted }}</div> -->
  <div>{{ selectedTab }}</div>
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
        ></Co2Graph>
      </TabPanel>
      <TabPanel>
        <Co2Graph
          :installation-id="props.installationId"
          :referenceInstant="referenceDay"
          displayScope="week"
        ></Co2Graph>
      </TabPanel>
      <TabPanel>
        <Co2Graph
          :installation-id="props.installationId"
          :referenceInstant="referenceDay"
          displayScope="month"
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
