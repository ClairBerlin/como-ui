<script setup>
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { roleToString } from "@/utils";

const store = useStore();
const memberships = computed(() => store.state.authuser.memberships);
</script>

<template>
  <div class="ring-1 ring-gray-300 rounded-md bg-white">
    <div
      class="flex flex-col border-b last:border-b-0"
      v-for="m in memberships"
      :key="m.orgId"
    >
      <div class="flex p-4 items-center justify-between">
        <div class="flex items-center">
          <router-link
            class="text-l font-bold text-blue-500 rounded p-1 como-focus"
            :to="{ name: 'org', params: { id: m.orgId } }"
            >{{ m.orgName }}
          </router-link>
          <div class="gray-label">
            {{ roleToString(m.role) }}
          </div>
        </div>
        <div class="flex flex-row">
          <router-link
            class="gray-button"
            :to="{ name: 'editOrg', params: { id: m.orgId } }"
            >Settings</router-link
          >
          <button
            @click="console.log('todo: leave org')"
            type="button"
            class="gray-button ml-2"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
