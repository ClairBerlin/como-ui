<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

// This view is routed to in an organization context only, this orgId is defined.
const currentOrgId = computed(() => route.params.orgId);
const rooms = ref(undefined);

const hasRooms = computed(() => rooms.value?.length > 0);
const isLoading = ref(true);

async function update() {
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

onMounted(async () => update());
watch(currentOrgId, () => update());
</script>

<template>
  <div class="bg-white shadow-md p-4 rounded-md max-w-xl mx-auto">
    <pre>VIEW DESCRIPTION (will be removed)</pre>
    This view will list all rooms of the selected organization, information
    about each room, air quality information of the individual sensors installed
    in the room (once we know how to best summarize this information), and links
    to the visualization for each sensor. Once we learn how to synthesize
    information from multiple sensors in a single room, this information may be
    viewed here as well.
  </div>
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
            Room Name
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
            Size [m<sup>2</sup>]
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
            Height [m]
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
            Max. Occupancy
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
            Action
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
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-row">
              <router-link
                class="gray-button"
                :to="{
                  name: 'room',
                  params: { roomId: room._jv.id },
                }"
                >Inspect</router-link
              >
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
        This organization has no rooms. {{ " " }}
        <!-- TODO: use :to="{ name: 'rooms-add' }" -->
        <router-link
          to="#"
          class="font-medium underline text-yellow-700 hover:text-yellow-600"
        >
          Click here to add one.
        </router-link>
      </div>
    </div>
  </div>
</template>
