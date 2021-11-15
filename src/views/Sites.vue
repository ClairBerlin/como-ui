<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { ExclamationIcon } from "@heroicons/vue/outline";

// TODO: Add number of rooms to each site's table row.
// TODO: Add "remove site" button, visible for owners only.
const route = useRoute();
const store = useStore();

// This view is routed to in an organization context only, this orgId is defined.
const currentOrgId = computed(() => route.params.orgId);
const sites = ref(undefined);

const formatAdress = (address) => {
  return `${address.street1}, ${address.zip} ${address.city}`;
};

const hasSites = computed(() => sites.value?.length > 0);
const isLoading = ref(true);

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
  <div class="bg-white shadow-md p-4 rounded-md max-w-xl mx-auto">
    <pre>VIEW DESCRIPTION (will be removed)</pre>
    This view will list all the sites of the selected organization, together
    with their adresses, and provide links to the rooms in each site. It will
    offer the possibility to add a new site and to remove an existing site with
    all its rooms and installations.
  </div>
  <div v-if="isLoading">{{ $t("loading...") }}</div>
  <div
    v-else-if="hasSites"
    class="
      ring-1 ring-gray-300
      rounded-md
      bg-white
      text-md
      overflow-hidden
      mt-8
    "
  >
    <table class="min-w-full divide-y divide-gray-200">
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
            Site Name
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
            Address
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
            Action
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
            <div class="flex flex-row">
              <router-link
                class="gray-button"
                :to="{
                  name: 'site',
                  params: { siteId: site._jv.id },
                }"
                >{{ $t("inspect") }}</router-link
              >
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
        This organization has no sites. {{ " " }}
        <!-- TODO: use :to="{ name: 'sites-add' }" -->
        <router-link
          to="#"
          class="font-medium underline text-yellow-700 hover:text-yellow-600"
        >
          Click here to add one.
        </router-link>
      </div>
    </div>
  </div>
</template>
