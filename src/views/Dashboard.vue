<script setup>
import { onMounted, computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const router = useRouter();
const store = useStore();

const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});
const isOrgContext = computed(() => store.getters["nav/isOrgContext"]);

const isInventoryLoading = ref(true);

const organization = computed(() => {
  if (isOrgContext.value) {
    // Assume that the organization has already been loaded into the store by App.vue.
    return store.getters["jv/get"]({
      _jv: { type: "Organization", id: currentOrgId.value },
    });
  } else {
    return { name: "org.none" };
  }
});

onMounted(() => {
  if (route.name === "dashboard") {
    // If no organization is selected, default to the user's first organization.
    const memberships = store.getters["authuser/getMemberships"];
    if (memberships?.length > 0) {
      const defaultOrgId = memberships[0].orgId;
      router.push({ name: "overview", params: { orgId: defaultOrgId } });
    } else {
      router.push({ name: "org-management-add" });
    }
  }
});

const update = async () => {
  isInventoryLoading.value = true;
  const instObj = await store.dispatch("jv/get", [
    "installations",
    { params: { "filter[organization]": currentOrgId.value } },
  ]);
  const instList = Object.entries(instObj);
  instList.map(([, inst]) => inst);
  const relatedResourcePromises = instList.map(([instId, inst]) => {
    console.log(`Get related objects for installation ${instId}.`);
    return store
      .dispatch("jv/getRelated", `installations/${instId}`)
      .then(() => {
        // At this point vuex-jsonapi has fetched the room object in inst.room, if any
        if (typeof inst.room === "object") {
          store.dispatch("jv/getRelated", `rooms/${inst.room._jv.id}`);
        }
      });
  });
  await Promise.all(relatedResourcePromises);
  isInventoryLoading.value = false;
};

</script>

<template>
  <div>
    <header class="bg-white shadow-md sm:rounded-md" v-if="$route.meta.title">
      <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          {{ organization.name }} – {{ $t(route.meta.title) }}
        </h1>
      </div>
    </header>
    <div class="max-w-screen-xl py-6 mx-auto rounded-md">
      <router-view />
    </div>
  </div>
</template>
