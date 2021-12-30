<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { BanIcon } from "@heroicons/vue/outline";
import OrganizationForm from "@/components/forms/OrganizationForm.vue";

const store = useStore();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});

const currentOrg = computed(() =>
  store.getters["jv/get"]({
    _jv: { type: "Organization", id: currentOrgId.value },
  })
);

const isOwner = computed(() => {
  return store.getters["nav/isOwner"];
});

const updateOrganization = async ({ name, description }) => {
  let updatedOrg = {
    _jv: {
      type: "Organization",
      id: route.params.orgId,
    },
    name,
    description,
  };
  try {
    await store.dispatch("jv/patch", [
      updatedOrg,
      { url: `organizations/${route.params.orgId}/` },
    ]);
    toast.success(t("org.updateSuccess"));
  } catch (e) {
    toast.error(t("org.updateError"));
  }
};
</script>

<template>
  <header class="bg-white shadow-md sm:rounded-md" v-if="$route.meta.title">
    <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">
        {{ $t("org.edit") }}
      </h1>
    </div>
  </header>
  <div class="max-w-sm sm:max-w-lg mt-8">
    <div
      v-if="!isOwner"
      class="shadow-md mt-4 rounded-md flex items-center bg-red-50 border-l-4 border-red-400 p-4"
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
              params: { orgId: currentOrgId },
            }"
            class="font-medium underline text-red-700 hover:text-red-600"
          >
            Find their contact information here.
          </router-link>
        </div>
      </div>
    </div>
    <div v-else class="bg-white rounded-md shadow-md p-6">
      <OrganizationForm
        :allow-edit="isOwner"
        :org-name="currentOrg?.name"
        :org-description="currentOrg?.description"
        button-text="update"
        :on-submit="updateOrganization"
      />
    </div>
  </div>
</template>
