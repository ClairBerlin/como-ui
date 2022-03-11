<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { maxUnixEpoch, detailFormatTimestamp } from '@/utils';
import { ExclamationIcon } from '@heroicons/vue/outline';
import Datepicker from 'vue3-date-time-picker';
import 'vue3-date-time-picker/dist/main.css';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import SubmitButton from '@/components/forms/SubmitButton.vue';
import PrivacyToggle from '@/components/PrivacyToggle.vue';

const store = useStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const i18n = useI18n();
const openEnd = dayjs.unix(maxUnixEpoch);
// Somewhat arbitrary cutoff to limit the selectable dates in the date picker.
const minFrom = dayjs('2020-11-01T00:00:00.000Z');

// ---- Context ----

const locale = computed(() => i18n.locale.value);

const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});

const isOwner = computed(() => store.getters['nav/isOwner']);

const roomId = computed(() => route.params.roomId);

const dateRangeArray = (from, to) => {
  let fromD = from.startOf('day');
  let toD = to.endOf('day');
  let dateArray = [];
  while (fromD.isBefore(toD)) {
    dateArray.push(fromD.toDate());
    fromD = fromD.add(1, 'day');
  }
  return dateArray;
};

// ---- Available Sensors ----
const sensors = ref(undefined);
const hasSensors = computed(() => sensors.value?.length > 0);
const isLoading = ref(true);

async function loadSensors() {
  isLoading.value = true;
  const sensorObj = await store.dispatch('jv/get', [
    'nodes',
    { params: { 'filter[organization]': currentOrgId.value } },
  ]);
  const sensorList = Object.entries(sensorObj);
  console.log(sensorList);
  console.log(`Organization has ${sensorList.length} sensor(s).`);
  sensors.value = sensorList.map(([, sensor]) => sensor);
  isLoading.value = false;
}

onMounted(async () => {
  loadSensors();
  fromDateTime.value = new Date();
});

// ---- Sensor Selection ----
const selectedSensor = ref(undefined); // To be set via selection dropdown
const installations = ref(undefined);

const isSensorSelected = computed(() => typeof selectedSensor.value !== 'undefined');

const hasInstallations = computed(() => isSensorSelected.value && installations.value?.length > 0);

const isSensorInstalled = computed(() => {
  if (hasInstallations.value) {
    const now_s = dayjs().unix();
    for (const installation of installations.value) {
      if (installation.from_timestamp_s < now_s && installation.to_timestamp_s > now_s) {
        return true;
      }
    }
  }
  return false;
});

const updateSelectedSensor = async () => {
  const sensorId = selectedSensor.value._jv.id;
  console.log(`Sensor ${sensorId} selected`);
  const installationObj = await store.dispatch('jv/get', `nodes/${sensorId}/installations/`);
  const installationList = Object.entries(installationObj);
  installations.value = installationList
    .map(([, installation]) => installation)
    .sort((a, b) => {
      // Sort by installation start date and time.
      a.from_timestamp_s - b.from_timestamp_s;
    });
  const relatedRoomPromises = installationList.map(([instId]) => {
    return store.dispatch('jv/getRelated', `installations/${instId}`);
  });
  await Promise.all(relatedRoomPromises);
  console.log(`The selected sensor ${sensorId} has ${installations.value?.length} associated installations.`);
};

watch(selectedSensor, async () => updateSelectedSensor());

// ---- Installation Start  ----
const fromDateTime = ref(undefined); // Set via the date picker
const fromDT = computed(() => dayjs(fromDateTime?.value));

// Minimum admissible date to be selected in the "From" date picker
const fromMinDate = computed(() => {
  if (
    hasInstallations.value &&
    installations.value[0].from_timestamp_s <= minFrom.unix() // sorted installations
  ) {
    return dayjs.unix(installations.value[0].to_timestamp_s);
  } else {
    return minFrom;
  }
});

// Maximum admissible date to be selected in the "From" date picker
const fromMaxDate = computed(() => {
  if (hasInstallations.value && installations.value[installations.value.length - 2]?.to_timestamp_s === maxUnixEpoch) {
    return dayjs.unix(installations.value.at(-1).from_timestamp_s);
  } else {
    return openEnd;
  }
});

// Dates that cannot be selected in the "From" date picker
const disabledFromDates = computed(() => {
  if (!hasInstallations.value) {
    return [];
  }
  let excludeDates = [];
  for (const installation of installations.value) {
    if (installation.from_timestamp_s <= minFrom.unix()) {
      continue; // Covered by fromMinDate property.
    }
    if (installation.to_timestamp_s === maxUnixEpoch) {
      continue; // Covered by fromMaxDate property.
    }
    // Might lead to duplicates at the edges. I prefer this to an extra dependency or
    // complex deduplication logic.
    const instFrom = dayjs.unix(installation.from_timestamp_s);
    const instTo = dayjs.unix(installation.to_timestamp_s);
    excludeDates = excludeDates.concat(dateRangeArray(instFrom, instTo));
  }
  return excludeDates;
});

const startIsOutsideInstalledRanges = computed(() => {
  // The start time is outside any existing installation period of the selected sensor.
  if (fromDateTime.value == null) {
    return false;
  } else if (hasInstallations.value) {
    const fdt_s = fromDT.value.unix();
    return installations.value
      .map((inst) => inst.from_timestamp_s > fdt_s || inst.to_timestamp_s < fdt_s)
      .every((elem) => elem);
  } else {
    return true;
  }
});

const startIsValid = computed(() => {
  return fromDT.value.isValid() && startIsOutsideInstalledRanges.value && fromDT.value.isAfter(minFrom);
});

// ---- Installation End  ----
const toDateTime = ref(undefined); // Set via the date picker
const toDT = computed(() => {
  if (toDateTime.value == null) {
    return openEnd;
  } else {
    return dayjs(toDateTime.value);
  }
});

// Minimum admissible date to be selected in the "To" date picker
const toMinDate = computed(() => {
  if (fromDT.value !== null) {
    return fromDT.value;
  } else {
    return fromMinDate.value;
  }
});

// Maximum admissible date to be selected in the "To" date picker
const toMaxDate = computed(() => {
  return fromMaxDate.value;
});

// Admissible individual dates to be selected in the "To" date picker
const admissibleToDates = computed(() => {
  if (!hasInstallations.value || fromDT.value === null) {
    return [];
  }
  const nextInstallations = installations.value.filter((inst) => inst.from_timestamp_s > fromDT.value.unix());
  if (nextInstallations.length === 0) {
    return [];
  }
  const nextStart = dayjs.unix(nextInstallations[0].from_timestamp_s);
  return dateRangeArray(fromDT.value, nextStart);
});

const endIsBeforeNextStart = computed(() => {
  // The selected instalation end must be earlier than the next installation start.
  if (fromDateTime.value == null) {
    return false;
  } else if (hasInstallations.value) {
    const fdt_s = fromDT.value.unix();
    const nextInstallations = installations.value.filter((inst) => inst.from_timestamp_s > fdt_s);
    if (nextInstallations.length > 0) {
      return nextInstallations[0].from_timestamp_s > toDT.value.unix();
    } else {
      return true;
    }
  } else {
    return true;
  }
});

const endIsValid = computed(() => {
  if (toDT.value === null) {
    return false;
  } else {
    const validValue = toDT.value.isValid();
    const isLater = toDT.value.unix() > fromDT.value?.unix();
    return validValue && isLater && endIsBeforeNextStart.value;
  }
});

const isInstallationActive = (installation) => {
  if (installation == null) {
    return false;
  } else {
    let now_s = dayjs().unix();
    return installation.from_timestamp_s < now_s && installation.to_timestamp_s > now_s;
  }
};

// ---- Create Installation ----
const installationDescription = ref(undefined);
const isPublic = ref(false);

const createInstallation = async () => {
  let validationErrors = [];
  // An installation is valid if:
  // 1. It pertains to a sensor that belongs to the selected organization.
  if (!isSensorSelected.value) {
    validationErrors.push(t('installation.errorNoSensor'));
  }
  // 2. It has a start time.
  if (fromDateTime.value == null) {
    validationErrors.push(t('installation.errorNoStart'));
  }
  // 3. The start time lies outsid any existing installation period of the selected sensor
  if (!startIsOutsideInstalledRanges.value) {
    validationErrors.push(t('installation.errorOverlappingStart'));
  }
  // 4. The end time must be later than the start time.
  if (!endIsValid.value) {
    validationErrors.push(t('installation.errorInvalidEnd'));
  }
  // 6. If there exist installations with start time later than the current start time, the current stop time must be earlier than the earliest of these start times.
  if (!endIsBeforeNextStart.value) {
    validationErrors.push(t('installation.errorOverlappingEnd'));
  }
  if (validationErrors.length > 0) {
    console.log(validationErrors);
    toast.error(validationErrors.join('\n'));
  } else {
    let newInstallation = {
      _jv: {
        type: 'Installation',
        relationships: {
          room: {
            data: {
              type: 'Room',
              id: roomId.value,
            },
          },
          node: {
            data: {
              type: 'Node',
              id: selectedSensor.value._jv.id,
            },
          },
        },
      },
      from_timestamp_s: fromDT.value.unix(),
      to_timestamp_s: toDT.value.unix(),
      is_public: isPublic.value,
    };
    if (installationDescription.value) {
      newInstallation['description'] = installationDescription.value;
    }
    try {
      await store.dispatch('jv/post', [newInstallation, { url: `installations/` }]);

      toast.success(t('installation.successCreate'));
      router.push({ name: 'room', params: { roomId: roomId.value } });
    } catch (e) {
      toast.error(t('installation.errorCreate'));
      console.log(e);
    }
  }
};

const terminateInstallation = async (installationId) => {
  const installation = {
    _jv: {
      type: 'Installation',
      id: installationId,
    },
    to_timestamp_s: dayjs().unix(),
  };
  try {
    await store.dispatch('jv/patch', [installation, { url: `installations/${installationId}/` }]);
    toast.success(t('installation.successTerminate'));
    updateSelectedSensor();
  } catch (e) {
    toast.error(t('installation.errorTerminate'));
    console.log(e);
  }
};
</script>

<template>
  <LoadingSpinner v-if="isLoading" />
  <div v-else>
    <div v-if="isOwner">
      <div v-if="hasSensors" class="max-w-sm sm:max-w-lg">
        <div class="space-y-6 rounded-sm bg-white p-6 shadow-md">
          <div>
            <label class="mb-1 block font-semibold text-gray-900">
              {{ $t('node.singular') }}
            </label>
            <select
              id="sensor"
              name="sensor"
              v-model="selectedSensor"
              class="w-full cursor-pointer rounded-sm border-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option disabled :value="undefined">
                {{ $t('installation.selectSensor') }}
              </option>
              <option v-for="sensor in sensors" :key="sensor._jv.id" :value="sensor" class="py-2">
                {{ sensor.alias }} (EUI: {{ sensor.eui64 }})
              </option>
            </select>
            <div class="mt-2 text-sm font-medium text-red-600" v-if="isSensorInstalled">
              {{ $t('node.isInstalled') }}.
            </div>
          </div>
          <div class="my-2 flex align-middle">
            <div class="mr-3">
              <label class="mb-1 block font-semibold text-gray-900">
                {{ $t('installation.makePublic') }}
              </label>
            </div>
            <div>
              <PrivacyToggle v-model="isPublic" />
            </div>
          </div>
          <div class="">
            <label class="mb-1 block font-semibold text-gray-900">
              {{ $t('installation.from') }}
            </label>
            <Datepicker
              v-model="fromDateTime"
              :locale="locale"
              week-numbers
              text-input
              format="yyyy-MM-dd HH:mm"
              :clearable="true"
              :min-date="fromMinDate.toDate()"
              :max-date="fromMaxDate.toDate()"
              :disabled-dates="disabledFromDates"
              :state="startIsValid"
              show-now-button
              :now-button-label="$t('now')"
              :cancel-text="$t('cancel')"
              :select-text="$t('select')"
            ></Datepicker>
          </div>
          <div class="">
            <label class="mb-1 block font-semibold text-gray-900"
              >{{ `${$t('installation.to')} (${$t('optional')})` }}
            </label>
            <Datepicker
              v-model="toDateTime"
              :locale="locale"
              week-numbers
              text-input
              format="yyyy-MM-dd HH:mm"
              :clearable="true"
              :min-date="toMinDate.toDate()"
              :max-date="toMaxDate.toDate()"
              :allowed-dates="admissibleToDates"
              :state="toDateTime ? endIsValid : null"
              show-now-button
              :now-button-label="$t('now')"
              :cancel-text="$t('cancel')"
              :select-text="$t('select')"
            ></Datepicker>
          </div>
          <div class="">
            <label class="mb-1 block font-semibold text-gray-900"
              >{{ `${$t('description')} (${$t('optional')})` }}
            </label>
            <textarea
              type="text"
              v-model.trim="installationDescription"
              class="w-full rounded-sm border-2 border-gray-300 text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <SubmitButton :allow-submit="isOwner" @click="createInstallation">
            {{ $t('installation.add') }}
          </SubmitButton>
        </div>
      </div>
      <div v-if="hasSensors" class="text-md mt-8 overflow-hidden rounded-sm bg-white ring-1 ring-gray-300">
        <div v-if="hasInstallations">
          <h3 class="p-2 text-xl font-semibold text-gray-800">
            {{ $t('installation.otherInstallations') }}
            {{ selectedSensor.alias }} (EUI: {{ selectedSensor.eui64 }})
          </h3>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6">
                  {{ $t('room.singular') }}
                </th>
                <th scope="col" class="py-3 text-right text-xs font-medium tracking-wider text-gray-500 sm:px-6">
                  {{ $t('installation.isPublic') }}
                </th>
                <th scope="col" class="py-3 text-right text-xs font-medium tracking-wider text-gray-500 sm:px-6">
                  {{ $t('installation.installedOn') }}
                </th>
                <th
                  scope="col"
                  class="hidden py-3 text-right text-xs font-medium tracking-wider text-gray-500 sm:px-6 md:table-cell"
                >
                  {{ $t('installation.removedOn') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(installation, installationIdx) in installations"
                :key="installation._jv.id"
                :class="[installationIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
              >
                <td class="whitespace-nowrap px-2 py-4 sm:px-6">
                  {{ installation.room.name }}
                </td>
                <td class="whitespace-nowrap px-2 py-4 text-right sm:px-6">
                  {{ $t(`installation.public.${installation.is_public}`) }}
                </td>
                <td class="whitespace-nowrap px-2 py-4 text-right sm:px-6">
                  {{ detailFormatTimestamp(installation.from_timestamp_s) }}
                </td>
                <td class="whitespace-nowrap px-2 py-4 text-right sm:px-6">
                  {{ detailFormatTimestamp(installation.to_timestamp_s) }}
                </td>
                <td class="whitespace-nowrap px-2 py-4 sm:px-6">
                  <div class="flex flex-col sm:flex-row">
                    <div
                      v-if="isOwner && isInstallationActive(installation)"
                      class="gray-button btn-sm m-2 mr-0 w-max font-semibold"
                      @click="terminateInstallation(installation._jv.id)"
                    >
                      {{ $t('installation.terminate') }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div
        v-else
        class="mt-4 flex max-w-sm items-center rounded-sm border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow-md"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div class="ml-3">
            {{ $t('node.noNodes') }}.
            <router-link
              :to="{
                name: 'addSensor',
              }"
              class="font-medium text-yellow-700 underline hover:text-yellow-600"
            >
              {{ $t('org.addNode') }}.
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="mt-4 flex max-w-sm items-center rounded-sm border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow-md"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <ExclamationIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div class="ml-3">{{ $t('node.errorNotOwner') }}.</div>
      </div>
    </div>
  </div>
</template>
