<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import SiteForm from "@/components/forms/SiteForm.vue";

const store = useStore();
const toast = useToast();
const router = useRouter();
const { t } = useI18n();

const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});

const isOwner = computed(() => {
  return store.getters["nav/isOwner"];
});

const create = async ({ name, description, street1, street2, zip, city }) => {
  const addressId = await createAddress({ street1, street2, zip, city });
  createSite({ name, description, addressId });
};

const createSite = async ({ name, description, addressId }) => {
  let newSite = {
    _jv: {
      type: "Site",
      relationships: {
        operator: {
          data: {
            type: "Organization",
            id: currentOrgId.value,
          },
        },
        address: {
          data: {
            type: "Address",
            id: addressId,
          },
        },
      },
    },
    name,
    description,
  };
  try {
    const { _jv } = await store.dispatch("jv/post", [
      newSite,
      { url: `sites/` },
    ]);
    router.push({ name: "sites", params: { siteId: _jv.id } });
  } catch (e) {
    toast.error(t("site.createError"));
  }
};

const createAddress = async ({ street1, street2, zip, city }) => {
  let newAddress = {
    _jv: {
      type: "Address",
    },
    street1,
    street2,
    zip,
    city,
  };
  try {
    // TODO: Check if address already exists and use existing one in case.
    const { _jv } = await store.dispatch("jv/post", [
      newAddress,
      { url: "/addresses/" },
    ]);
    return _jv.id;
  } catch (e) {
    toast.error(t("address.createError"));
    console.log(e);
  }
};
</script>

<template>
  <div class="max-w-sm sm:max-w-lg mt-8">
    <div class="bg-white rounded-md shadow-md p-6">
      <SiteForm
        :allow-edit="isOwner"
        button-text="site.add"
        :on-submit="create"
      />
    </div>
  </div>
</template>
