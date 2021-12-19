<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import OrganizationForm from "@/components/forms/OrganizationForm.vue";

const store = useStore();
const toast = useToast();
const router = useRouter();
const { t } = useI18n();

const newOrgName = ref(undefined);
const newOrgDescription = ref(undefined);

const isOwner = true; // TODO: check

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
      router.push({ name: "org-management-detail", params: { orgId: _jv.id } });
    } catch (e) {
      toast.error(t("org.createError"));
    }
  }
};
</script>

<template>
  <header class="bg-white shadow-md sm:rounded-md" v-if="$route.meta.title">
    <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">
        {{ $t("org.add") }}
      </h1>
    </div>
  </header>
  <div class="max-w-sm sm:max-w-lg mt-8">
    <div class="text-black p-4 card rounded-md ring-1 ring-gray-300 bg-white">
      <div class="form-control">
        <label class="label">
          <span class="label-text text-black font-bold">{{
            $t("org.name")
          }}</span>
        </label>
        <input
          type="text"
          v-model.trim="newOrgName"
          class="input-bordered como-focus rounded-md bg-white text-gray-600"
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
          v-model.trim="newOrgDescription"
          placeholder="(optional)"
          class="como-focus rounded-md h-24 text-gray-600"
        />
      </div>
      <button class="mt-2 btn gray-button font-semibold" @click="createOrg">
        {{ $t("org.create") }}
      </button>
    </div>
  </div>
  <div>testing</div>
  <OrganizationForm
    :name="newOrgName"
    :description="newOrgDescription"
    :allow-edit="isOwner"
    button-text="org.create"
    :submit="createOrg"
  />
  <div>testing</div>
</template>
