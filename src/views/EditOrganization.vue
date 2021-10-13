<script setup>
import { onMounted, ref } from "vue";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();

const newOrgName = ref(undefined);
const newOrgDescription = ref(undefined);

onMounted(
  async () => await store.dispatch("jv/get", `organizations/${route.params.id}`)
);

const currentOrg = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Organization", id: route.params.id },
  })
);

const orgMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.id)
);

const isOwner = computed(() => orgMembership.value?.role === "O");

const updateOrganization = () => {
  if (newOrgName.value || newOrgDescription.value) {
    let updatedOrg = {
      _jv: {
        type: "Organization",
        id: route.params.id,
      },
    };
    if (newOrgName.value) {
      updatedOrg["name"] = newOrgName.value;
    }
    if (newOrgDescription.value) {
      updatedOrg["description"] = newOrgDescription.value;
    }
    console.log({ updatedOrg });
    store.dispatch("jv/patch", [
      updatedOrg,
      { url: `organizations/${route.params.id}/` },
    ]);
  }
};
</script>

<template>
  <div class="m-2 p-2 card bg-base-content">
    <div class="form-control bg-base-content">
      <label class="label">
        <span class="label-text text-black">Organization Name</span>
      </label>
      <input
        type="text"
        v-model.trim="newOrgName"
        :placeholder="currentOrg.name"
        class="input rounded bg-white text-gray-600"
      />
    </div>
    <div class="form-control bg-base-content">
      <label class="label">
        <span class="label-text text-black">Description</span>
      </label>
      <input
        type="text"
        v-model.trim="newOrgDescription"
        :placeholder="currentOrg.description"
        class="text-area rounded h-24 text-gray-600"
      />
    </div>
    <button
      class="mt-2 btn gray-button max-w-xs"
      v-if="isOwner"
      @click="updateOrganization"
    >
      Update
    </button>
  </div>
</template>
