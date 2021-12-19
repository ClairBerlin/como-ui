<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const store = useStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const siteId = computed(() => route.params.siteId);
const site = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Site", id: siteId.value },
  })
);

// TODO: Check ownership status first.

const newRoomName = ref(undefined);
const newRoomDescription = ref(undefined);
const newRoomSize = ref(undefined);
const newRoomHeight = ref(undefined);
const newRoomMaxOccupancy = ref(undefined);

const createRoom = async () => {
  if (newRoomName.value) {
    let newRoom = {
      _jv: {
        type: "Room",
        relationships: {
          site: {
            data: {
              type: "Site",
              id: siteId.value,
            },
          },
        },
      },
      name: newRoomName.value,
    };
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
      await store.dispatch("jv/post", [newRoom, { url: `rooms/` }]);
      router.push({
        name: "site",
        params: { siteId: siteId.value },
      });
    } catch (e) {
      toast.error(t("room.createError"));
    }
  }
};
</script>

<template>
  <header class="bg-white shadow-md sm:rounded-md" v-if="$route.meta.title">
    <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">
        {{ $t("room.addRoomToSite") }} {{ site.name }}
      </h1>
    </div>
  </header>

  <div class="max-w-sm sm:max-w-lg">
    <div
      class="text-black mt-2 p-4 card rounded-md shadow-md ring-1 ring-gray-300 bg-white"
    >
      <div class="form-control">
        <label class="label">
          <span class="label-text text-black font-bold">{{
            $t("room.name")
          }}</span>
        </label>
        <input
          type="text"
          v-model.trim="newRoomName"
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
          placeholder="(optional)"
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
          placeholder="(optional)"
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
          placeholder="(optional)"
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
          placeholder="(optional)"
          class="input-bordered como-focus rounded bg-white text-gray-600"
        />
      </div>
      <button class="mt-2 btn gray-button font-semibold" @click="createRoom">
        {{ $t("room.add") }}
      </button>
    </div>
  </div>
</template>
