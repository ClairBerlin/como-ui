<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { ExclamationIcon, TrashIcon } from "@heroicons/vue/outline";
import DeletionModal from "@/components/DeletionModal.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { useI18n } from "vue-i18n";

const store = useStore();

const { n } = useI18n();

const isLoading = computed(() => {
  return store.getters["nav/isOrgContextLoading"];
});

const isOwner = computed(() => {
  return store.getters["nav/isOwner"];
});

const rooms = computed(() => {
  return store.getters["nav/getRooms"];
});

const hasRooms = computed(() => rooms.value?.length > 0);

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
</script>

<template>
  <LoadingSpinner v-if="isLoading" />
  <div
    v-else-if="hasRooms"
    class="text-md mt-8 overflow-hidden rounded-sm bg-white ring-1 ring-gray-300"
  >
    <DeletionModal
      :open="showDeleteRoomModal"
      @close-modal="showDeleteRoomModal = false"
      @delete-clicked="deleteRoom"
      modal-title="delete-room-modal.title"
    >
      <p class="text-sm text-gray-500">{{ $t("delete-room-modal.message") }}</p>
    </DeletionModal>

    <table class="min-w-full divide-y divide-gray-200">
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
            {{ $t("site.singular") }}
          </th>
          <th
            scope="col"
            class="py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6"
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
            {{ n(Number(room.size_sqm)) || "-" }}
          </td>
          <td class="whitespace-nowrap px-2 py-4 text-right sm:px-6">
            {{ n(Number(room.height_m)) || "-" }}
          </td>
          <td
            class="hidden whitespace-nowrap px-2 py-4 text-right sm:px-6 md:table-cell"
          >
            {{ room.max_occupancy || "-" }}
          </td>
          <td class="hidden whitespace-nowrap px-2 py-4 sm:px-6 md:table-cell">
            <router-link
              class="como-link"
              :to="{
                name: 'site',
                params: { siteId: room.site._jv.id },
              }"
            >
              {{ room.site.name }}
            </router-link>
          </td>
          <td class="whitespace-nowrap px-2 py-4 sm:px-6">
            <div class="flex flex-col sm:flex-row">
              <div
                v-if="isOwner"
                class="gray-button btn-sm w-max font-semibold"
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
        {{ $t("room.noRoom") }}.
        <router-link
          to="sites"
          class="font-medium text-yellow-700 underline hover:text-yellow-600"
        >
          {{ $t("room.siteForRoom") }}
        </router-link>
      </div>
    </div>
  </div>
</template>
