<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">
        {{ $t("404.msg") }}
      </h1>
      <router-link to="/" class="btn mt-8">{{ $t("404.home") }}</router-link>
    </div>
  </header>
</template>
