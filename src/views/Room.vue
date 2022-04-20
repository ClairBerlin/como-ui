<script setup>
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { dayFormatTimestamp, isInstallationActive } from "@/utils";
import { ExclamationIcon, PlusIcon } from "@heroicons/vue/outline";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import dayjs from "dayjs";
import RoomForm from "@/components/forms/RoomForm.vue";
import PrivacyToggle from "@/components/PrivacyToggle.vue";

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

const emit = defineEmits(["changeSubheading"]);
watchEffect(() => {
  if (room.value?.name) {
    emit("changeSubheading", room.value.name);
  }
});

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

const createNewInstallation = async (installation) => {
  let newInstallation = {
    _jv: {
      type: "Installation",
      relationships: {
        room: {
          data: {
            type: "Room",
            id: installation.room._jv.id,
          },
        },
        node: {
          data: {
            type: "Node",
            id: installation.node._jv.id,
          },
        },
      },
    },
    from_timestamp_s: dayjs().unix(),
    to_timestamp_s: installation.to_timestamp_s,
    is_public: !installation.is_public,
    description: installation.description,
  };
  try {
    await store.dispatch("jv/post", [
      newInstallation,
      { url: `installations/` },
    ]);
    toast.success(t("installation.newInstallationCreated"));
  } catch (e) {
    toast.error(t("installation.errorCreatingnewInstallation"));
    console.log(e);
  }
};

const toggle = async (installation) => {
  console.log("toggle installation");
  console.log({ installation });
  // await terminateInstallation(installation._jv.id);
  // await createNewInstallation(installation);
  // TODO: reload installations
};
</script>

<template>
  <LoadingSpinner v-if="isLoading" />
  <div v-else>
    <div class="mt-8 max-w-sm sm:max-w-lg">
      <div class="rounded-sm bg-white p-6 shadow-md">
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
      class="text-md mt-8 overflow-hidden rounded-sm bg-white ring-1 ring-gray-300"
    >
      <div class="flex items-center justify-end">
        <div class="flex flex-row">
          <router-link
            v-if="isOwner"
            class="indigo-button m-2"
            :to="{
              name: 'addInstallation',
              params: { roomId: roomId },
            }"
          >
            <PlusIcon class="mr-2 h-4 w-4" />
            <span>{{ $t("installation.add") }}</span>
          </router-link>
        </div>
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6"
            >
              {{ $t("room.sensor") }}
            </th>
            <th
              scope="col"
              class="py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6"
            >
              {{ $t("installation.isPublic") }}
            </th>
            <th
              scope="col"
              class="py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6"
            >
              {{ $t("installation.installedOn") }}
            </th>
            <th
              scope="col"
              class="hidden py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6 md:table-cell"
            >
              {{ $t("installation.removedOn") }}
            </th>
            <th
              scope="col"
              class="px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6"
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
            <td class="whitespace-nowrap px-2 py-4 sm:px-6">
              {{ installation.node.alias }}
            </td>
            <td class="whitespace-nowrap px-2 py-4 text-left sm:px-6">
              <PrivacyToggle
                :enabled="installation.is_public"
                :on-toggle="() => toggle(installation)"
                v-if="isOwner && isInstallationActive(installation)"
              />
              <div v-else>
                {{ $t(`installation.public.${installation.is_public}`) }}
              </div>
            </td>
            <td class="whitespace-nowrap px-2 py-4 text-left sm:px-6">
              {{ dayFormatTimestamp(installation.from_timestamp_s) }}
            </td>
            <td class="whitespace-nowrap px-2 py-4 text-left sm:px-6">
              {{ dayFormatTimestamp(installation.to_timestamp_s) }}
            </td>
            <td class="whitespace-nowrap px-2 py-4 sm:px-6">
              <div class="flex flex-col sm:flex-row">
                <div class="flex flex-row">
                  <router-link
                    class="gray-button btn-sm my-2 w-max font-semibold"
                    :to="{
                      name: 'installation',
                      params: { installationId: installation._jv.id },
                    }"
                    >{{ $t("inspect") }}</router-link
                  >
                </div>
                <div
                  v-if="isOwner && isInstallationActive(installation)"
                  class="gray-button btn-sm m-2 mr-0 w-max font-semibold"
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
      class="mt-4 flex max-w-sm items-center rounded-sm border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow-md"
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
            class="font-medium text-yellow-700 underline hover:text-yellow-600"
          >
            {{ $t("room.addInstallation") }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
