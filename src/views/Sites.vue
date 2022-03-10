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
  <div v-else-if="hasSites" class="text-md mt-4">
    <DeletionModal
      :open="showDeleteSiteModal"
      @close-modal="showDeleteSiteModal = false"
      @delete-clicked="deleteSite"
      modal-title="delete-site-modal.title"
    >
      <p class="text-sm text-gray-500">{{ $t("delete-site-modal.message") }}</p>
    </DeletionModal>

    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">
          <!-- TODO: translate text -->
          Alle Standorte des Teams
        </h1>
        <p class="mt-2 text-sm text-gray-700">
          Die Liste aller Standorte des Test-Teams mit Namen und Adresse.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <router-link
          v-if="isOwner"
          class="indigo-button"
          :to="{
            name: 'addSite',
          }"
        >
          <PlusIcon class="mr-2 h-4 w-4" />
          <span>{{ $t("site.add") }}</span>
        </router-link>
      </div>
    </div>

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div
            class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
          >
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50 text-sm font-medium text-gray-900">
                <tr>
                  <th scope="col" class="px-2 py-3 text-left sm:px-6">
                    {{ $t("site.name") }}
                  </th>
                  <th
                    scope="col"
                    class="hidden py-3 text-left sm:table-cell sm:px-6"
                  >
                    {{ $t("address.singular") }}
                  </th>
                  <th scope="col" class="py-3 text-left sm:px-6">
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
                  <td class="whitespace-nowrap px-2 py-4 sm:px-6">
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
                  <td
                    class="hidden whitespace-nowrap px-2 py-4 sm:table-cell sm:px-6"
                  >
                    {{ formatAdress(site.address) }}
                  </td>
                  <td class="whitespace-nowrap px-2 py-4 sm:px-6">
                    <div class="flex flex-col sm:flex-row">
                      <div class="flex flex-row"></div>
                      <div
                        v-if="isOwner"
                        class="gray-button btn-sm w-max font-semibold"
                        @click="
                          () => {
                            openDeleteSiteModal();
                            deleteSiteId = site._jv.id;
                          }
                        "
                      >
                        <TrashIcon class="mr-2 h-4 w-4" />
                        <span>{{ $t("remove") }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="mt-4 flex max-w-sm items-center rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow-md"
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
          class="font-medium text-yellow-700 underline hover:text-yellow-600"
        >
          {{ $t("org.addSite") }}.
        </router-link>
      </div>
    </div>
  </div>
</template>
