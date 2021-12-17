<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const store = useStore();
const toast = useToast();
const router = useRouter();
const { t } = useI18n();

const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});

const newSiteName = ref(undefined);
const newSiteDescription = ref(undefined);
const newStreet1 = ref(undefined);
const newStreet2 = ref(undefined);
const newZip = ref(undefined);
const newCity = ref(undefined);

// TODO: Check if the user is owner of the site.

const createSite = async () => {
  if (newSiteName.value && newStreet1.value && newCity.value && newZip.value) {
    const addressId = await createAddress();
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
      name: newSiteName.value,
    };
    if (newSiteDescription.value) {
      newSite["description"] = newSiteDescription.value;
    }
    try {
      const { _jv } = await store.dispatch("jv/post", [
        newSite,
        { url: `sites/` },
      ]);
      router.push({ name: "sites", params: { siteId: _jv.id } });
    } catch (e) {
      toast.error(t("site.createError"));
    }
  } else {
    toast.error(t("site.missingNameAddress"));
  }
};

const createAddress = async () => {
  let newAddress = {
    _jv: {
      type: "Address",
    },
    street1: newStreet1.value,
    zip: newZip.value,
    city: newCity.value,
  };
  if (newStreet2.value) {
    newAddress["street2"] = newStreet2.value;
  }
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
  <div class="max-w-sm sm:max-w-lg">
    <div class="text-black p-4 card rounded-md shadow-md bg-white">
      <div class="form-control">
        <label class="label">
          <span class="label-text text-black font-bold">{{
            $t("site.name")
          }}</span>
        </label>
        <input
          type="text"
          v-model.trim="newSiteName"
          class="input-bordered como-focus rounded bg-white text-gray-600"
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
          v-model.trim="newSiteDescription"
          placeholder="(optional)"
          class="como-focus rounded h-24 text-gray-600"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text text-black font-bold"
            >{{ $t("address.street1") }}
          </span>
        </label>
        <input
          type="text"
          v-model.trim="newStreet1"
          class="input-bordered como-focus rounded bg-white text-gray-600"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text text-black font-bold"
            >{{ $t("address.street2") }}
          </span>
        </label>
        <input
          type="text"
          v-model.trim="newStreet2"
          class="input-bordered como-focus rounded bg-white text-gray-600"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text text-black font-bold"
            >{{ $t("address.zip") }}
          </span>
        </label>
        <input
          type="text"
          v-model.trim="newZip"
          class="input-bordered como-focus rounded bg-white text-gray-600"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text text-black font-bold"
            >{{ $t("address.city") }}
          </span>
        </label>
        <input
          type="text"
          v-model.trim="newCity"
          class="input-bordered como-focus rounded bg-white text-gray-600"
        />
      </div>
      <button class="mt-2 btn gray-button font-semibold" @click="createSite">
        {{ $t("site.add") }}
      </button>
    </div>
  </div>
</template>
