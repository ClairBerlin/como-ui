<script setup>
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import DayjsMinMax from "dayjs/plugin/minMax";
import utc from "dayjs/plugin/utc";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/solid";

import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";

import Accordion from "@/components/accordion/Accordion.vue";
import Co2Graph from "@/components/InstallationViz/Co2Graph.vue";
import CurrentMeasurement from "@/components/widget/CurrentMeasurement.vue";
import FreshAirMedal from "@/components/widget/FreshAirMedal.vue";
import { EyeIcon, EyeOffIcon } from "@heroicons/vue/outline";
import CSVDownload from "./CSVDownload.vue";
import BumpTimesPlot from "./BumpTimesPlot.vue";

const { tm } = useI18n();

dayjs.extend(DayjsMinMax);
dayjs.extend(utc);

const store = useStore();

const selectedTab = ref(0);
const samplePool = ref([]);
const endOfScale = ref(true);
const { t } = useI18n();

const sampleHistogram = {
  Mo: [
    0.0, 0.0, 0.0, 4.444444444444447, 24.722222222222218, 51.944444444444436,
    79.44444444444446, 11.666666666666666, 0.0, 0.0, 0.0, 0.0,
    10.017512077294683, 13.72222222222222, 222.8, 284.32246376811594,
    284.2118055555556, 281.47916666666663, 287.23777777777775,
    224.14851851851853, 155.67444444444445, 118.66328502415459,
    88.72055555555556, 4.444444444444447,
  ],
  Tu: [
    54.25, 41.513888888888886, 28.763888888888886, 13.291666666666666,
    1.4583333333333333, 3.333333333333333, 20.972222222222218, 0.0, 0.0, 0.0,
    0.0, 2.4444444444444473, 120.62268518518518, 276.8611111111111,
    295.162962962963, 232.17407407407404, 277.47222222222223, 245.5925925925926,
    261.7847222222222, 134.84398148148148, 99.54444444444445, 0.0, 0.0,
    21.166666666666668,
  ],
  We: [
    8.270833333333334, 2.958333333333329, 0.16666666666666666, 0.0, 0.0,
    0.8333333333333333, 21.111111111111114, 6.805555555555557, 0.0, 0.0, 0.0,
    18.454861111111104, 89.0214285714286, 226.72222222222223, 315.8404882154882,
    317.91666666666663, 140.13888888888889, 263.8282004830918,
    259.40972222222223, 135.51388888888889, 100.10416666666666,
    44.56527777777779, 2.0, 0.0,
  ],
  Th: [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 8.888888888888886, 26.944444444444446,
    6.111111111111114, 0.0, 0.0, 0.0, 42.326388888888886, 121.34460547504027,
    229.04629629629633, 317.9819444444445, 311.97916666666663,
    411.0138888888889, 311.09166666666664, 292.13345410628017,
    296.8317230273752, 218.08735909822863, 134.38888888888889,
    105.52777777777777,
  ],
  Fr: [
    114.8888888888889, 85.35185185185185, 62.138888888888886,
    29.166666666666682, 3.537037037037035, 16.444444444444443,
    39.88888888888888, 8.666666666666666, 0.0, 0.0, 0.0, 0.0, 20.35,
    76.49305555555554, 134.6111111111111, 91.06875000000001, 34.9375,
    109.23437499999999, 45.03592995169082, 36.541666666666664,
    18.449305555555565, 1.8888888888888904, 0.0, 0.0,
  ],
  Sa: [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.2222222222222245, 14.888888888888891,
    24.0, 5.111111111111109, 0.0, 37.5897, 0.022569444444442865, 6.0347222,
    7.022222222222226, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  ],
  Su: [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.1354166666666665,
    15.477777777777774, 76.96805555555555, 74.16666666666667, 68.88333333333334,
    67.75555555555556, 33.79722222222222, 0.0, 0.0, 104.84722222222221,
    87.20138888888887, 58.416666666666664, 16.541666666666668, 2.225, 0.0,
  ],
};

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

const route = useRoute();

const sensorId = computed(() => route.params.sensorId);

const InstallationData = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Node", id: sensorId.value },
  })
);

const InstallationAlias = computed(
  () => InstallationData.value[Object.keys(InstallationData.value)[0]]
);

const room = ref();
const roomId = ref();
const roomName = computed(() => room.value?.name);
const roomMedal = ref();
const roomQuality = ref();

const loadRoom = async () => {
  return await store.dispatch(
    "jv/get",
    `installations/${props.installationId}/room`,
    { root: true }
  );
};

const loadMedal = async () => {
  // const params = {
  //   include_histogram: 1,
  // };
  return await store.dispatch(
    "jv/get",
    `rooms/${roomId.value}/airquality/2022-06`,
    {
      root: true,
    }
  );
};

const loadHistogram = async () => {
  const params = {
    include_histogram: 1,
  };
  return await store.dispatch(
    "jv/get",
    `rooms/${roomId.value}/airquality/2022-06`,
    {
      params: params,
    }
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
  roomId.value = await room.value._jv.id;
  roomMedal.value = await loadMedal();
  roomQuality.value = await loadHistogram();
  const from = referenceDay.value.utc().subtract(1, "M").unix();
  const to = dayjs().utc().unix();
  // Fetch samples of the installation, bypass the store.
  samplePool.value = await loadSamples(from, to);
});

const cleanAirMedal = computed(() => {
  return roomMedal.value?.clean_air_medal;
});

// const histogram = computed(() => {
//   return roomMedal.value?.clean_air_medal;
// });

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
  return samplePool.value[sc - 1];
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
  endOfScale.value = false;
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
  } else {
    endOfScale.value = true;
  }
};

const nextInstant = () => {
  if (!endOfScale.value) {
    let next = referenceDay.value;
    let secondNext;
    console.log(`Current reference day: ${next}`);
    if (selectedTab.value == 0) {
      next = referenceDay.value.add(1, "d");
      secondNext = next.add(1, "d");
    } else if (selectedTab.value == 1) {
      next = referenceDay.value.add(1, "w");
      secondNext = next.add(1, "w");
    } else {
      next = referenceDay.value.add(1, "M");
      secondNext = next.add(1, "M");
    }
    addNewSamplesToPool();
    referenceDay.value = dayjs.min(next, dayjs().utc().startOf("day"));
    console.log(`New reference day: ${referenceDay.value}`);

    // Disable button at most recent value
    if (dayjs(secondNext).unix() >= dayjs(new Date()).unix()) {
      endOfScale.value = true;
    }
  } else {
    console.log(`${referenceDay.value} already is the most recent measurement`);
  }
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
  <div class="flex w-full flex-col justify-between gap-5">
    <div class="flex items-center gap-5">
      <h2 class="text-lg font-bold">
        Installation #{{ installationId }} in {{ roomName }}
      </h2>
      <div
        :data-tip="installationTooltip(installation['is_public'])"
        class="tooltip tooltip-left h-6 w-6"
      >
        <EyeIcon v-if="installation['is_public']" />
        <EyeOffIcon v-else />
      </div>
    </div>
    <div class="flex flex-wrap gap-5">
      <CurrentMeasurement
        :ppm="getLatestMeasurement(currentMeasurement)"
        :timestamp="new Date(latestSampleInstant)"
        :white-bg="true"
      />
      <FreshAirMedal :inactive="!cleanAirMedal" :white-bg="true" />
    </div>
    <div
      class="max-w-none card w-full rounded-lg bg-white p-4 text-black shadow-md"
    >
      <h2 class="text-center text-lg font-bold text-[#1E398F]">
        CO<sub>2</sub>-{{ $t("measurement-process") }}
      </h2>
      <TabGroup @change="tabChanged">
        <TabList class="tabs flex justify-center py-2">
          <div
            class="flex justify-center gap-px overflow-hidden rounded-lg bg-[#B1B2B3]"
          >
            <Tab
              :class="[
                'tab w-24 rounded-l-lg border border-r-0 duration-300 ease-in-out',
                isTabActive(0)
                  ? 'border-[#1E398F] bg-[#1E398F] text-white'
                  : 'border-[#B1B2B3] bg-white text-[#B1B2B3] shadow-inner',
              ]"
              >{{ $t("day") }}</Tab
            >
            <Tab
              :class="[
                'tab w-24 border border-x-0 duration-300 ease-in-out',
                isTabActive(1)
                  ? 'border-[#1E398F] bg-[#1E398F] text-white'
                  : 'border-[#B1B2B3] bg-white text-[#B1B2B3] shadow-inner',
              ]"
              >{{ $t("week") }}</Tab
            >
            <Tab
              :class="[
                'tab w-24 rounded-r-lg border border-l-0 duration-300 ease-in-out',
                isTabActive(2)
                  ? 'border border-[#1E398F] bg-[#1E398F] text-white'
                  : 'border-[#B1B2B3] bg-white text-[#B1B2B3] shadow-inner',
              ]"
              >{{ $t("month") }}</Tab
            >
          </div>
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
          <button
            class="btn-sm flex cursor-pointer items-center rounded text-[#1E398F] shadow-sm shadow-[#1E398F29]"
            @click="previousInstant"
          >
            <component
              :is="ChevronLeftIcon"
              class="h-6 w-6"
              aria-hidden="true"
            />
            {{ $t("previous") }}
          </button>
        </div>
        <div>
          <button
            class="btn-sm flex cursor-pointer items-center rounded shadow-sm shadow-[#1E398F29]"
            :class="endOfScale ? 'text-[#B1B2B3]' : 'text-[#1E398F]'"
            @click="nextInstant"
            :aria-disabled="endOfScale ? true : false"
          >
            {{ $t("next") }}
            <component
              :is="ChevronRightIcon"
              class="h-6 w-6"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
    <div
      class="max-w-none card w-full rounded-lg bg-white p-4 text-black shadow-md"
    >
      <BumpTimesPlot :data="sampleHistogram" />
    </div>
  </div>
  <CSVDownload
    :load-samples-function="loadSamples"
    :alias="InstallationAlias"
  />
  <Accordion
    v-for="(section, index) in tm('faq.sections')"
    :key="index"
    :title="section.title"
    :data="section.accordion"
  />
</template>
