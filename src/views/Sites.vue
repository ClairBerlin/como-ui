<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { ExclamationIcon, PlusIcon, TrashIcon } from "@heroicons/vue/outline";
import DeletionModal from "@/components/DeletionModal.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

// TODO: Add number of rooms to each site's table row.
const store = useStore();

const isLoading = computed(() => {
  return store.getters["nav/isOrgContextLoading"];
});

const isOwner = computed(() => {
  return store.getters["nav/isOwner"];
});

const sites = computed(() => {
  return store.getters["nav/getSites"];
});
const hasSites = computed(() => sites.value?.length > 0);

const showDeleteSiteModal = ref(false);
const deleteSiteId = ref();
const openDeleteSiteModal = () => (showDeleteSiteModal.value = true);

const deleteSite = async () => {
  console.log(`Deleting site with ID ${deleteSiteId.value}`);
  await store.dispatch("jv/delete", `sites/${deleteSiteId.value}`);
  store.commit("jv/deleteRecord", {
    _jv: { type: "Site", id: deleteSiteId.value },
  });
};

const formatAdress = (address) => {
  return `${address.street1}, ${address.zip} ${address.city}`;
};
</script>

<template>
  <LoadingSpinner v-if="isLoading" />
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
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          <span>{{ $t("site.add") }}</span>
        </router-link>
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
            <router-link
              class="como-link"
              :to="{
                name: 'site',
                params: { siteId: site._jv.id },
              }"
            >
              {{ site.name }}
            </router-link>
          </td>
          <td class="hidden sm:table-cell px-2 sm:px-6 py-4 whitespace-nowrap">
            {{ formatAdress(site.address) }}
          </td>
          <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col sm:flex-row">
              <div class="flex flex-row"></div>
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
                <TrashIcon class="w-4 h-4 mr-2" />
                <span>{{ $t("remove") }}</span>
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
