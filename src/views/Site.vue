<script setup>
import { computed, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import {
  ExclamationIcon,
  TrashIcon,
  PlusIcon,
  InformationCircleIcon,
} from "@heroicons/vue/outline";
import { useI18n } from "vue-i18n";
import DeletionModal from "@/components/DeletionModal.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import SiteForm from "@/components/forms/SiteForm.vue";

const { t } = useI18n();

const route = useRoute();
const store = useStore();
const toast = useToast();

const isLoading = computed(() => {
  return store.getters["nav/isOrgContextLoading"];
});

const siteId = computed(() => route.params.siteId);
const site = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Site", id: siteId.value },
  })
);

const emit = defineEmits(["changeSubheading"]);
watchEffect(() => {
  if (site.value?.name) {
    emit("changeSubheading", site.value.name);
  }
});

const addressId = computed(() => site.value.address._jv.id);

const rooms = computed(() => {
  const roomObj = store.getters["jv/get"](
    "Room",
    `$[?(@._jv.relationships.site.data.id=="${siteId.value}")]`
  );
  const roomList = Object.entries(roomObj);
  return roomList.map(([, room]) => room);
});
const hasRooms = computed(() => !isLoading.value && rooms.value?.length > 0);

const isOwner = computed(() => {
  return store.getters["nav/isOwner"];
});

const showDeleteRoomModal = ref(false);
const deleteRoomId = ref();
const openDeleteRoomModal = () => (showDeleteRoomModal.value = true);

const deleteRoom = async () => {
  console.log(`Deleting room with ID ${deleteRoomId.value}`);
  await store.dispatch("jv/delete", `rooms/${deleteRoomId.value}`);
  store.commit("jv/deleteRecord", {
    _jv: { type: "Room", id: deleteRoomId.value },
  });
};

const updateSite = async ({ name, description }) => {
  // only update if something changed
  if (site.value.name === name && site.value.description === description) {
    return;
  }
  let newSite = {
    _jv: {
      type: "Site",
      id: siteId.value,
    },
    name,
    description,
  };
  try {
    await store.dispatch("jv/patch", [
      newSite,
      { url: `sites/${siteId.value}/` },
    ]);
    toast.success(t("site.updateSuccess"));
  } catch (e) {
    toast.error(t("site.updateError"));
    console.log(e);
  }
};

const updateAddress = async ({ street1, street2, zip, city }) => {
  if (
    site.value.address.street1 === street1 &&
    site.value.address.street2 === street2 &&
    site.value.address.zip === zip &&
    site.value.address.city === city
  ) {
    return;
  }
  let newAddress = {
    _jv: {
      type: "Address",
      id: addressId.value,
    },
    street1,
    street2,
    zip,
    city,
  };
  try {
    await store.dispatch("jv/patch", [
      newAddress,
      { url: `addresses/${addressId.value}/` },
    ]);
    toast.success(t("address.updateSuccess"));
  } catch (e) {
    toast.error(t("address.updateError"));
  }
};

const update = async ({ name, description, street1, street2, zip, city }) => {
  updateSite({ name, description });
  updateAddress({ street1, street2, zip, city });
};

const getCodeSnippet = (siteId) => {
  return `<iframe
  src="https://como-berlin.de/embed/${siteId}/"
  width="359px"
  height="620px"
></iframe>`;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(getCodeSnippet(siteId.value));
    toast.success(t("copy.success"));
  } catch (e) {
    toast.error(t("copy.failure"));
  }
};
</script>

<template>
  <LoadingSpinner v-if="isLoading" />
  <div v-else class="divide-y-2 divide-gray-300">
    <div class="mt-8 flex flex-col gap-4 lg:flex-row">
      <div class="max-w-sm sm:max-w-lg lg:min-w-[50%]">
        <div class="rounded-sm bg-white p-6 shadow-md">
          <SiteForm
            :allow-edit="isOwner"
            :site-name="site.name"
            :site-description="site.description"
            :address-street1="site.address.street1"
            :address-street2="site.address.street2"
            :address-zip="site.address.zip"
            :address-city="site.address.city"
            button-text="site.update"
            :on-submit="update"
          />
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div class="rounded-lg bg-indigo-100 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <InformationCircleIcon
                class="h-5 w-5 text-indigo-600"
                aria-hidden="true"
              />
            </div>
            <div class="ml-3 max-w-md flex-1 md:flex">
              <p class="text-sm text-indigo-900">
                {{ $t("copy.snippet") }}
              </p>
            </div>
          </div>
        </div>
        <div class="w-auto">
          <pre
            class="mockup-code relative rounded-lg bg-indigo-200 px-2 text-indigo-900"
          >
        <code>
{{getCodeSnippet(siteId)}}
        </code>
        <button 
        type="button" 
        class="absolute bottom-0 right-0 m-2 p-2 pb-1 cursor-pointer rounded-md hover:bg-indigo-100 bg-indigo-50"
        @click="copyToClipboard()"
        >{{$t("copy.action")}}</button>
        </pre>
        </div>

        <div>
          <h2 class="pb-1 text-xl font-bold">{{ $t("preview") }}</h2>
          <iframe
            class="overflow-hidden rounded-lg bg-white shadow-sm"
            src="https://como-berlin.de/embed/25/"
            width="359px"
            height="620px"
          ></iframe>
        </div>
      </div>
    </div>
    <div v-if="hasRooms" class="text-md mt-8 pt-8">
      <DeletionModal
        :open="showDeleteRoomModal"
        @close-modal="showDeleteRoomModal = false"
        @delete-clicked="deleteRoom"
        modal-title="delete-room-modal.title"
      >
        <p class="text-sm text-gray-500">
          {{ $t("delete-room-modal.message") }}
        </p>
      </DeletionModal>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">
          {{ $t("rooms") }} {{ $t("of") }} {{ site.name }}
        </h2>
        <div class="flex flex-row">
          <router-link
            v-if="isOwner"
            class="gray-button btn-sm m-2 mr-0 w-max font-semibold"
            :to="{
              name: 'addRoom',
              params: { siteId: siteId },
            }"
          >
            <PlusIcon class="mr-2 h-4 w-4" />
            <span>{{ $t("room.add") }}</span>
          </router-link>
        </div>
      </div>

      <table
        class="min-w-full divide-y divide-gray-200 overflow-hidden rounded-sm bg-white ring-1 ring-gray-300"
      >
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6"
            >
              {{ $t("room.name") }}
            </th>
            <th
              scope="col"
              class="py-3 text-right text-xs font-medium tracking-wider text-gray-500 sm:px-6"
            >
              {{ $t("room.size") }} [m<sup>2</sup>]
            </th>
            <th
              scope="col"
              class="py-3 text-right text-xs font-medium tracking-wider text-gray-500 sm:px-6"
            >
              {{ $t("room.height") }} [m]
            </th>
            <th
              scope="col"
              class="hidden py-3 text-right text-xs font-medium tracking-wider text-gray-500 sm:px-6 md:table-cell"
            >
              {{ $t("room.maxOccupancy") }}
            </th>
            <th
              scope="col"
              class="px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6"
            >
              {{ $t("action") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(room, roomIdx) in rooms"
            :key="room._jv.id"
            :class="[roomIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
          >
            <td class="whitespace-nowrap px-2 py-4 sm:px-6">
              <router-link
                class="como-link"
                :to="{
                  name: 'room',
                  params: { roomId: room._jv.id },
                }"
              >
                {{ room.name }}
              </router-link>
            </td>
            <td class="whitespace-nowrap px-2 py-4 text-right sm:px-6">
              {{ room.size_sqm ? $n(Number(room.size_sqm)) : "-" }}
            </td>
            <td class="whitespace-nowrap px-2 py-4 text-right sm:px-6">
              {{ room.height_m ? $n(Number(room.height_m)) : "-" }}
            </td>
            <td
              class="hidden whitespace-nowrap px-2 py-4 text-right sm:px-6 md:table-cell"
            >
              {{ room.max_occupancy || "-" }}
            </td>
            <td class="whitespace-nowrap px-2 py-4 sm:px-6">
              <div class="flex flex-col sm:flex-row">
                <div
                  v-if="isOwner"
                  class="gray-button btn-sm m-2 mr-0 font-semibold"
                  @click="
                    () => {
                      openDeleteRoomModal();
                      deleteRoomId = room._jv.id;
                    }
                  "
                >
                  <TrashIcon class="mr-2 h-4 w-4" />
                  <span>{{ $t("remove") }}</span>
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
          {{ $t("site.noRooms") }}.
          <router-link
            v-if="isOwner"
            class="font-medium text-yellow-700 underline hover:text-yellow-600"
            :to="{
              name: 'addRoom',
              params: { siteId: siteId },
            }"
            >{{ $t("room.add") }}.</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>
