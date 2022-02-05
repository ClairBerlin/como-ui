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
    <div class="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">
        {{ $t("org.edit") }}
      </h1>
    </div>
  </header>
  <div class="mt-8 max-w-sm sm:max-w-lg">
    <div
      v-if="!isOwner"
      class="mt-4 flex items-center rounded-md border-l-4 border-red-400 bg-red-50 p-4 shadow-md"
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
            class="font-medium text-red-700 underline hover:text-red-600"
          >
            Find their contact information here.
          </router-link>
        </div>
      </div>
    </div>
    <div v-else class="rounded-md bg-white p-6 shadow-md">
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
