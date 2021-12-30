<script setup>
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import OrganizationForm from "@/components/forms/OrganizationForm.vue";

const store = useStore();
const toast = useToast();
const router = useRouter();
const { t } = useI18n();

const createOrg = async ({ name, description }) => {
  let newOrg = { _jv: { type: "Organization" }, name, description };
  try {
    const { _jv } = await store.dispatch("jv/post", [
      newOrg,
      { url: `organizations/` },
    ]);
    router.push({ name: "org-management-detail", params: { orgId: _jv.id } });
  } catch (e) {
    toast.error(t("org.createError"));
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
    <div class="bg-white rounded-md shadow-md p-6">
      <OrganizationForm
        allow-edit
        button-text="org.create"
        :on-submit="createOrg"
      />
    </div>
  </div>
</template>
