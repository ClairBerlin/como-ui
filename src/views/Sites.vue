<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

// This view is routed to in an organization context only, this orgId is defined.
const currentOrgId = computed(() => route.params.orgId);
const sites = ref(undefined);

const formatAdress = (address) => {
  return `${address.street1}, ${address.zip} ${address.city}`;
};

const hasSites = computed(() => sites.value?.length > 0);

async function update() {
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
}

onMounted(async () => update());
watch(currentOrgId, () => update());
</script>

<template>
  <div class="bg-gray-50">
    <div
      class="
        max-w-screen-xl
        px-4
        py-12
        mx-auto
        sm:px-6
        lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between
      "
    >
      <h2
        class="
          text-3xl
          font-extrabold
          leading-9
          tracking-tight
          text-gray-900
          sm:text-4xl sm:leading-10
        "
      >
        Sites
      </h2>
    </div>
    <div>
      This view will list all the sites of the selected organization, together
      with their adresses, and provide links to the rooms in each site. It will
      offer the possibility to add a new site and to remove an existing site
      with all its rooms and installations.
    </div>
    <div v-if="hasSites">
      Sites:
      <ul id="site-list">
        <li v-for="site in sites" :key="site._jv.id">
          ID: {{ site._jv.id }}, Name: {{ site.name }}, Address:
          {{ formatAdress(site.address) }}
          <router-link
            :to="{
              name: 'site',
              params: { siteId: site._jv.id },
            }"
            >Inspect and modify site</router-link
          >
        </li>
      </ul>
    </div>
  </div>
</template>
