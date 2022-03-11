<script setup>
import { useStore } from 'vuex';
import Cookies from 'js-cookie';

const store = useStore();

await store.dispatch('authuser/logout');
Cookies.remove('csrftoken');
window.location.href = window.location.origin + '/accounts/login/';
</script>

<template>
  <div>
    <h1>{{ $t('logging-out') }}</h1>
  </div>
</template>
