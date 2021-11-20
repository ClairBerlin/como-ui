<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";

// TODO: Add room name to dashboard title.
const route = useRoute();
const router = useRouter();
const store = useStore();
const toast = useToast();
const { t } = useI18n();

const roomId = computed(() => route.params.roomId);
const room = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Room", id: roomId.value },
  })
);

const newRoomName = ref(undefined);
const newRoomDescription = ref(undefined);
const newRoomSize = ref(undefined);
const newRoomHeight = ref(undefined);
const newRoomMaxOccupancy = ref(undefined);

const installations = ref([]);
const hasInstallations = computed(
  () => !isLoading.value && installations.value?.length > 0
);
const isLoading = ref(true);

const orgMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.orgId)
);
const isOwner = computed(() => orgMembership.value?.role === "O");

const dayFormatTimestamp = (unixTimestamp) => {
  if (unixTimestamp === 2_147_483_647) {
    return "—";
  } else {
    return dayjs.unix(unixTimestamp).format("YYYY-MM-DD");
  }
};

const updateData = async () => {
  if (
    newRoomName.value ||
    newRoomDescription.value ||
    newRoomSize.value ||
    newRoomHeight.value ||
    newRoomMaxOccupancy.value
  ) {
    let newRoom = {
      _jv: {
        type: "Room",
        id: roomId.value,
      },
    };
    if (newRoomName.value) {
      newRoom["name"] = newRoomName.value;
    }
    if (newRoomDescription.value) {
      newRoom["description"] = newRoomDescription.value;
    }
    if (newRoomSize.value) {
      newRoom["size_sqm"] = newRoomSize.value;
    }
    if (newRoomHeight.value) {
      newRoom["height_m"] = newRoomHeight.value;
    }
    if (newRoomMaxOccupancy.value) {
      newRoom["max_occupancy"] = newRoomMaxOccupancy.value;
    }
    try {
      const { _jv } = await store.dispatch("jv/patch", [
        newRoom,
        { url: `rooms/${roomId.value}/` },
      ]);
      updateView();
    } catch (e) {
      toast.error(t("room.updateError"));
      console.log(e);
    }
  }
};

const updateView = async () => {
  isLoading.value = true;
  if (typeof room.value?.name === "undefined") {
    console.log(
      `Room with ID ${roomId.value} has not been loaded yet; fetching...`
    );
    const room = await store.dispatch("jv/get", `rooms/${roomId.value}/`);
  }
  console.log(`Fetch related objects for room ${roomId.value}.`);
  await store.dispatch("jv/getRelated", `rooms/${roomId.value}`);
  const installationObj = await store.dispatch(
    "jv/get",
    `rooms/${roomId.value}/installations`
  );
  const installationList = Object.entries(installationObj);
  console.log(`Fetched ${installationList.length} installations`);
  installations.value = installationList.map(
    ([_, installation]) => installation
  );
  const relatedResourcePromises = installationList.map(([instId, inst]) => {
    console.log(`Get related objects for installation ${instId}.`);
    return store.dispatch("jv/getRelated", `installations/${instId}`);
  });
  await Promise.all(relatedResourcePromises);
  isLoading.value = false;
};

onMounted(async () => updateView());
</script>

<template>
  <div class="bg-white shadow-md p-4 rounded-md max-w-xl mx-auto">
    <pre>VIEW DESCRIPTION (will be removed)</pre>
    This sub-view will detail information on the selected room an allow the user
    to update it; e.g., name, description, size, max. occupancy, etc. In
    addition, this view provides means to add and remove sensor installations in
    the selected room.
  </div>

  <div v-if="isLoading">{{ $t("loading...") }}</div>
  <div v-else>
    <div class="max-w-sm sm:max-w-lg">
      <div class="text-black m-2 p-4 card ring-1 ring-gray-300 bg-white">
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold">{{
              $t("room.name")
            }}</span>
          </label>
          <input
            type="text"
            v-model.trim="newRoomName"
            :placeholder="room.name"
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
            v-model.trim="newRoomDescription"
            :placeholder="room.description"
            class="como-focus rounded h-24 text-gray-600"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold"
              >{{ $t("room.size") }} [m<sup>2</sup>]
            </span>
          </label>
          <input
            type="text"
            v-model.trim="newRoomSize"
            :placeholder="room.size_sqm"
            class="input-bordered como-focus rounded bg-white text-gray-600"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold"
              >{{ $t("room.height") }} [m]
            </span>
          </label>
          <input
            type="text"
            v-model.trim="newRoomHeight"
            :placeholder="room.height_m"
            class="input-bordered como-focus rounded bg-white text-gray-600"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-black font-bold"
              >{{ $t("room.maxOccupancy") }}
            </span>
          </label>
          <input
            type="text"
            v-model.trim="newRoomMaxOccupancy"
            :placeholder="room.max_occupancy"
            class="input-bordered como-focus rounded bg-white text-gray-600"
          />
        </div>
        <button
          class="mt-2 btn gray-button font-semibold"
          v-if="isOwner"
          @click="updateData"
        >
          {{ $t("update") }}
        </button>
      </div>
    </div>

    <div
      v-if="hasInstallations"
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
              {{ $t("room.sensor") }}
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
              {{ $t("node.isPublic") }}
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
              {{ $t("node.installedOn") }}
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
              {{ $t("node.removedOn") }}
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
            v-for="(installation, installationIdx) in installations"
            :key="installation._jv.id"
            :class="[installationIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
          >
            <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
              {{ installation.node.alias }}
            </td>
            <td class="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
              {{ installation.is_public }}
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
                  v-if="isOwner"
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
  </div>
</template>
