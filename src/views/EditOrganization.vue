<script setup>
import { onMounted, ref, watch } from "vue";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { BanIcon } from "@heroicons/vue/outline";
const store = useStore();
const route = useRoute();

const newOrgName = ref(undefined);
const newOrgDescription = ref(undefined);

onMounted(
  async () => await store.dispatch("jv/get", `organizations/${route.params.orgId}`)
);

const currentOrg = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Organization", id: route.params.orgId },
  })
);

watch(() => console.log(currentOrg.value));

const orgMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.orgId)
);

const isOwner = computed(() => orgMembership.value?.role === "O");

const updateOrganization = () => {
  if (newOrgName.value || newOrgDescription.value) {
    let updatedOrg = {
      _jv: {
        type: "Organization",
        id: route.params.orgId,
      },
    };
    if (newOrgName.value) {
      updatedOrg["name"] = newOrgName.value;
    }
    if (newOrgDescription.value) {
      updatedOrg["description"] = newOrgDescription.value;
    }
    store.dispatch("jv/patch", [
      updatedOrg,
      { url: `organizations/${route.params.orgId}/` },
    ]);
  }
};
</script>

<template>
  <div class="max-w-sm">
    <div v-if="!isOwner" class="alert alert-error">
      <div class="flex items-center justify-between">
        <BanIcon class="h-12 w-12 mr-4" />
        <label class="font-semibold">
          Only an Owner of an organization can change name and/or description
        </label>
      </div>
    </div>
    <div v-else class="text-black m-2 p-4 card ring-1 ring-gray-300 bg-white">
      <div class="form-control">
        <label class="label">
          <span class="label-text text-black font-bold">Organization Name</span>
        </label>
        <input
          type="text"
          v-model.trim="newOrgName"
          :placeholder="currentOrg.name"
          class="input-bordered como-focus rounded bg-white text-gray-600"
        />
      </div>
      <div class="form-control py-4">
        <label class="label">
          <span class="label-text text-black font-bold">Description</span>
        </label>
        <input
          type="text"
          v-model.trim="newOrgDescription"
          :placeholder="currentOrg.description"
          class="como-focus text-area rounded h-24 text-gray-600"
        />
      </div>
      <button class="mt-2 btn gray-button" @click="updateOrganization">
        Update
      </button>
    </div>
  </div>
</template>
