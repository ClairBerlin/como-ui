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

async function update() {
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
  <div class="ring-1 ring-gray-300 rounded-md bg-white text-md overflow-hidden">
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
              text-left text-xs
              font-medium
              text-gray-500
              tracking-wider
              hidden
              sm:table-cell
            "
          >
            Size [m<sup>2</sup>]
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
              hidden
              sm:table-cell
            "
          >
            Height [m]
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
              hidden
              sm:table-cell
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
              hidden
              sm:table-cell
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
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            {{ room.size_sqm }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            {{ room.height_m }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
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
</template>
