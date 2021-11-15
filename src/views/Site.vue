<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { ExclamationIcon } from "@heroicons/vue/outline";

// TODO: Add Site name to dashboard title.
const route = useRoute();
const router = useRouter();
const store = useStore();
const toast = useToast();

const siteId = computed(() => route.params.siteId);
const site = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Site", id: siteId.value },
  })
);
const addressId = computed(() => site.value.address._jv.id);

const rooms = ref([]);
const hasRooms = computed(() => !isLoading.value && rooms.value?.length > 0);
const isLoading = ref(true);

const orgMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.orgId)
);
const isOwner = computed(() => orgMembership.value?.role === "O");

const newSiteName = ref(undefined);
const newSiteDescription = ref(undefined);
const newStreet1 = ref(undefined);
const newStreet2 = ref(undefined);
const newZip = ref(undefined);
const newCity = ref(undefined);

const deleteRoom = async (roomId) => {
  await store.dispatch("jv/delete", `rooms/${roomId}`);
  updateView();
};

const updateSite = async () => {
  let newSite = {
    _jv: {
      type: "Site",
      id: siteId.value,
    },
  };
  if (newSiteName.value) {
    newSite["name"] = newSiteName.value;
  }
  if (newSiteDescription) {
    newSite["description"] = newSiteDescription.value;
  }
  try {
    const { _jv } = await store.dispatch("jv/patch", [
      newSite,
      { url: `sites/${siteId.value}/` },
    ]);
    router.push({ name: "site", params: { siteId: siteId.value } });
  } catch (e) {
    toast.error("Failed to update the site");
    console.log(e);
  }
};

const updateAddress = async () => {
  let newAddress = {
    _jv: {
      type: "Address",
      id: addressId.value,
    },
  };
  if (newStreet1) {
    newAddress["street1"] = newStreet1.value;
  }
  if (newStreet2) {
    newAddress["street2"] = newStreet2.value;
  }
  if (newZip) {
    newAddress["zip"] = newZip.value;
  }
  if (newCity) {
    newAddress["city"] = newCity.value;
  }
  try {
    const { _jv } = await store.dispatch("jv/patch", [
      newAddress,
      { url: `addresses/${addressId.value}/` },
    ]);
  } catch (e) {
    toast.error("Failed to update the address");
    console.log(e);
  }
};

const updateData = async () => {
  if (newSiteName.value || newSiteDescription.value) {
    updateSite();
  }
  if (newStreet1.value || newStreet2.value || newZip.value || newCity.value) {
    updateAddress();
  }
  updateView();
  // router.push({ name: "site", params: { siteId: siteId.value } });
};

const updateView = async () => {
  isLoading.value = true;
  if (typeof site.value?.name === "undefined") {
    console.log(
      `Site with ID ${siteId.value} has not been loaded yet; fetching...`
    );
    const site = await store.dispatch("jv/get", `sites/${siteId.value}/`);
  }
  console.log(`Fetch related objects for site ${siteId.value}.`);
  await store.dispatch("jv/getRelated", `sites/${siteId.value}`);
  const roomObj = await store.dispatch("jv/get", `sites/${siteId.value}/rooms`);
  const roomList = Object.entries(roomObj);
  console.log(`Fetched ${roomList.length} rooms`);
  rooms.value = roomList.map(([_, room]) => room);
  isLoading.value = false;
};

onMounted(async () => updateView());
</script>

<template>
  <div v-if="isLoading">{{ $t("loading...") }}</div>
  <div v-else>
    <div class="max-w-sm sm:max-w-lg">
      <div class="text-black m-2 p-4 card ring-1 ring-gray-300 bg-white">
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold">{{
              $t("site.name")
            }}</span>
          </label>
          <input
            type="text"
            v-model.trim="newSiteName"
            :placeholder="site.name"
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
            v-model.trim="newSiteDescription"
            :placeholder="site.description"
            class="como-focus rounded h-24 text-gray-600"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold"
              >{{ $t("address.street1") }}
            </span>
          </label>
          <input
            type="text"
            v-model.trim="newStreet1"
            :placeholder="site.address.street1"
            class="input-bordered como-focus rounded bg-white text-gray-600"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold"
              >{{ $t("address.street2") }}
            </span>
          </label>
          <input
            type="text"
            v-model.trim="newStreet2"
            :placeholder="site.address.street2"
            class="input-bordered como-focus rounded bg-white text-gray-600"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold"
              >{{ $t("address.zip") }}
            </span>
          </label>
          <input
            type="text"
            v-model.trim="newZip"
            :placeholder="site.address.zip"
            class="input-bordered como-focus rounded bg-white text-gray-600"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold"
              >{{ $t("address.city") }}
            </span>
          </label>
          <input
            type="text"
            v-model.trim="newCity"
            :placeholder="site.address.city"
            class="input-bordered como-focus rounded bg-white text-gray-600"
          />
        </div>
        <button
          class="mt-2 btn gray-button font-semibold"
          v-if="isOwner"
          @click="updateData"
        >
          {{ $t("site.update") }}
        </button>
      </div>
    </div>
    <div
      v-if="hasRooms"
      class="
        ring-1 ring-gray-300
        rounded-md
        bg-white
        text-md
        overflow-hidden
        mt-8
      "
    >
      <div class="flex justify-end items-center">
        <div class="flex flex-row">
          <router-link
            v-if="isOwner"
            class="btn-sm m-2 mr-0 gray-button font-semibold w-max"
            :to="{
              name: 'addRoom',
              params: { siteId: siteId },
            }"
            >{{ $t("room.add") }}</router-link
          >
        </div>
      </div>

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
                px-2
                sm:px-6
                py-3
                text-left text-xs
                font-medium
                text-gray-500
                tracking-wider
              "
            >
              {{ $t("actions") }}
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
                  @click="deleteRoom(room._jv.id)"
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
          This site has no rooms. {{ " " }}
          <!-- TODO: use :to="{ name: 'sites-add' }" -->
          <router-link
            to="#"
            class="font-medium underline text-yellow-700 hover:text-yellow-600"
          >
            Click here to add one.
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
