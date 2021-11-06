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
  <div class="bg-white shadow-md rounded-md mt-8 p-2">
    <div v-if="hasRooms">
      Sites:
      <ul id="rooms-list">
        <li v-for="room in rooms" :key="room._jv.id">
          ID: {{ room._jv.id }}, Name: {{ room.name }}, Size [m<sup>2</sup>]:
          {{ room.size_sqm }}, Height [m]: {{ room.height_m }}, Max. Occupancy:
          {{ room.max_occupancy }}
          <router-link
            :to="{
              name: 'room',
              params: { roomId: room._jv.id },
            }"
            >Inspect and modify room</router-link
          >
        </li>
      </ul>
    </div>
  </div>
</template>
