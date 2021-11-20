<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { ExclamationIcon } from "@heroicons/vue/outline";
import DeletionModal from "@/components/DeletionModal.vue";

const route = useRoute();
const store = useStore();

// This view is routed to in an organization context only, this orgId is defined.
const currentOrgId = computed(() => route.params.orgId);
const rooms = ref(undefined);

const hasRooms = computed(() => rooms.value?.length > 0);
const isLoading = ref(true);

const showDeleteRoomModal = ref(false);
const deleteRoomId = ref();
const openDeleteRoomModal = () => (showDeleteRoomModal.value = true);

const orgMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.orgId)
);
const isOwner = computed(() => orgMembership.value?.role === "O");

const deleteRoom = async () => {
  await store.dispatch("jv/delete", `rooms/${deleteRoomId.value}`);
  updateView();
};

async function updateView() {
  isLoading.value = true;
  const roomObj = await store.dispatch("jv/get", [
    "rooms",
    { params: { "filter[organization]": currentOrgId.value } },
  ]);
  const roomList = Object.entries(roomObj);
  console.log(`Organization has ${roomList.length} room(s).`);
  rooms.value = roomList.map(([_, room]) => room);
  const relatedResourcePromises = roomList.map(([roomId, _]) => {
    console.log(`Fetch related objects for room ${roomId}.`);
    return store.dispatch("jv/getRelated", `rooms/${roomId}`);
  });
  await Promise.all(relatedResourcePromises);
  isLoading.value = false;
}

onMounted(async () => updateView());
watch(currentOrgId, () => updateView());
</script>

<template>
  <div v-if="isLoading">{{ $t("loading...") }}</div>
  <div
    v-else-if="hasRooms"
    class="
      ring-1 ring-gray-300
      rounded-md
      bg-white
      text-md
      overflow-hidden
      mt-8
    "
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
            {{ $t("room.name") }}
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
            {{ $t("room.size") }} [m<sup>2</sup>]
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
            {{ $t("room.height") }} [m]
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
            {{ $t("room.maxOccupancy") }}
          </th>
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
            {{ $t("site.singular") }}
          </th>
          <th
            scope="col"
            class="
              sm:px-6
              py-3
              text-left text-xs
              font-medium
              text-gray-500
              tracking-wider
            "
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
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            {{ room.name }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
            {{ room.size_sqm }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
            {{ room.height_m }}
          </td>
          <td
            class="
              hidden
              md:table-cell
              px-2
              sm:px-6
              py-4
              whitespace-nowrap
              text-right
            "
          >
            {{ room.max_occupancy }}
          </td>
          <td class="hidden md:table-cell px-2 sm:px-6 py-4 whitespace-nowrap">
            <router-link
              class="
                font-medium
                underline
                text-blue-700
                hover:text-blue-600 hover:no-underline
              "
              :to="{
                name: 'site',
                params: { siteId: room.site._jv.id },
              }"
            >
              {{ room.site.name }}
            </router-link>
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col sm:flex-row">
              <div class="flex flex-row">
                <router-link
                  class="btn-sm m-2 mr-0 gray-button font-semibold w-max"
                  :to="{
                    name: 'room',
                    params: { roomId: room._jv.id },
                  }"
                  >{{ $t("inspect") }}</router-link
                >
              </div>
              <div
                v-if="isOwner"
                class="btn-sm m-2 mr-0 gray-button font-semibold w-max"
                @click="
                  () => {
                    openDeleteRoomModal();
                    deleteRoomId = room._jv.id;
                  }
                "
              >
                {{ $t("remove") }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
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
        {{ $t("room.noRoom") }}.
        <router-link
          to="sites"
          class="font-medium underline text-yellow-700 hover:text-yellow-600"
        >
          {{ $t("room.siteForRoom") }}
        </router-link>
      </div>
    </div>
  </div>
</template>
