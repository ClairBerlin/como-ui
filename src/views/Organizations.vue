<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { roleToString } from "@/utils";
import {
  ExclamationIcon,
  PlusIcon,
  PencilAltIcon,
  LogoutIcon,
} from "@heroicons/vue/outline";
import { useI18n } from "vue-i18n";
import DeletionModal from "@/components/DeletionModal.vue";
import Breadcrumbs from "@/components/Breadcrumbs.vue";

const { t } = useI18n();
const store = useStore();
const memberships = computed(() => store.state.authuser.memberships);
const hasMemberships = () => memberships.value?.length > 0;

const orgOwnerMap = computed(() => {
  return Object.assign(
    ...memberships.value.map(({ orgId, orgName }) => {
      const msObj = store.getters["jv/get"](
        "Membership",
        `$[?(@.organization_name=="${orgName}")]`
      );
      const msList = Object.entries(msObj).map(([, ms]) => ms);
      return { [orgId]: msList.filter((m) => m.role === "O") };
    })
  );
});

const hasMoreOwners = ({ orgId, role }) => {
  if (role !== "O") return false;
  if (orgOwnerMap.value[orgId].length > 1) return true;
  return false;
};

const showOwnerLeaveModal = ref(false);
const openOwnerLeaveModal = () => (showOwnerLeaveModal.value = true);
const toRemove = ref({});
const removeOwner = async () => {
  const { mId, orgId } = toRemove.value;
  console.log(
    `Removing OWNER with ID ${mId} from the organization with ID ${orgId}`
  );
  await store.dispatch("jv/delete", `memberships/${mId}`);
  store.commit("jv/deleteRecord", { _jv: { type: "Membership", id: mId } });
};
</script>

<template>
  <div class="border-b border-gray-200 bg-white">
    <header
      class="mx-auto max-w-screen-xl px-4 pt-12 pb-4"
      v-if="$route.meta.title"
    >
      <div class="">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          {{ $t("org.all") }}
        </h1>
      </div>
    </header>
  </div>
  <Breadcrumbs />

  <div class="mx-auto mt-4 max-w-screen-xl px-4 py-6">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">
          {{ $t("org.title") }}
        </h1>
        <p class="mt-2 text-sm text-gray-700">
          {{ $t("org.description") }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <router-link class="indigo-button" :to="{ name: 'org-management-add' }">
          <PlusIcon class="mr-2 h-4 w-4" />
          <span>
            {{ $t("org.create") }}
          </span>
        </router-link>
      </div>
    </div>

    <div v-if="hasMemberships" class="">
      <DeletionModal
        :open="showOwnerLeaveModal"
        @close-modal="showOwnerLeaveModal = false"
        @delete-clicked="removeOwner"
        modal-title="owner-leave-modal.title"
      >
        <p class="text-sm text-gray-500">
          {{ $t("owner-leave-modal.message") }}
        </p>
      </DeletionModal>

      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8"
          >
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-md"
            >
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50 text-sm font-medium text-gray-900">
                  <tr>
                    <th scope="col" class="px-2 py-3 text-left sm:px-6">
                      {{ $t("org.name") }}
                    </th>
                    <th
                      scope="col"
                      class="hidden py-3 text-left sm:table-cell sm:px-6"
                    >
                      {{ $t("role.your") }}
                    </th>
                    <th scope="col" class="px-2 py-3 text-left sm:px-6">
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
                          class="gray-button tooltip p-3"
                          :data-tip="t('edit')"
                          :to="{
                            name: 'org-management-edit',
                            params: { orgId: m.orgId },
                          }"
                        >
                          <div class="flex items-center">
                            <PencilAltIcon class="h-5 w-5" />
                          </div>
                        </router-link>
                        <button
                          @click="
                            () => {
                              openOwnerLeaveModal();
                              toRemove = { orgId: m.orgId, mId: m.id };
                            }
                          "
                          v-if="hasMoreOwners(m)"
                          type="button"
                          :data-tip="t('leave')"
                          class="gray-button tooltip ml-3 bg-red-600 p-3 hover:bg-red-700"
                        >
                          <div class="flex items-center">
                            <LogoutIcon class="h-5 w-5 text-red-100" />
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="mt-4 flex max-w-sm items-center rounded-sm border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow-md"
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
