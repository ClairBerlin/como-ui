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
  await store.dispatch("authuser/fetchAuthenticatedUser");
  const memberships = store.getters["authuser/getMemberships"];
  if (route.name === "dashboard") {
    if (memberships?.length > 0) {
      // If no organization is selected or stored in the cookie, default to the user's first organization.
      const lastVistedOrg = parseInt(Cookies.get("lastVistedOrg"));
      const lastVistedOrgId = !Number.isNaN(lastVistedOrg)
        ? lastVistedOrg.toString()
        : undefined;
      const defaultOrgId = lastVistedOrgId || memberships[0].orgId;
      await loadOrganization(defaultOrgId);
      router.push({ name: "overview", params: { orgId: defaultOrgId } });
    } else {
      router.push({ name: "org-management-add" });
    }
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
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog
        as="div"
        class="fixed inset-0 flex z-40 lg:hidden"
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
          <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
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
                  class="ml-1 flex items-center justify-center h-10 w-10 rounded-full como-focus"
                  @click="sidebarOpen = false"
                >
                  <span class="sr-only">Close sidebar</span>
                  <XIcon class="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <Logo />
              <div class="w-full px-3 border-b border-gray-200" />
              <nav class="mt-1 flex-1 px-2 space-y-1">
                <OrganizationMenu />
                <LanguageSelect class="py-1" />
                <div class="w-full px-3 my-1 border-b border-gray-200" />
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
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-base font-medium rounded-md como-focus',
                    ]"
                  >
                    <component
                      :is="item.icon"
                      :class="[
                        isCurrentRoute(item.routeName)
                          ? 'text-indigo-900'
                          : 'text-gray-500 group-hover:text-gray-600',
                        'mr-4 flex-shrink-0 h-6 w-6',
                      ]"
                      aria-hidden="true"
                    />
                    {{ $t(item.name) }}
                  </router-link>
                </div>
                <div class="w-full px-3 my-1 border-b border-gray-200" />
                <ProfileMenu />
              </nav>
            </div>
          </div>
        </TransitionChild>
        <div class="flex-shrink-0 w-14">
          <!-- Force sidebar to shrink to fit close icon -->
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Static sidebar for desktop -->
    <div class="hidden lg:flex lg:flex-shrink-0">
      <div class="flex flex-col w-64">
        <div
          class="flex-1 flex flex-col min-h-0 border-r border-gray-200 shadow-md bg-white"
        >
          <div class="flex-1 flex mx-2 px-1 flex-col pt-6 pb-1 overflow-y-auto">
            <Logo />
            <div class="w-full px-3 border-b border-gray-200" />
            <nav class="mt-1 flex-1 bg-white space-y-1">
              <OrganizationMenu />
              <LanguageSelect class="py-1" />
              <div class="w-full px-3 my-1 border-b border-gray-200" />
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
                      ? 'bg-indigo-50 text-indigo-900 font-bold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    'group flex items-center my-1 px-2 py-4 text-sm font-medium rounded-md como-focus',
                  ]"
                >
                  <component
                    :is="item.icon"
                    :class="[
                      isCurrentRoute(item.routeName)
                        ? 'text-indigo-900'
                        : 'text-gray-500 group-hover:text-gray-600',
                      'mr-3 flex-shrink-0 h-6 w-6',
                    ]"
                    aria-hidden="true"
                  />
                  {{ $t(item.name) }}
                </router-link>
              </div>
            </nav>
            <div class="w-full px-3 my-1 border-b border-gray-200" />
            <ProfileMenu class="w-full" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <div class="lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
        <button
          type="button"
          class="-ml-0.5 -mt-0.5 mb-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 como-focus"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <MenuIcon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div
          class="max-w-screen-xl sm:py-6 mx-auto sm:px-6 rounded-md"
          v-if="!isLoading"
        >
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>
