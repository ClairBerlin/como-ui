<script setup>
import Logo from "@/components/Logo.vue";
import { onMounted, ref } from "vue";
import { useStore } from "vuex";
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
  AdjustmentsIcon,
  ChipIcon,
  MenuIcon,
  XIcon,
  OfficeBuildingIcon,
} from "@heroicons/vue/outline";
import OrganizationMenu from "./components/OrganizationMenu.vue";
import ProfileMenu from "./components/ProfileMenu.vue";

// TODO: what about feedback and help? (before this pointed to a Clair email/domain)
const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: ChartBarIcon,
  },
  { name: "Organizations", href: "/orgs", icon: OfficeBuildingIcon },
  { name: "Sites", href: "/sites", icon: LocationMarkerIcon },
  { name: "Rooms", href: "/rooms", icon: CubeIcon },
  {
    name: "Installations",
    href: "/installations",
    icon: AdjustmentsIcon,
  },
  { name: "Sensors", href: "/sensors", icon: ChipIcon },
];

const isCurrent = (href) => window.location.href.endsWith(href);
const sidebarOpen = ref(false);
const store = useStore();
onMounted(async () => await store.dispatch("authuser/fetchAuthenticatedUser"));
</script>

<template>
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog
        as="div"
        class="fixed inset-0 flex z-40 md:hidden"
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
                  class="
                    ml-1
                    flex
                    items-center
                    justify-center
                    h-10
                    w-10
                    rounded-full
                    como-focus
                  "
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
                <div class="w-full px-3 my-1 border-b border-gray-200" />
                <router-link
                  v-for="item in navigation"
                  :key="item.name"
                  :to="item.href"
                  :class="[
                    isCurrent(item.href)
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-base font-medium rounded-md como-focus',
                  ]"
                >
                  <component
                    :is="item.icon"
                    :class="[
                      isCurrent(item.href)
                        ? 'text-gray-700'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-4 flex-shrink-0 h-6 w-6',
                    ]"
                    aria-hidden="true"
                  />
                  {{ item.name }}
                </router-link>
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
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64">
        <!-- Sidebar component, swap this element with another sidebar if you like -->
        <div
          class="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white"
        >
          <div class="flex-1 flex flex-col pt-6 pb-4">
            <Logo />
            <div class="w-full px-3 border-b border-gray-200" />
            <nav class="mt-1 flex-1 px-2 bg-white space-y-1">
              <OrganizationMenu />
              <div class="w-full px-3 my-1 border-b border-gray-200" />
              <a
                v-for="item in navigation"
                :key="item.name"
                :href="item.href"
                :class="[
                  isCurrent(item.href)
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md como-focus',
                ]"
              >
                <component
                  :is="item.icon"
                  :class="[
                    isCurrent(item.href)
                      ? 'text-gray-700'
                      : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 flex-shrink-0 h-6 w-6',
                  ]"
                  aria-hidden="true"
                />
                {{ item.name }}
              </a>
              <div class="w-full px-3 my-1 border-b border-gray-200" />
              <ProfileMenu />
            </nav>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <div class="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
        <button
          type="button"
          class="
            -ml-0.5
            -mt-0.5
            h-12
            w-12
            inline-flex
            items-center
            justify-center
            rounded-md
            text-gray-500
            hover:text-gray-900
            como-focus
          "
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <MenuIcon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <header class="bg-white shadow" v-if="$route.meta.title">
          <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold leading-tight text-gray-900">
              {{ $route.meta.title }}
            </h1>
          </div>
        </header>

        <div class="max-w-screen-xl py-6 mx-auto sm:px-6 lg:px-8">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>
