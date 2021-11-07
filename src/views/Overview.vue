<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import dayjs from "dayjs";
import "dayjs/locale/de";
import { ExclamationIcon, EyeIcon, EyeOffIcon } from "@heroicons/vue/outline";
// TODO: update locale when language is changed via UI
dayjs.locale("de");

const route = useRoute();
const store = useStore();
const isLoading = ref(true);

// This view is routed to in an organization context only, this orgId is defined.
const currentOrgId = computed(() => route.params.orgId);
const installations = ref(undefined);

const activeInstallations = computed(() =>
  installations.value?.map((inst) => {
    if (
      inst.from_timestamp_s <= inst.query_timestamp_s &&
      inst.to_timestamp_s >= inst.query_timestamp_s
    ) {
      return inst;
    }
  })
);

const hasActiveSensors = computed(() => {
  if (activeInstallations?.value?.length) {
    return true;
  } else {
    return false;
  }
});

const installationTooltip = (isPublic) =>
  isPublic
    ? "This installation is public."
    : "This installation is not public.";

const update = async () => {
  isLoading.value = true;
  const instObj = await store.dispatch("jv/get", [
    "installations",
    { params: { "filter[organization]": currentOrgId.value } },
  ]);
  const instList = Object.entries(instObj);
  installations.value = instList.map(([, inst]) => inst);
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
  isLoading.value = false;
};

onMounted(async () => update());

watch(currentOrgId, () => update());
</script>

<template>
  <div class="bg-white shadow-md p-4 rounded-md max-w-xl mx-auto">
    <pre>VIEW DESCRIPTION (will be removed)</pre>
    This view will provide the latest sensor readings at a glance for all sites,
    rooms, and installations of an organization. For example, as a list with all
    installations, a traffic-light display and the latest sensor reading, plus
    links to the corresponding detail view.
  </div>
  <!-- TODO: replace with a spinner or another indication of loading data (e.g. skeleton) -->
  <div v-if="isLoading">loading...</div>
  <div v-else class="mx-2">
    <h2 class="font-bold text-xl mt-8">Active Installations</h2>
    <div class="">
      <div v-if="hasActiveSensors">
        <ul
          role="list"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <li
            v-for="inst in activeInstallations"
            :key="inst._jv.id"
            class="
              col-span-1
              bg-white
              shadow-md
              mt-4
              rounded-md
              hover:shadow-lg
            "
          >
            <div class="w-full flex flex-col">
              <div class="p-6">
                <div class="">
                  <div class="flex justify-between">
                    <div class="text-lg font-semibold text-gray-900">
                      <router-link
                        :to="{
                          name: 'sensor',
                          params: { sensorId: inst.node._jv.id },
                        }"
                        class="link"
                      >
                        {{ inst.node?.alias || inst.node?.eui64 }}
                      </router-link>
                      /
                      <router-link
                        :to="{
                          name: 'room',
                          params: { roomId: inst.room._jv.id },
                        }"
                        class="link"
                      >
                        {{ inst.room?.name }}
                      </router-link>
                    </div>
                    <div
                      :data-tip="installationTooltip(inst?.is_public)"
                      class="tooltip h-6 w-6"
                    >
                      <EyeIcon v-if="inst?.is_public" />
                      <EyeOffIcon v-else />
                    </div>
                  </div>
                  <div v-if="inst.description" class="text-gray-600">
                    Description: {{ inst.description }}
                  </div>
                  <div>
                    installed on
                    {{ dayjs.unix(inst.from_timestamp_s).format("YYYY-MM-DD") }}
                  </div>
                  <div>
                    location:
                    <router-link
                      :to="{
                        name: 'site',
                        params: { siteId: inst.room?.site?._jv?.id || 1 },
                      }"
                      class="link"
                    >
                      {{ inst.room?.site?.name }}
                    </router-link>
                  </div>
                  <div>most recent measurement: TODO</div>
                </div>
              </div>
              <router-link
                :to="{
                  name: 'installation',
                  params: { installationId: inst._jv.id },
                }"
                class="
                  bg-gradient-to-t
                  from-blue-700
                  to-blue-500
                  p-4
                  w-full
                  text-center
                  hover:ring
                  rounded-b-md
                  font-semibold
                  text-blue-100
                "
                >View CO2 concentration chart
              </router-link>
            </div>
          </li>
        </ul>
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
            <ExclamationIcon
              class="h-5 w-5 text-yellow-400"
              aria-hidden="true"
            />
          </div>
          <div class="ml-3">
            This organization has no active installations. {{ " " }}
            <!-- TODO: use :to="{ name: 'installation-add' }" -->
            <router-link
              to="#"
              class="
                font-medium
                underline
                text-yellow-700
                hover:text-yellow-600
              "
            >
              Click here to add one
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
