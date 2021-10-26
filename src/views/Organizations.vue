<script setup>
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { roleToString } from "@/utils";

const store = useStore();
const memberships = computed(() => store.state.authuser.memberships);
const hasMemberships = () => memberships.value?.length > 0;
</script>

<template>
  <div class="text-black">
    <div class="flex justify-between items-center">
      <div class="">All your organizations</div>
      <router-link
        class="btn btn-sm m-2 font-semibold gray-button"
        :to="{ path: '/orgs/add' }"
      >
        Create a new organization
      </router-link>
    </div>
    <div v-if="hasMemberships" class="ring-1 ring-gray-300 rounded-md bg-white">
      <div
        class="flex flex-col border-b last:border-b-0"
        v-for="m in memberships"
        :key="m.orgId"
      >
        <div class="flex p-4 items-center justify-between">
          <div class="flex items-center">
            <router-link
              class="text-l font-bold text-blue-500 rounded p-1 como-focus"
              :to="{
                name: 'org-management-detail',
                params: { orgId: m.orgId },
              }"
              >{{ m.orgName }}
            </router-link>
            <div class="gray-label">
              {{ roleToString(m.role) }}
            </div>
          </div>
          <div class="flex flex-row">
            <router-link
              class="gray-button"
              :to="{ name: 'org-management-edit', params: { orgId: m.orgId } }"
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
    <div class="text-gray-600" v-else>
      you are not a member of any organization yet
    </div>
  </div>
</template>
