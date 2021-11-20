<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { ExclamationIcon } from "@heroicons/vue/outline";
import DeletionModal from "@/components/DeletionModal.vue";

// TODO: Add number of rooms to each site's table row.
// TODO: Add "remove site" button, visible for owners only.
const route = useRoute();
const store = useStore();

// This view is routed to in an organization context only, this orgId is defined.
const currentOrgId = computed(() => route.params.orgId);
const sites = ref(undefined);

const showDeleteSiteModal = ref(false);
const deleteSiteId = ref();
const openDeleteSiteModal = () => (showDeleteSiteModal.value = true);

const formatAdress = (address) => {
  return `${address.street1}, ${address.zip} ${address.city}`;
};

const orgMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.orgId)
);
const isOwner = computed(() => orgMembership.value?.role === "O");

const hasSites = computed(() => sites.value?.length > 0);
const isLoading = ref(true);

const deleteSite = async () => {
  await store.dispatch("jv/delete", `sites/${deleteSiteId.value}`);
  updateView();
};

async function updateView() {
  isLoading.value = true;
  const siteObj = await store.dispatch("jv/get", [
    "sites",
    { params: { "filter[organization]": currentOrgId.value } },
  ]);
  const siteList = Object.entries(siteObj);
  console.log(`Organization has ${siteList.length} site(s).`);
  sites.value = siteList.map(([_, site]) => site);
  const relatedResourcePromises = siteList.map(([siteId, _]) => {
    console.log(`Fetch related objects for site ${siteId}.`);
    return store.dispatch("jv/getRelated", `sites/${siteId}`);
  });
  await Promise.all(relatedResourcePromises);
  isLoading.value = false;
}

onMounted(async () => updateView());
watch(currentOrgId, () => updateView());
</script>

<template>
  <div v-if="isLoading">{{ $t("loading...") }}</div>
  <div v-else-if="hasSites" class="text-md mt-8">
    <DeletionModal
      :open="showDeleteSiteModal"
      @close-modal="showDeleteSiteModal = false"
      @delete-clicked="deleteSite"
      modal-title="delete-site-modal.title"
    >
      <p class="text-sm text-gray-500">{{ $t("delete-site-modal.message") }}</p>
    </DeletionModal>
    <div class="flex justify-end items-center">
      <div class="flex flex-row">
        <router-link
          v-if="isOwner"
          class="m-2 mr-0 gray-button font-semibold"
          :to="{
            name: 'addSite',
          }"
          >{{ $t("site.add") }}</router-link
        >
      </div>
    </div>

    <table
      class="
        overflow-hidden
        rounded-md
        ring-1 ring-gray-300
        bg-white
        min-w-full
        divide-y divide-gray-200
      "
    >
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="
              px-2
              sm:px-6
              py-3
              text-left text-xs
              font-medium
              text-gray-500
              tracking-wider
            "
          >
            {{ $t("site.name") }}
          </th>
          <th
            scope="col"
            class="
              sm:px-6
              py-3
              text-left text-xs
              font-medium
              text-gray-500
              tracking-wider
              hidden
              sm:table-cell
            "
          >
            {{ $t("address.singular") }}
          </th>
          <th
            scope="col"
            class="
              sm:px-6
              py-3
              text-left text-xs
              font-medium
              text-gray-500
              tracking-wider
            "
          >
            {{ $t("action") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(site, siteIdx) in sites"
          :key="site._jv.id"
          :class="[siteIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
        >
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            {{ site.name }}
          </td>
          <td class="hidden sm:table-cell px-2 sm:px-6 py-4 whitespace-nowrap">
            {{ formatAdress(site.address) }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col sm:flex-row">
              <div class="flex flex-row">
                <router-link
                  class="btn-sm my-2 gray-button font-semibold w-max"
                  :to="{
                    name: 'site',
                    params: { siteId: site._jv.id },
                  }"
                  >{{ $t("inspect") }}</router-link
                >
              </div>
              <div
                v-if="isOwner"
                class="btn-sm m-2 mr-0 gray-button font-semibold w-max"
                @click="
                  () => {
                    openDeleteSiteModal();
                    deleteSiteId = site._jv.id;
                  }
                "
              >
                {{ $t("remove") }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div
    v-else
    class="
      shadow-md
      mt-4
      rounded-md
      max-w-sm
      flex
      items-center
      bg-yellow-50
      border-l-4 border-yellow-400
      p-4
    "
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <ExclamationIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
      </div>
      <div class="ml-3">
        {{ $t("org.noSite") }}.
        <router-link
          :to="{
            name: 'addSite',
          }"
          class="font-medium underline text-yellow-700 hover:text-yellow-600"
        >
          {{ $t("org.addSite") }}.
        </router-link>
      </div>
    </div>
  </div>
</template>
