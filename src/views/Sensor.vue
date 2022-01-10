<script setup>
import { ref, computed } from "vue";
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
import SensorForm from "@/components/forms/SensorForm.vue";
import PrivacyToggle from "@/components/PrivacyToggle.vue";

// TODO: Add room name to dashboard title.
const route = useRoute();
const store = useStore();
const toast = useToast();
const { t } = useI18n();

const isOwner = computed(() => {
  return store.getters["nav/isOwner"];
});

const isLoading = computed(() => {
  return store.getters["nav/isOrgContextLoading"];
});

const sensorId = computed(() => route.params.sensorId);
const sensor = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Node", id: sensorId.value },
  })
);

const installations = computed(() => {
  const instObj = store.getters["jv/get"](
    "Installation",
    `$[?(@.node._jv.id=="${sensorId.value}")]`
  );
  const instList = Object.entries(instObj);
  return instList.map(([, inst]) => inst);
});
const hasInstallations = computed(() => installations.value?.length > 0);
const hasActiveInstallations = computed(() =>
  isAnyInstallationActive(installations.value)
);

const rooms = computed(() => store.getters["nav/getRooms"]);
const hasRooms = computed(() => rooms.value?.length > 0);

const showInstallNowModal = ref(false);

const selectedRoom = ref(rooms.value[0]);
const makeInstallationPublic = ref(false);

const updateData = async ({ alias, description }) => {
  let newNode = {
    _jv: {
      type: "Node",
      id: sensorId.value,
    },
    alias,
    description,
  };
  try {
    await store.dispatch("jv/patch", [
      newNode,
      { url: `nodes/${sensorId.value}/` },
    ]);
    toast.success(t("node.updateSuccess"));
  } catch (e) {
    toast.error(t("node.updateError"));
    console.log(e);
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
  } catch (e) {
    toast.error(t("installation.errorTerminate"));
    console.log(e);
  }
};

const installNow = async () => {
  if (typeof selectedRoom.value === "undefined") {
    toast.error(t("installation.errorNoTarget"));
    return;
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
  } catch (e) {
    toast.error(t("installation.errorCreate"));
    selectedRoom.value = undefined;
    console.log(e);
  }
};
</script>

<template>
  <div v-if="isOwner && !hasActiveInstallations && hasRooms" class="">
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
      <div class="flex items-center my-2">
        <div class="mr-3 text-sm">
          <label for="makePublic" class="font-medium text-gray-700">
            {{ $t("installation.makePublic") }}
          </label>
        </div>
        <div>
          <PrivacyToggle v-model="makeInstallationPublic" />
        </div>
      </div>
    </InstallNowModal>
  </div>

  <LoadingSpinner v-if="isLoading" />
  <div v-else>
    <div class="max-w-sm sm:max-w-lg mt-8">
      <div class="bg-white rounded-md shadow-md p-6">
        <SensorForm
          :sensor-alias="sensor.alias"
          :sensor-description="sensor.description"
          :eui64="sensor.eui64"
          :sensor-id="sensorId"
          :trade-name="sensor.model.trade_name"
          :sensor-manufacturer="sensor.model.manufacturer"
          :allow-edit="isOwner"
          button-text="update"
          :on-submit="updateData"
        />
      </div>
    </div>
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
            {{ $t(`installation.public.${installation.is_public}`) }}
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
