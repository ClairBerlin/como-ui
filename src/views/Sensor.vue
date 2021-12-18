<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import {
  dayFormatTimestamp,
  isInstallationActive,
  isAnyInstallationActive,
} from "@/utils";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import dayjs from "dayjs";
import InstallNowModal from "@/components/InstallNowModal.vue";

// TODO: Add room name to dashboard title.
const route = useRoute();
const store = useStore();
const toast = useToast();
const { t } = useI18n();

const orgMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.orgId)
);
const isOwner = computed(() => orgMembership.value?.role === "O");

const sensorId = computed(() => route.params.sensorId);
const sensor = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Node", id: sensorId.value },
  })
);
const installations = ref([]);
const hasInstallations = computed(
  () => !isLoading.value && installations.value?.length > 0
);
const hasActiveInstallations = computed(() =>
  isAnyInstallationActive(installations.value)
);

const rooms = ref(undefined);
const hasRooms = computed(() => rooms.value?.length > 0);

const isLoading = ref(true);
const showInstallNowModal = ref(false);

const newSensorAlias = ref(undefined);
const newSensorDescription = ref(undefined);
const selectedRoom = ref(undefined);
const makeInstallationPublic = ref(false);

const updateView = async () => {
  isLoading.value = true;
  if (typeof sensor.value?.name === "undefined") {
    console.log(
      `Sensor with ID ${sensorId.value} has not been loaded yet; fetching...`
    );
    await store.dispatch("jv/get", `nodes/${sensorId.value}/`);
    await store.dispatch("jv/getRelated", `nodes/${sensorId.value}`);
  }
  console.log(`Fetch installations for sensor ${sensorId.value}.`);
  const installationObj = await store.dispatch(
    "jv/get",
    `nodes/${sensorId.value}/installations`
  );
  const installationList = Object.entries(installationObj);
  console.log(`Fetched ${installationList.length} installations`);
  installations.value = installationList.map(
    ([, installation]) => installation
  );
  const relatedResourcePromises = installationList.map(([instId]) => {
    console.log(`Get related objects for installation ${instId}.`);
    return store.dispatch("jv/getRelated", `installations/${instId}`);
  });
  await Promise.all(relatedResourcePromises);
  isLoading.value = false;

  const roomObj = await store.dispatch("jv/get", [
    "rooms",
    { params: { "filter[organization]": route.params.orgId } },
  ]);
  const roomList = Object.entries(roomObj);
  rooms.value = roomList.map(([, room]) => room);
  selectedRoom.value = rooms.value[0];
};

onMounted(async () => updateView());

const updateData = async () => {
  if (newSensorAlias.value || newSensorDescription.value) {
    let newNode = {
      _jv: {
        type: "Node",
        id: sensorId.value,
      },
    };
    if (newSensorAlias.value) {
      newNode["alias"] = newSensorAlias.value;
    }
    if (newSensorDescription.value) {
      newNode["description"] = newSensorDescription.value;
    }
    try {
      await store.dispatch("jv/patch", [
        newNode,
        { url: `nodes/${sensorId.value}/` },
      ]);
      updateView();
      toast.success(t("node.updateSuccess"));
    } catch (e) {
      toast.error(t("node.updateError"));
      console.log(e);
    }
  }
};

const terminateInstallation = async (installationId) => {
  const installation = {
    _jv: {
      type: "Installation",
      id: installationId,
    },
    to_timestamp_s: dayjs().unix(),
  };
  try {
    await store.dispatch("jv/patch", [
      installation,
      { url: `installations/${installationId}/` },
    ]);
    toast.success(t("installation.successTerminate"));
    updateView();
  } catch (e) {
    toast.error(t("installation.errorTerminate"));
    console.log(e);
  }
};

const installNow = async () => {
  if (typeof selectedRoom.value === "undefined") {
    toast.error(t("installation.errorNoTarget"));
  }
  let newInstallation = {
    _jv: {
      type: "Installation",
      relationships: {
        room: {
          data: {
            type: "Room",
            id: selectedRoom.value._jv.id,
          },
        },
        node: {
          data: {
            type: "Node",
            id: sensorId.value,
          },
        },
      },
    },
    from_timestamp_s: dayjs().unix(),
    is_public: makeInstallationPublic.value,
  };
  try {
    await store.dispatch("jv/post", [
      newInstallation,
      { url: `installations/` },
    ]);

    toast.success(t("installation.successCreate"));
    selectedRoom.value = undefined;
    updateView();
  } catch (e) {
    toast.error(t("installation.errorCreate"));
    selectedRoom.value = undefined;
    console.log(e);
  }
};
</script>

<template>
  <LoadingSpinner v-if="isLoading" />
  <div v-else>
    <div class="max-w-sm sm:max-w-lg">
      <div
        class="text-black mt-2 p-4 card rounded-md shadow-md ring-1 ring-gray-300 bg-white"
      >
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold">{{
              $t("node.name")
            }}</span>
          </label>
          <input
            type="text"
            v-model.trim="newSensorAlias"
            :placeholder="sensor.alias"
            class="input-bordered como-focus rounded bg-white text-gray-600"
          />
        </div>
        <div class="form-control py-4">
          <label class="label">
            <span class="label-text text-black font-bold">{{
              $t("description")
            }}</span>
          </label>
          <textarea
            type="text"
            v-model.trim="newSensorDescription"
            :placeholder="sensor.description"
            class="como-focus rounded h-24 text-gray-600"
          />
        </div>
        <button
          class="mt-2 btn gray-button font-semibold"
          v-if="isOwner"
          @click="updateData"
        >
          {{ $t("update") }}
        </button>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold">{{
              $t("node.eui")
            }}</span>
          </label>
          <text>{{ sensor.eui64 }}</text>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold">{{
              $t("node.id")
            }}</span>
          </label>
          <text>{{ sensorId }}</text>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold">{{
              $t("node.type")
            }}</span>
          </label>
          <text>{{ sensor.model.trade_name }}</text>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold">{{
              $t("node.manufacturer")
            }}</span>
          </label>
          <text>{{ sensor.model.manufacturer }}</text>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isOwner && !hasActiveInstallations && hasRooms" class="mt-8">
    <div
      class="btn bg-indigo-600 hover:bg-indigo-700 normal-case"
      @click="showInstallNowModal = true"
    >
      {{ $t("installation.installNow") }}
    </div>
    <InstallNowModal
      :open="showInstallNowModal"
      @close-modal="showInstallNowModal = false"
      @install-clicked="installNow"
      :modal-title="'Installation ' + t('of') + ' ' + sensor.alias"
    >
      <div class="form-control">
        <label for="room" class="block text-sm font-medium text-gray-700">
          {{ $t("installation.targetLocation") }}
        </label>
        <select
          id="location"
          name="room"
          v-model="selectedRoom"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option v-for="room in rooms" :key="room._jv.id" :value="room">
            {{ room.name }}
          </option>
        </select>
      </div>
      <div class="flex my-2">
        <div class="flex items-center h-5">
          <input
            id="makePublic"
            name="makePublic"
            type="checkbox"
            v-model="makeInstallationPublic"
            class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div class="ml-3 text-sm">
          <label for="makePublic" class="font-bold text-gray-700">
            {{ $t("installation.makePublic") }}
          </label>
        </div>
      </div>
    </InstallNowModal>
  </div>

  <div
    v-if="hasInstallations"
    class="ring-1 ring-gray-300 rounded-md bg-white text-md overflow-hidden mt-8"
  >
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
          >
            {{ $t("node.installationLocation") }}
          </th>
          <th
            scope="col"
            class="sm:px-6 py-3 text-right text-xs font-medium text-gray-500 tracking-wider"
          >
            {{ $t("installation.isPublic") }}
          </th>
          <th
            scope="col"
            class="sm:px-6 py-3 text-right text-xs font-medium text-gray-500 tracking-wider"
          >
            {{ $t("installation.installedOn") }}
          </th>
          <th
            scope="col"
            class="sm:px-6 py-3 text-right text-xs font-medium text-gray-500 tracking-wider hidden md:table-cell"
          >
            {{ $t("installation.removedOn") }}
          </th>
          <th
            scope="col"
            class="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
          >
            {{ $t("actions") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(installation, installationIdx) in installations"
          :key="installation._jv.id"
          :class="[installationIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
        >
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            {{ installation.room.name }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
            {{ installation.is_public }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
            {{ dayFormatTimestamp(installation.from_timestamp_s) }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
            {{ dayFormatTimestamp(installation.to_timestamp_s) }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col sm:flex-row">
              <div class="flex flex-row">
                <router-link
                  class="btn-sm m-2 mr-0 gray-button font-semibold w-max"
                  :to="{
                    name: 'installation',
                    params: { installationId: installation._jv.id },
                  }"
                  >{{ $t("inspect") }}</router-link
                >
              </div>
              <div
                v-if="isOwner && isInstallationActive(installation)"
                class="btn-sm m-2 mr-0 gray-button font-semibold w-max"
                @click="terminateInstallation(installation._jv.id)"
              >
                {{ $t("installation.terminate") }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
