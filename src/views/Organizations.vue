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
  <div class="text-black">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">{{ $t("org.all") }}</h2>
      <router-link
        class="gray-button m-2 font-semibold"
        :to="{ name: 'org-management-add' }"
      >
        <div class="flex items-center">
          <PlusIcon class="mr-2 h-5 w-5" />
          <span>
            {{ $t("org.create") }}
          </span>
        </div>
      </router-link>
    </div>
    <div
      v-if="hasMemberships"
      class="text-md overflow-hidden rounded-sm bg-white ring-1 ring-gray-300"
    >
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
