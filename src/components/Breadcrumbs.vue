<script setup>
import { HomeIcon } from "@heroicons/vue/solid";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const allRoutes = router.getRoutes();

const getTitle = (routeName) => {
  const route = allRoutes.find((route) => route.name === routeName);
  return route.meta.title;
};

const breadcumbs = computed(() => route?.meta?.breadcrumbs || []);
const pages = computed(() => [
  ...breadcumbs.value.map((breadcumb) => ({
    name: getTitle(breadcumb),
    to: { name: breadcumb, params: route.params },
  })),
  { name: route.meta.title, to: { name: route.name, params: route.params } },
]);
</script>

<template>
  <nav class="flex border-b border-gray-200 bg-white" aria-label="Breadcrumb">
    <ol role="list" class="max-w-screen-xl mx-auto flex w-full space-x-4 px-4">
      <li class="flex">
        <div class="flex items-center">
          <a href="/" class="text-gray-400 hover:text-gray-500">
            <HomeIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span class="sr-only">Home</span>
          </a>
        </div>
      </li>
      <li v-for="page in pages" :key="page.name" class="flex">
        <div class="flex items-center">
          <svg
            class="h-full w-6 flex-shrink-0 text-gray-200"
            viewBox="0 0 24 44"
            preserveAspectRatio="none"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
          </svg>
          <router-link
            :to="page.to"
            class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
            :aria-current="page.current ? 'page' : undefined"
            >{{ $t(page.name) }}
          </router-link>
        </div>
      </li>
    </ol>
  </nav>
</template>
