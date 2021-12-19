<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { roleToString } from "@/utils";
import { ExclamationIcon } from "@heroicons/vue/outline";

const store = useStore();
const memberships = computed(() => store.state.authuser.memberships);
const hasMemberships = () => memberships.value?.length > 0;
</script>

<template>
  <div class="text-black">
    <div class="flex justify-between items-center">
      <h2 class="font-bold text-xl">{{ $t("org.all") }}</h2>
      <router-link
        class="m-2 font-semibold gray-button"
        :to="{ name: 'org-management-add' }"
      >
        {{ $t("org.create") }}
      </router-link>
    </div>
    <div
      v-if="hasMemberships"
      class="ring-1 ring-gray-300 rounded-md bg-white text-md overflow-hidden"
    >
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
            >
              {{ $t("org.name") }}
            </th>
            <th
              scope="col"
              class="sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider hidden sm:table-cell"
            >
              {{ $t("role.your") }}
            </th>
            <th
              scope="col"
              class="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
            >
              {{ $t("options") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(m, mIdx) in memberships"
            :key="m.orgId"
            :class="[mIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
          >
            <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
              <router-link
                class="como-link"
                :to="{
                  name: 'org-management-detail',
                  params: { orgId: m.orgId },
                }"
                >{{ m.orgName }}
              </router-link>
            </td>
            <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
              {{ $t(roleToString(m.role)) }}
            </td>
            <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
              <div class="flex flex-row">
                <router-link
                  v-if="m.role === 'O'"
                  class="gray-button"
                  :to="{
                    name: 'org-management-edit',
                    params: { orgId: m.orgId },
                  }"
                  >{{ $t("edit") }}</router-link
                >
                <button
                  @click="console.log('todo: leave org')"
                  type="button"
                  class="gray-button ml-2"
                >
                  {{ $t("leave") }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-else
      class="shadow-md mt-4 rounded-md max-w-sm flex items-center bg-yellow-50 border-l-4 border-yellow-400 p-4"
    >
      <div class="flex-shrink-0">
        <ExclamationIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
      </div>
      <div class="ml-3">
        You are not a member of any organization yet.
        <router-link
          :to="{ name: 'org-management-add' }"
          class="font-medium underline text-yellow-700 hover:text-yellow-600"
        >
          Click here to create one
        </router-link>
      </div>
    </div>
  </div>
</template>
