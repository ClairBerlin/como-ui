<script setup>
import Logo from "@/components/Logo.vue";
import { onMounted, ref, watch, computed } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import {
  Dialog,
  DialogOverlay,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import {
  LocationMarkerIcon,
  CubeIcon,
  ChartBarIcon,
  ChipIcon,
  MenuIcon,
  XIcon,
  UserGroupIcon,
} from "@heroicons/vue/outline";
import OrganizationMenu from "@/components/OrganizationMenu.vue";
import ProfileMenu from "@/components/ProfileMenu.vue";
import LanguageSelect from "@/components/LanguageSelect.vue";
import Cookies from "js-cookie";

const store = useStore();
const route = useRoute();
const router = useRouter();

// TODO: what about feedback and help? (before, this pointed to a Clair email/domain)?

//Navigation within the context of the selected organization.
const orgNavigation = [
  {
    name: "overview",
    routeName: "overview",
    icon: ChartBarIcon,
  },
  {
    name: "team",
    routeName: "org-management-detail",
    icon: UserGroupIcon,
  },
  {
    name: "sites",
    routeName: "sites",
    icon: LocationMarkerIcon,
  },
  {
    name: "rooms",
    routeName: "rooms",
    icon: CubeIcon,
  },
  {
    name: "nodes",
    routeName: "sensors",
    icon: ChipIcon,
  },
];

const isCurrentRoute = (routeName) => route.name === routeName;

const sidebarOpen = ref(false);

const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});
const isOrgContext = computed(() => store.getters["nav/isOrgContext"]);
const isUserLoading = computed(() => store.getters["authuser/isLoading"]);
const isOrgLoading = computed(() => {
  return store.state.nav.isOrgLoading;
});

const loadOrganization = async (orgId) => {
  store.dispatch("nav/changeOrganization", orgId);
};

const isLoading = computed(() => {
  return isUserLoading.value || isOrgLoading.value;
});

onMounted(async () => {
  console.log("Starting application...");
  store.dispatch("nav/loadSensorTypes");
  await store.dispatch("authuser/fetchAuthenticatedUser");
  const memberships = store.getters["authuser/getMemberships"];
  if (memberships?.length > 0) {
    if (route.name === "dashboard") {
      // If no organization is selected or stored in the cookie, default to the user's first organization.
      const lastVistedOrg = parseInt(Cookies.get("lastVistedOrg"));
      const lastVistedOrgId = !Number.isNaN(lastVistedOrg)
        ? lastVistedOrg.toString()
        : undefined;
      const defaultOrgId = lastVistedOrgId || memberships[0].orgId;
      await loadOrganization(defaultOrgId);
      router.push({ name: "overview", params: { orgId: defaultOrgId } });
    }
  } else {
    store.dispatch("nav/clearOrganization");
    router.push({ name: "org-management-add" });
  }
});

watch(
  () => route.params.orgId,
  async (orgId) => {
    await loadOrganization(orgId);
  }
);
</script>

<template>
  <a href="#content" class="sr-only focus:not-sr-only">{{ $t("skip") }} </a>
  <div class="flex h-screen overflow-hidden bg-gray-100">
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog
        as="div"
        class="fixed inset-0 z-40 flex lg:hidden"
        @close="sidebarOpen = false"
      >
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </TransitionChild>
        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="-translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="-translate-x-full"
        >
          <div class="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <TransitionChild
              as="template"
              enter="ease-in-out duration-300"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="ease-in-out duration-300"
              leave-from="opacity-100"
              leave-to="opacity-0"
            >
              <div class="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  class="como-focus ml-1 flex h-10 w-10 items-center justify-center rounded-full"
                  @click="sidebarOpen = false"
                >
                  <span class="sr-only">Close sidebar</span>
                  <XIcon class="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <div class="h-0 flex-1 overflow-y-auto pt-5 pb-4">
              <Logo />
              <div class="w-full border-b border-gray-200 px-3" />
              <nav class="mt-1 flex-1 space-y-1 px-2">
                <OrganizationMenu />
                <LanguageSelect class="py-1" />
                <div class="my-1 w-full border-b border-gray-200 px-3" />
                <div v-if="isOrgContext">
                  <router-link
                    v-for="item in orgNavigation"
                    :key="item.name"
                    :to="{
                      name: item.routeName,
                      params: { orgId: currentOrgId },
                    }"
                    @click="sidebarOpen = false"
                    :class="[
                      isCurrentRoute(item.routeName)
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                      'como-focus group flex items-center rounded-md px-2 py-2 text-base font-medium',
                    ]"
                  >
                    <component
                      :is="item.icon"
                      :class="[
                        isCurrentRoute(item.routeName)
                          ? 'text-indigo-900'
                          : 'text-gray-500 group-hover:text-gray-600',
                        'mr-4 h-6 w-6 flex-shrink-0',
                      ]"
                      aria-hidden="true"
                    />
                    {{ $t(item.name) }}
                  </router-link>
                </div>
                <div class="my-1 w-full border-b border-gray-200 px-3" />
                <ProfileMenu />
              </nav>
            </div>
          </div>
        </TransitionChild>
        <div class="w-14 flex-shrink-0">
          <!-- Force sidebar to shrink to fit close icon -->
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Static sidebar for desktop -->
    <div class="hidden lg:flex lg:flex-shrink-0">
      <div class="flex w-64 flex-col">
        <div
          class="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white"
        >
          <div class="mx-2 flex flex-1 flex-col overflow-y-auto px-1 pt-6 pb-1">
            <Logo />
            <div class="w-full border-b border-gray-200 px-3" />
            <nav class="mt-1 flex-1 space-y-1 bg-white">
              <OrganizationMenu />
              <LanguageSelect class="py-1" />
              <div class="my-1 w-full border-b border-gray-200 px-3" />
              <div v-if="isOrgContext">
                <router-link
                  v-for="item in orgNavigation"
                  :key="item.name"
                  :to="{
                    name: item.routeName,
                    params: { orgId: currentOrgId },
                  }"
                  :class="[
                    isCurrentRoute(item.routeName)
                      ? 'bg-indigo-50 font-bold text-indigo-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    'como-focus group my-1 flex items-center rounded-md px-2 py-4 text-sm font-medium',
                  ]"
                >
                  <component
                    :is="item.icon"
                    :class="[
                      isCurrentRoute(item.routeName)
                        ? 'text-indigo-900'
                        : 'text-gray-500 group-hover:text-gray-600',
                      'mr-3 h-6 w-6 flex-shrink-0',
                    ]"
                    aria-hidden="true"
                  />
                  {{ $t(item.name) }}
                </router-link>
              </div>
            </nav>
            <div class="my-1 w-full border-b border-gray-200 px-3" />
            <ProfileMenu class="mb-1 w-full" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex w-0 flex-1 flex-col overflow-hidden">
      <div class="pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
        <button
          type="button"
          class="como-focus -ml-0.5 -mt-0.5 mb-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <MenuIcon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <main
        id="content"
        class="relative z-0 flex-1 overflow-y-auto bg-white focus:outline-none"
      >
        <div class="h-full w-full bg-gray-100" v-if="!isLoading">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>
