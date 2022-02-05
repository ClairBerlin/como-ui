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
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">{{ $t("org.all") }}</h2>
      <router-link
        class="gray-button m-2 font-semibold"
        :to="{ name: 'org-management-add' }"
      >
        {{ $t("org.create") }}
      </router-link>
    </div>
    <div
      v-if="hasMemberships"
      class="text-md overflow-hidden rounded-md bg-white ring-1 ring-gray-300"
    >
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6"
            >
              {{ $t("org.name") }}
            </th>
            <th
              scope="col"
              class="hidden py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:table-cell sm:px-6"
            >
              {{ $t("role.your") }}
            </th>
            <th
              scope="col"
              class="px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 sm:px-6"
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
            <td class="whitespace-nowrap px-2 py-4 sm:px-6">
              <router-link
                class="como-link"
                :to="{
                  name: 'org-management-detail',
                  params: { orgId: m.orgId },
                }"
                >{{ m.orgName }}
              </router-link>
            </td>
            <td class="whitespace-nowrap px-2 py-4 sm:px-6">
              {{ $t(roleToString(m.role)) }}
            </td>
            <td class="whitespace-nowrap px-2 py-4 sm:px-6">
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
      class="mt-4 flex max-w-sm items-center rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow-md"
    >
      <div class="flex-shrink-0">
        <ExclamationIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
      </div>
      <div class="ml-3">
        You are not a member of any organization yet.
        <router-link
          :to="{ name: 'org-management-add' }"
          class="font-medium text-yellow-700 underline hover:text-yellow-600"
        >
          Click here to create one
        </router-link>
      </div>
    </div>
  </div>
</template>
