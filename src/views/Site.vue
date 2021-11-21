<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { ExclamationIcon, TrashIcon, PlusIcon } from "@heroicons/vue/outline";
import { useI18n } from "vue-i18n";
import DeletionModal from "@/components/DeletionModal.vue";

const { t } = useI18n();

// TODO: Add Site name to dashboard title.
const route = useRoute();
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

const showDeleteRoomModal = ref(false);
const deleteRoomId = ref();
const openDeleteRoomModal = () => (showDeleteRoomModal.value = true);

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

const deleteRoom = async () => {
  await store.dispatch("jv/delete", `rooms/${deleteRoomId.value}`);
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
  if (newSiteDescription.value) {
    newSite["description"] = newSiteDescription.value;
  }
  try {
    const { _jv } = await store.dispatch("jv/patch", [
      newSite,
      { url: `sites/${siteId.value}/` },
    ]);
    toast.success(t("site.updateSuccess"));
  } catch (e) {
    toast.error(t("site.updateError"));
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
  if (newStreet1.value) {
    newAddress["street1"] = newStreet1.value;
  }
  if (newStreet2.value) {
    newAddress["street2"] = newStreet2.value;
  }
  if (newZip.value) {
    newAddress["zip"] = newZip.value;
  }
  if (newCity.value) {
    newAddress["city"] = newCity.value;
  }
  try {
    const { _jv } = await store.dispatch("jv/patch", [
      newAddress,
      { url: `addresses/${addressId.value}/` },
    ]);
    toast.success(t("address.updateSuccess"));
  } catch (e) {
    toast.error(t("address.updateError"));
  }
};

const updateData = async () => {
  if (newSiteName.value || newSiteDescription.value) {
    updateSite();
    newSiteName.value = undefined;
    newSiteDescription.value = undefined;
  }
  if (newStreet1.value || newStreet2.value || newZip.value || newCity.value) {
    updateAddress();
    newStreet1.value = undefined;
    newStreet2.value = undefined;
    newZip.value = undefined;
    newCity.value = undefined;
  }
  updateView();
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
  rooms.value = roomList.map(([, room]) => room);
  isLoading.value = false;
};

onMounted(async () => updateView());
</script>

<template>
  <div v-if="isLoading">{{ $t("loading...") }}</div>
  <div v-else class="divide-y-2 divide-gray-300">
    <form class="space-y-8 divide-y divide-gray-200">
      <div>
        <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
          <div
            class="
              sm:grid
              sm:grid-cols-3
              sm:gap-4
              sm:items-start
              sm:border-t
              sm:border-gray-200
              sm:pt-5
            "
          >
            <label
              for="site-name"
              class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              {{ $t("site.name") }}
            </label>
            <div class="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                name="site-name"
                id="site-name"
                v-model.trim="newSiteName"
                :placeholder="site.name"
                class="
                  max-w-lg
                  block
                  w-full
                  shadow-sm
                  focus:ring-indigo-500 focus:border-indigo-500
                  sm:max-w-xs sm:text-sm
                  border-gray-300
                  rounded-md
                "
              />
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6 sm:space-y-5">
        <div
          class="
            sm:grid
            sm:grid-cols-3
            sm:gap-4
            sm:items-start
            sm:border-t
            sm:border-gray-200
            sm:pt-5
          "
        >
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            {{ $t("description") }}
          </label>
          <div class="mt-1 sm:mt-0 sm:col-span-2">
            <textarea
              id="description"
              name="description"
              rows="3"
              v-model.trim="newSiteDescription"
              :placeholder="site.description || '-'"
              class="
                max-w-lg
                shadow-sm
                block
                w-full
                focus:ring-indigo-500 focus:border-indigo-500
                sm:text-sm
                border border-gray-300
                rounded-md
              "
            />
            <p class="mt-2 text-sm text-gray-500">
              {{ $t("optional") }}
            </p>
          </div>
        </div>

        <div
          class="
            sm:grid
            sm:grid-cols-3
            sm:gap-4
            sm:items-start
            sm:border-t
            sm:border-gray-200
            sm:pt-5
          "
        >
          <label
            for="street-address"
            class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            {{ $t("address.street1") }}
          </label>
          <div class="mt-1 sm:mt-0 sm:col-span-2">
            <input
              type="text"
              name="street-address"
              id="street-address"
              autocomplete="street-address"
              v-model.trim="newStreet1"
              :placeholder="site.address.street1"
              class="
                block
                max-w-lg
                w-full
                shadow-sm
                focus:ring-indigo-500 focus:border-indigo-500
                sm:text-sm
                border-gray-300
                rounded-md
              "
            />
          </div>
        </div>

        <div
          class="
            sm:grid
            sm:grid-cols-3
            sm:gap-4
            sm:items-start
            sm:border-t
            sm:border-gray-200
            sm:pt-5
          "
        >
          <label
            for="street-address2"
            class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            {{ $t("address.street2") }}
          </label>
          <div class="mt-1 sm:mt-0 sm:col-span-2">
            <input
              type="text"
              name="street-address2"
              id="street-address2"
              v-model.trim="newStreet2"
              :placeholder="site.address.street2"
              autocomplete="address-level4"
              class="
                block
                max-w-lg
                w-full
                shadow-sm
                focus:ring-indigo-500 focus:border-indigo-500
                sm:text-sm
                border-gray-300
                rounded-md
              "
            />
          </div>
        </div>

        <div
          class="
            sm:grid
            sm:grid-cols-3
            sm:gap-4
            sm:items-start
            sm:border-t
            sm:border-gray-200
            sm:pt-5
          "
        >
          <label
            for="postal-code"
            class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            {{ $t("address.zip") }}
          </label>
          <div class="mt-1 sm:mt-0 sm:col-span-2">
            <input
              type="text"
              name="postal-code"
              id="postal-code"
              autocomplete="postal-code"
              v-model.trim="newZip"
              :placeholder="site.address.zip"
              class="
                max-w-lg
                block
                w-full
                shadow-sm
                focus:ring-indigo-500 focus:border-indigo-500
                sm:max-w-xs sm:text-sm
                border-gray-300
                rounded-md
              "
            />
          </div>
        </div>
      </div>

      <div
        class="
          sm:grid
          sm:grid-cols-3
          sm:gap-4
          sm:items-start
          sm:border-t
          sm:border-gray-200
          sm:pt-5
        "
      >
        <label
          for="city"
          class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
        >
          {{ $t("address.city") }}
        </label>
        <div class="mt-1 sm:mt-0 sm:col-span-2">
          <input
            type="text"
            name="city"
            id="city"
            autocomplete="address-level2"
            v-model.trim="newCity"
            :placeholder="site.address.city"
            class="
              max-w-lg
              block
              w-full
              shadow-sm
              focus:ring-indigo-500 focus:border-indigo-500
              sm:max-w-xs sm:text-sm
              border-gray-300
              rounded-md
            "
          />
        </div>
      </div>

      <div class="pt-5">
        <div class="flex justify-end">
          <button
            type="submit"
            class="
              ml-3
              inline-flex
              justify-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              font-medium
              rounded-md
              text-white
              bg-indigo-600
              hover:bg-indigo-700
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-indigo-500
            "
            v-if="isOwner"
            @click="updateData"
          >
            {{ $t("site.update") }}
          </button>
        </div>
      </div>
    </form>
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
      <div class="flex justify-between items-center">
        <h2 class="font-bold text-xl">
          {{ $t("rooms") }} {{ $t("of") }} {{ site.name }}
        </h2>
        <div class="flex flex-row">
          <router-link
            v-if="isOwner"
            class="btn-sm m-2 mr-0 gray-button font-semibold w-max"
            :to="{
              name: 'addRoom',
              params: { siteId: siteId },
            }"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            <span>{{ $t("room.add") }}</span>
          </router-link>
        </div>
      </div>

      <table
        class="
          min-w-full
          divide-y divide-gray-200
          ring-1 ring-gray-300
          rounded-md
          bg-white
          overflow-hidden
        "
      >
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
            <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
              {{ room.size_sqm || "-" }}
            </td>
            <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
              {{ room.height_m || "-" }}
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
              {{ room.max_occupancy || "-" }}
            </td>
            <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
              <div class="flex flex-col sm:flex-row">
                <div
                  v-if="isOwner"
                  class="btn-sm m-2 mr-0 gray-button font-semibold"
                  @click="
                    () => {
                      openDeleteRoomModal();
                      deleteRoomId = room._jv.id;
                    }
                  "
                >
                  <TrashIcon class="w-4 h-4 mr-2" />
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
          {{ $t("site.noRooms") }}.
          <router-link
            v-if="isOwner"
            class="font-medium underline text-yellow-700 hover:text-yellow-600"
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
