<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

const store = useStore();
const toast = useToast();
const router = useRouter();

const newOrgName = ref(undefined);
const newOrgDescription = ref(undefined);

const createOrg = async () => {
  if (newOrgName.value || newOrgDescription.value) {
    let newOrg = { _jv: { type: "Organization" } };
    if (newOrgName.value) {
      newOrg["name"] = newOrgName.value;
    }
    if (newOrgDescription.value) {
      newOrg["description"] = newOrgDescription.value;
    }
    try {
      const { _jv } = await store.dispatch("jv/post", [
        newOrg,
        { url: `organizations/` },
      ]);
      router.push({ path: `/org-management/${_jv.id}` });
    } catch (e) {
      toast.error("Failed to create the organization");
    }
  }
};
</script>

<template>
  <div class="max-w-sm">
    <div class="text-black m-2 p-4 card ring-1 ring-gray-300 bg-white">
      <div class="form-control">
        <label class="label">
          <span class="label-text text-black font-bold">Organization Name</span>
        </label>
        <input
          type="text"
          v-model.trim="newOrgName"
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
          placeholder="(optional)"
          class="como-focus text-area rounded h-24 text-gray-600"
        />
      </div>
      <button class="mt-2 btn gray-button" @click="createOrg">
        Create new organization
      </button>
    </div>
  </div>
</template>
