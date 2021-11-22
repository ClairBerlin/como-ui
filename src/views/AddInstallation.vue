<script setup>
import { onMounted, ref, watch } from "vue";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { maxUnixEpoch, detailFormatTimestamp } from "@/utils";
import { ExclamationIcon } from "@heroicons/vue/outline";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Switch,
  SwitchLabel,
  SwitchGroup,
} from "@headlessui/vue";
import Datepicker from "vue3-date-time-picker";
import "vue3-date-time-picker/dist/main.css";

const store = useStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// ---- Context ----
const orgId = computed(() => route.params.orgId);
const roomId = computed(() => route.params.roomId);
const room = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Room", id: roomId.value },
  })
);

// ---- Available Sensors ----
const sensors = ref(undefined);
const hasSensors = computed(() => sensors.value?.length > 0);
const isLoading = ref(true);

async function loadSensors() {
  isLoading.value = true;
  const sensorObj = await store.dispatch("jv/get", [
    "nodes",
    { params: { "filter[organization]": orgId.value } },
  ]);
  const sensorList = Object.entries(sensorObj);
  console.log(`Organization has ${sensorList.length} sensor(s).`);
  sensors.value = sensorList.map(([_, sensor]) => sensor);
  isLoading.value = false;
}

onMounted(async () => {
  loadSensors();
  fromDateTime.value = new Date();
});

// ---- Sensor Selection ----
const selectedSensor = ref(undefined);
const installations = ref(undefined);

const isSensorSelected = computed(
  () => typeof selectedSensor.value !== "undefined"
);

const hasInstallations = computed(
  () => isSensorSelected.value && installations.value?.length > 0
);
watch(selectedSensor, async () => {
  const sensorId = selectedSensor.value._jv.id;
  console.log(`Sensor ${sensorId} selected`);
  const installationObj = await store.dispatch(
    "jv/get",
    `nodes/${sensorId}/installations/`
  );
  const installationList = Object.entries(installationObj);
  installations.value = installationList.map(
    ([_, installation]) => installation
  );
  const relatedRoomPromises = installationList.map(([instId, inst]) => {
    console.log(`Get rooms for installation ${instId}.`);
    return store.dispatch("jv/getRelated", `installations/${instId}`);
  });
  await Promise.all(relatedRoomPromises);
  console.log(
    `The selected sensor ${sensorId} has ${installations.value?.length} associated installations.`
  );
});

// ---- Installation Start Time ----
const fromDateTime = ref(undefined);
const fromDT = computed(() => dayjs(fromDateTime?.value));

const startIsOutsideInstalledRanges = computed(() => {
  // The start time lies outsid any existing installation period of the selected sensor.
  if (fromDateTime.value == null) {
    return false;
  } else if (hasInstallations.value) {
    const sdt_s = fromDT.value.unix();
    return installations.value
      .map(
        (inst) => inst.from_timestamp_s > sdt_s || inst.to_timestamp_s < sdt_s
      )
      .every((elem) => elem);
  } else {
    return true;
  }
});

const isValidStart = computed(
  () => fromDT.value.isValid() && startIsOutsideInstalledRanges.value
);

// ---- Installation End Time ----
const toDateTime = ref(undefined);

const toDT = computed(() => {
  if (toDateTime.value == null) {
    console.log("No end date and time defined; returning max. POSIX time.");
    return dayjs.unix(maxUnixEpoch);
  } else {
    return dayjs(toDateTime.value);
  }
});

const endIsBeforeNextStart = computed(() => {
  // The selected instalation end must be earlier than the next installation start.
  if (fromDateTime.value == null) {
    return false;
  } else if (hasInstallations.value) {
    const fdt_s = fromDT.value.unix();
    console.log(`from timestamp: ${fdt_s}`);
    const nextInstallations = installations.value.filter(
      (inst) => inst.from_timestamp_s > fdt_s
    );
    console.log(
      `next installations: ${nextInstallations} (${typeof nextInstallations})`
    );
    if (nextInstallations.length > 0) {
      const tdt_s = toDT.value.unix();
      return nextInstallations
        .map((inst) => inst.from_timestamp_s > tdt_s)
        .some((elem) => elem);
    } else {
      console.log("no next installations.");
      return true;
    }
  } else {
    console.log("no installations.");
    return true;
  }
});

const endIsValid = computed(() => {
  const validValue = toDT.value?.isValid();
  const isLater = toDT.value?.unix() > fromDT.value?.unix();
  return validValue && isLater && endIsBeforeNextStart.value;
});

// ---- Create Installation ----
const installationDescription = ref(undefined);
const isPublic = ref(false);

const createInstallation = async () => {
  let validationErrors = [];
  // An installation is valid if:
  // 1. It pertains to a sensor that belongs to the selected organization.
  if (!isSensorSelected.value) {
    validationErrors.push(t("installation.errorNoSensor"));
  }
  // 2. It has a start time.
  if (fromDateTime.value == null) {
    validationErrors.push(t("installation.errorNoStart"));
  }
  // 3. The start time lies outsid any existing installation period of the selected sensor
  if (!startIsOutsideInstalledRanges.value) {
    validationErrors.push(t("installation.errorOverlappingStart"));
  }
  // 4. The end time must be later than the start time.
  if (!endIsValid.value) {
    validationErrors.push(t("installation.errorInvalidEnd"));
  }
  // 6. If there exist installations with start time later than the current start time, the current stop time must be earlier than the earliest of these start times.
  if (!endIsBeforeNextStart.value) {
    validationErrors.push(t("installation.errorOverlappingEnd"));
  }
  if (validationErrors.length > 0) {
    console.log(validationErrors);
    toast.error(validationErrors.join("\n"));
  } else {
    let newInstallation = {
      _jv: {
        type: "Installation",
        relationships: {
          room: {
            data: {
              type: "Room",
              id: roomId.value,
            },
          },
          node: {
            data: {
              type: "Node",
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
      newInstallation["description"] = installationDescription.value;
    }
    try {
      const { _jv } = await store.dispatch("jv/post", [
        newInstallation,
        { url: `installations/` },
      ]);

      toast.success(t("installation.successCreate"));
      router.push({ name: "room", params: { roomId: roomId.value } });
    } catch (e) {
      toast.error(t("installation.errorCreate"));
      console.log(e);
    }
  }
};
</script>

<template>
  <header class="bg-white shadow-md sm:rounded-md" v-if="$route.meta.title">
    <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">
        {{ $t("installation.addInRoom") }} {{ room.name }}
      </h1>
    </div>
  </header>

  <div v-if="isLoading">{{ $t("loading...") }}</div>
  <div v-else>
    <div v-if="hasSensors" class="max-w-sm sm:max-w-lg">
      <div
        class="
          text-black
          mt-2
          p-4
          card
          rounded-md
          shadow-md
          ring-1 ring-gray-300
          bg-white
        "
      >
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold">{{
              $t("node.singular")
            }}</span>
          </label>
          <Listbox v-model="selectedSensor">
            <ListboxButton v-if="isSensorSelected"
              >{{ selectedSensor?.alias }} (EUI:
              {{ selectedSensor?.eui64 }})</ListboxButton
            >
            <ListboxButton v-else>{{
              $t("installation.selectSensor")
            }}</ListboxButton>
            <ListboxOptions>
              <ListboxOption
                v-for="sensor in sensors"
                :key="sensor._jv.id"
                :value="sensor"
              >
                {{ sensor.alias }} (EUI: {{ sensor.eui64 }})
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
        </div>
        <div v-if="isSensorSelected">
          <SwitchGroup>
            <div class="flex items-center">
              <SwitchLabel class="label-text text-black font-bold">{{
                $t("installation.makePublic")
              }}</SwitchLabel>
              <Switch
                v-model="isPublic"
                :class="isPublic ? 'bg-green' : 'bg-blue'"
                class="relative inline-flex items-center h-6 rounded-full w-11"
              >
                <span
                  :class="isPublic ? 'translate-x-6' : 'translate-x-1'"
                  class="
                    inline-block
                    w-4
                    h-4
                    transform
                    bg-white
                    shadow-lg
                    rounded-full
                    transition
                  "
                />
              </Switch>
            </div>
          </SwitchGroup>
          <div class="form-control py-4">
            <label class="label">
              <span class="label-text text-black font-bold">{{
                $t("installation.from")
              }}</span>
            </label>
            <Datepicker
              v-model="fromDateTime"
              locale="de"
              weekNumbers
              textInput
              format="yyyy-MM-dd HH:mm"
              :state="isValidStart"
              :clearable="true"
              showNowButton
              :nowButtonLabel="$t('now')"
              :cancelText="$t('cancel')"
              :selectText="$t('select')"
            ></Datepicker>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text text-black font-bold"
                >{{ $t("installation.to") }}
              </span>
            </label>
            <Datepicker
              v-model="toDateTime"
              locale="de"
              weekNumbers
              textInput
              format="yyyy-MM-dd HH:mm"
              :state="endIsValid"
              :clearable="true"
              :placeholder="$t('optional')"
              showNowButton
              :nowButtonLabel="$t('now')"
              :cancelText="$t('cancel')"
              :selectText="$t('select')"
            ></Datepicker>
          </div>
          <div class="form-control py-4">
            <label class="label">
              <span class="label-text text-black font-bold">{{
                $t("description")
              }}</span>
            </label>
            <textarea
              type="text"
              v-model.trim="installationDescription"
              :placeholder="$t('optional')"
              class="como-focus rounded h-24 text-gray-600"
            />
          </div>

          <button
            class="mt-2 btn gray-button font-semibold"
            @click="createInstallation"
          >
            {{ $t("installation.add") }}
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="hasSensors"
      class="
        ring-1 ring-gray-300
        rounded-md
        bg-white
        text-md
        overflow-hidden
        mt-8
      "
    >
      <div v-if="hasInstallations">
        {{ $t("installation.otherInstallations") }}
        {{ selectedSensor.alias }} (EUI: {{ selectedSensor.eui64 }})
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="
                  px-2
                  sm:px-6
                  py-3
                  text-left text-xs
                  font-medium
                  text-gray-500
                  tracking-wider
                "
              >
                {{ $t("room.singular") }}
              </th>
              <th
                scope="col"
                class="
                  sm:px-6
                  py-3
                  text-right text-xs
                  font-medium
                  text-gray-500
                  tracking-wider
                "
              >
                {{ $t("installation.isPublic") }}
              </th>
              <th
                scope="col"
                class="
                  sm:px-6
                  py-3
                  text-right text-xs
                  font-medium
                  text-gray-500
                  tracking-wider
                "
              >
                {{ $t("installation.installedOn") }}
              </th>
              <th
                scope="col"
                class="
                  sm:px-6
                  py-3
                  text-right text-xs
                  font-medium
                  text-gray-500
                  tracking-wider
                  hidden
                  md:table-cell
                "
              >
                {{ $t("installation.removedOn") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(relatedInst, installationIdx) in installations"
              :key="relatedInst._jv.id"
              :class="[installationIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
            >
              <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
                {{ relatedInst.room.name }}
              </td>
              <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
                {{ relatedInst.is_public }}
              </td>
              <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
                {{ detailFormatTimestamp(relatedInst.from_timestamp_s) }}
              </td>
              <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
                {{ detailFormatTimestamp(relatedInst.to_timestamp_s) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
          <ExclamationIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div class="ml-3">
          {{ $t("node.noNodes") }}.
          <router-link
            :to="{
              name: 'addSensor',
            }"
            class="font-medium underline text-yellow-700 hover:text-yellow-600"
          >
            {{ $t("org.addNode") }}.
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
