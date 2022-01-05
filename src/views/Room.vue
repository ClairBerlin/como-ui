<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { dayFormatTimestamp, isInstallationActive } from "@/utils";
import { ExclamationIcon } from "@heroicons/vue/outline";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import dayjs from "dayjs";
import RoomForm from "@/components/forms/RoomForm.vue";

// TODO: Add room name to dashboard title.
const route = useRoute();
const store = useStore();
const toast = useToast();
const { t, n } = useI18n();

const isLoading = computed(() => {
  return store.getters["nav/isOrgContextLoading"];
});

const roomId = computed(() => route.params.roomId);
const room = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Room", id: roomId.value },
  })
);

const isOwner = computed(() => {
  return store.getters["nav/isOwner"];
});

const installations = computed(() => {
  const instObj = store.getters["jv/get"](
    "Installation",
    `$[?(@.room._jv.id=="${roomId.value}")]`
  );
  const instList = Object.entries(instObj);
  return instList.map(([, inst]) => inst);
});

const hasInstallations = computed(
  () => !isLoading.value && installations.value?.length > 0
);

const update = async ({ name, description, size, height, capacity }) => {
  if (
    room.value.name === name &&
    room.value.description === description &&
    room.value.size_sqm === size &&
    room.value.height_m === height &&
    room.value.max_occupancy === capacity
  ) {
    return;
  }
  const newRoom = {
    _jv: {
      type: "Room",
      id: roomId.value,
    },
    name,
    description,
    size_sqm: size?.replace(",", ".") || undefined,
    height_m: height?.replace(",", ".") || undefined,
    max_occupancy: capacity || undefined,
  };
  try {
    await store.dispatch("jv/patch", [
      newRoom,
      { url: `rooms/${roomId.value}/` },
    ]);
    toast.success(t("room.updateSuccess"));
  } catch (e) {
    toast.error(t("room.updateError"));
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
</script>

<template>
  <LoadingSpinner v-if="isLoading" />
  <div v-else>
    <div class="max-w-sm sm:max-w-lg mt-8">
      <div class="bg-white rounded-md shadow-md p-6">
        <RoomForm
          :allow-edit="isOwner"
          :room-name="room.name"
          :room-description="room.description"
          :room-size="n(Number(room.size_sqm))"
          :room-height="n(Number(room.height_m))"
          :room-capacity="n(Number(room.max_occupancy))"
          button-text="update"
          :on-submit="update"
        />
      </div>
    </div>

    <div
      v-if="hasInstallations"
      class="ring-1 ring-gray-300 rounded-md bg-white text-md overflow-hidden mt-8"
    >
      <div class="flex justify-end items-center">
        <div class="flex flex-row">
          <router-link
            v-if="isOwner"
            class="btn-sm m-2 mr-0 gray-button font-semibold w-max"
            :to="{
              name: 'addInstallation',
              params: { roomId: roomId },
            }"
            >{{ $t("installation.add") }}</router-link
          >
        </div>
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
            >
              {{ $t("room.sensor") }}
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
              {{ installation.node.alias }}
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
    <div
      v-else
      class="shadow-md mt-4 rounded-md max-w-sm flex items-center bg-yellow-50 border-l-4 border-yellow-400 p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <ExclamationIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div class="ml-3">
          {{ $t("room.noInstallations") }}.
          {{ " " }}
          <!-- TODO: use :to="{ name: 'installation-add' }" -->
          <router-link
            :to="{
              name: 'addInstallation',
              params: { roomId: roomId },
            }"
            class="font-medium underline text-yellow-700 hover:text-yellow-600"
          >
            {{ $t("room.addInstallation") }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
