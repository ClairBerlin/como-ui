<script setup>
import { HomeIcon } from "@heroicons/vue/solid";

// TODO: get this from props or better yet: from the route
const pages = [
  { name: "Test-Team", href: "#", current: false },
  { name: "Standorte", href: "#", current: true },
];
</script>

<template>
  <nav class="flex border-b border-gray-200 bg-white" aria-label="Breadcrumb">
    <ol role="list" class="mx-auto flex w-full max-w-screen-xl space-x-4 px-4">
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
          <a
            :href="page.href"
            class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
            :aria-current="page.current ? 'page' : undefined"
            >{{ page.name }}</a
          >
        </div>
      </li>
    </ol>
  </nav>
</template>
