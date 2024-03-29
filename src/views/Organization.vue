<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { roleToString } from "@/utils";
import DeletionModal from "@/components/DeletionModal.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {
  UserAddIcon,
  TrashIcon,
  ArrowCircleUpIcon,
  ArrowCircleDownIcon,
} from "@heroicons/vue/outline";
import AddMemberModal from "@/components/AddMemberModal.vue";
import Breadcrumbs from "@/components/Breadcrumbs.vue";

const router = useRouter();
const store = useStore();
const toast = useToast();
const { t } = useI18n();

const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});

onMounted(async () => {
  await store.dispatch("nav/loadInvetory", currentOrgId.value);
});

const org = computed(() => store.getters["nav/getOrgMembership"]);
const orgName = computed(() => org?.value?.orgName || "…");

const memberships = computed(() => {
  const msObj = store.getters["jv/get"](
    "Membership",
    `$[?(@.organization_name=="${org?.value?.orgName}")]`
  );
  const msList = Object.entries(msObj);
  return msList.map(([, ms]) => ms);
});

const isLoading = computed(() => {
  return store.getters["nav/isOrgContextLoading"];
});

const isOwner = computed(() => {
  return store.getters["nav/isOwner"];
});

const showDeleteOrgModal = ref(false);

const openDeleteOrgModal = () => (showDeleteOrgModal.value = true);
const deleteOrg = async () => {
  console.log(`Deleting organization with ID ${currentOrgId.value}`);
  await store.dispatch("jv/delete", `organizations/${currentOrgId.value}`);
  store.commit("jv/deleteRecord", {
    _jv: { type: "Organization", id: currentOrgId.value },
  });
  await store.dispatch("authuser/fetchMemberships");
  router.push({ name: "org-management" });
};

const showMemberRemovalModal = ref(false);
const openMemberRemovalModal = () => (showMemberRemovalModal.value = true);
const memberToRemoveId = ref(undefined);
const removeMember = async () => {
  console.log(
    `Removing member with ID ${memberToRemoveId.value} from the organization with ID ${currentOrgId.value}`
  );
  await store.dispatch("jv/delete", `memberships/${memberToRemoveId.value}`);
  store.commit("jv/deleteRecord", {
    _jv: { type: "Membership", id: memberToRemoveId.value },
  });
};

const showAddMemberModal = ref(false);
const searchUserEmail = ref(undefined);
const addMember = async () => {
  if (typeof searchUserEmail.value === "undefined") {
    toast.error(t("org.noEmailError"));
    return;
  }
  let user = undefined;
  try {
    user = await store.dispatch("jv/get", [
      "users",
      { params: { "filter[search]": searchUserEmail.value } },
    ]);
  } catch (err) {
    console.log(err);
    toast.error(t("org.noUserWithGivenEmail") + " " + searchUserEmail.value);
    searchUserEmail.value = undefined;
    return;
  }
  searchUserEmail.value = undefined;
  const userIds = Object.keys(user);
  if (
    typeof user === "undefined" ||
    !user ||
    !userIds[0] ||
    userIds?.length > 1
  ) {
    toast.error(t("org.unexpectedUserResult"));
    console.log(`Error fetching user: ${userIds}`);
    return;
  }
  const userId = userIds[0];
  console.log(`Adding user with ID: ${userId}`);
  const newMembership = {
    _jv: {
      type: "Membership",
      role: "A",
      relationships: {
        organization: {
          data: {
            type: "Organization",
            id: currentOrgId.value,
          },
        },
        user: {
          data: {
            type: "User",
            id: userId,
          },
        },
      },
    },
  };
  try {
    await store.dispatch("jv/post", [newMembership, { url: `memberships/` }]);
    // Load full user info into the store.
    await store.dispatch("jv/get", `users/${userId}`);
    toast.success(t("org.successAddMember"));
  } catch (e) {
    toast.error(t("org.addMemberError"));
    console.log(e);
  }
};

const changeRole = async (membership) => {
  const { id: mid } = membership._jv;
  const newRole = membership.role === "O" ? "I" : "O";
  try {
    const newMembership = {
      _jv: { type: "Membership", id: mid },
      role: newRole,
    };
    await store.dispatch("jv/patch", [
      newMembership,
      { url: `memberships/${mid}/` },
    ]);
    toast.success(t("role.changeSucces"));
  } catch (e) {
    toast.error(t("role.changeError"));
    console.log(e);
  }
};
const changeRoleTooltip = (role) =>
  t(role === "O" ? "role.downgrade" : "role.upgrade");
</script>

<template>
  <div class="border-b border-gray-200 bg-white">
    <header
      class="max-w-screen-xl mx-auto px-4 pt-12 pb-4"
      v-if="$route.meta.title"
    >
      <div class="">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          {{ orgName }} - {{ $t("org.members") }}
        </h1>
      </div>
    </header>
  </div>
  <Breadcrumbs />
  <LoadingSpinner v-if="isLoading" />
  <div v-else class="max-w-screen-xl mx-auto mt-4 px-4 py-6">
    <DeletionModal
      :open="showDeleteOrgModal"
      @close-modal="showDeleteOrgModal = false"
      @delete-clicked="deleteOrg"
      modal-title="delete-org-modal.title"
    >
      <p class="text-sm text-gray-500">{{ $t("delete-org-modal.message") }}</p>
    </DeletionModal>
    <DeletionModal
      :open="showMemberRemovalModal"
      @close-modal="showMemberRemovalModal = false"
      @delete-clicked="removeMember"
      modal-title="remove-member-modal.title"
    >
      <p class="text-sm text-gray-500">
        {{ $t("remove-member-modal.message") }}
      </p>
    </DeletionModal>

    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">
          {{ $t("team.title") }}
        </h1>
        <p class="mt-2 text-sm text-gray-700">
          {{ $t("team.description") }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16">
        <div
          v-if="isOwner"
          class="indigo-button"
          @click="showAddMemberModal = true"
        >
          <UserAddIcon class="mr-2 h-4 w-4" />
          <span>{{ $t("org.addMember") }}</span>
        </div>
        <div
          v-if="isOwner"
          class="indigo-button ml-2 bg-gray-300 text-gray-900 hover:bg-gray-400"
          @click="openDeleteOrgModal"
        >
          <TrashIcon class="mr-2 h-4 w-4" />
          <span>{{ $t("org.delete") }}</span>
        </div>
      </div>
    </div>

    <div class="text-black">
      <div class="flex items-center justify-end">
        <div class="flex">
          <AddMemberModal
            :open="showAddMemberModal"
            @close-modal="showAddMemberModal = false"
            @add-clicked="addMember"
            :modal-title="t('org.addMember')"
          >
            <div class="my-1 italic">{{ $t("add-member-note") }}</div>
            <div class="form-control">
              <label class="label px-0">
                <span class="label-text font-semibold">{{
                  $t("user.email")
                }}</span>
              </label>
              <input
                type="email"
                v-model.trim="searchUserEmail"
                placeholder="name@domain.org"
                class="como-focus input-bordered rounded bg-white text-gray-600"
              />
            </div>
          </AddMemberModal>
        </div>
      </div>

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
                      {{ $t("name") }}
                    </th>
                    <th scope="col" class="py-3 text-left sm:px-6">
                      {{ $t("email") }}
                    </th>
                    <th
                      scope="col"
                      class="hidden px-2 py-3 text-left sm:px-6 md:table-cell"
                    >
                      {{ $t("role.singular") }}
                    </th>
                    <th scope="col" class="px-2 py-3 text-left">
                      {{ $t("actions") }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(membership, memberIdx) in memberships"
                    :key="membership._jv.id"
                    :class="[memberIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
                  >
                    <td class="whitespace-nowrap px-2 py-4 sm:px-6">
                      <div class="flex">
                        {{ membership.user.first_name }}
                        {{ membership.user.last_name }}
                      </div>
                      <div class="text-sm text-gray-700">
                        {{ membership.user.username }}
                      </div>
                    </td>
                    <td class="whitespace-nowrap py-4 sm:px-6">
                      {{ membership.user.email }}
                    </td>
                    <td
                      class="hidden whitespace-nowrap px-2 py-4 sm:px-6 md:table-cell"
                    >
                      {{ $t(roleToString(membership.role)) }}
                    </td>
                    <td class="whitespace-nowrap px-2 py-2">
                      <div class="flex flex-col sm:flex-row">
                        <div
                          :data-tip="changeRoleTooltip(membership.role)"
                          v-if="isOwner"
                          class="gray-button tooltip btn-sm mr-3 w-max p-3"
                          @click="() => changeRole(membership)"
                        >
                          <ArrowCircleDownIcon
                            v-if="membership?.role === 'O'"
                            class="h-6 w-6"
                          />
                          <ArrowCircleUpIcon v-else class="h-6 w-6" />
                        </div>
                        <div
                          v-if="isOwner"
                          :data-tip="$t('remove')"
                          class="gray-button tooltip btn-sm bg-red-600 p-3 hover:bg-red-700"
                          @click="
                            () => {
                              openMemberRemovalModal();
                              memberToRemoveId = membership._jv.id;
                            }
                          "
                        >
                          <TrashIcon class="h-5 w-5 text-red-100" />
                        </div>
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
  </div>
</template>
