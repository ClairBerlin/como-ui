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
    store.dispatch("jv/patch", [
      updatedOrg,
      { url: `organizations/${route.params.id}/` },
    ]);
  }
};
</script>

<template>
  <div class="ring-1 ring-gray-300 rounded-md bg-white text-black">
    <div class="ring-1 ring-gray-300 rounded-md bg-white">
      <label>
        <span>Organization Name</span>
      </label>
      <input
        type="text"
        v-model.trim="newOrgName"
        :placeholder="currentOrg.name"
      />
    </div>
    <div class="ring-1 ring-gray-300 rounded-md bg-white">
      <label>
        <span>Description</span>
      </label>
      <textarea
        v-model.trim="newOrgDescription"
        :placeholder="currentOrg.description"
      ></textarea>
    </div>
    <button v-if="isOwner" @click="updateOrganization">Update</button>
  </div>
</template>
