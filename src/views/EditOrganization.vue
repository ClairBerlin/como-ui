<script setup>
import { onMounted, ref } from "vue";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { BanIcon } from "@heroicons/vue/outline";

const store = useStore();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const newOrgName = ref(undefined);
const newOrgDescription = ref(undefined);

onMounted(
  async () =>
    await store.dispatch("jv/get", `organizations/${route.params.orgId}`)
);

const currentOrg = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Organization", id: route.params.orgId },
  })
);

const orgMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.orgId)
);

const isOwner = computed(() => orgMembership.value?.role === "O");

const updateOrganization = async () => {
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
    try {
      await store.dispatch("jv/patch", [
        updatedOrg,
        { url: `organizations/${route.params.orgId}/` },
      ]);
      toast.success(t("org.updateSuccess"));
    } catch (e) {
      toast.error(t("org.updateError"));
    }
  }
};
</script>

<template>
  <header class="bg-white shadow-md sm:rounded-md" v-if="$route.meta.title">
    <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">
        {{ $t("org.edit") }}
      </h1>
    </div>
  </header>
  <div class="max-w-sm sm:max-w-lg mt-8">
    <div
      v-if="!isOwner"
      class="
        shadow-md
        mt-4
        rounded-md
        flex
        items-center
        bg-red-50
        border-l-4 border-red-400
        p-4
      "
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <BanIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div class="ml-3">
          Only the Owner of an organization can change the name and/or
          description. Contact the Owner of {{ currentOrg.name }}. {{ " " }}
          <router-link
            :to="{
              name: 'org-management-detail',
              params: { orgId: route.params.orgId },
            }"
            class="font-medium underline text-red-700 hover:text-red-600"
          >
            Find their contact information here.
          </router-link>
        </div>
      </div>
    </div>
    <div
      v-else
      class="text-black p-4 card rounded-md ring-1 ring-gray-300 bg-white"
    >
      <div class="form-control">
        <label class="label">
          <span class="label-text text-black font-bold">{{
            $t("org.name")
          }}</span>
        </label>
        <input
          type="text"
          v-model.trim="newOrgName"
          :placeholder="currentOrg.name"
          class="input-bordered como-focus rounded-md bg-white text-gray-600"
        />
      </div>
      <div class="form-control py-4">
        <label class="label">
          <span class="label-text text-black font-bold">
            {{ $t("description") }}
          </span>
        </label>
        <textarea
          type="text"
          v-model.trim="newOrgDescription"
          :placeholder="currentOrg?.description || '(optional)'"
          class="como-focus area rounded-md h-24 text-gray-600"
        />
      </div>
      <button
        class="mt-2 btn gray-button font-semibold"
        @click="updateOrganization"
      >
        {{ $t("update") }}
      </button>
    </div>
  </div>
</template>
