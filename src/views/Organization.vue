<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { roleToString } from "@/utils";
import DeletionModal from "@/components/DeletionModal.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { UserAddIcon, TrashIcon } from "@heroicons/vue/outline";
import AddMemberModal from "@/components/AddMemberModal.vue";

const router = useRouter();
const store = useStore();
const toast = useToast();
const { t } = useI18n();

const currentOrgId = computed(() => {
  return store.state.nav.currentOrgId;
});

const org = computed(() => store.getters["nav/getOrgMembership"]);
const orgName = computed(() => org?.value.orgName || "…");

const memberships = computed(() => {
  const msObj = store.getters["jv/get"](
    "Membership",
    `$[?(@.organization_name=="${org?.value.orgName}")]`
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

const changeRole = () => console.log("TODO: open modal to change role");
</script>

<template>
  <header class="bg-white shadow-md sm:rounded-md" v-if="$route.meta.title">
    <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">
        {{ $t("org.members") }} {{ $t("of") }} {{ orgName }}
      </h1>
    </div>
  </header>
  <LoadingSpinner v-if="isLoading" />
  <div v-else class="mt-8">
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
    <div class="text-black">
      <div class="flex justify-end items-center">
        <div class="flex">
          <div
            v-if="isOwner"
            class="m-2 gray-button font-semibold"
            @click="openDeleteOrgModal"
          >
            <TrashIcon class="w-4 h-4 mr-2" />
            <span>{{ $t("org.delete") }}</span>
          </div>
          <div
            v-if="isOwner"
            class="m-2 mr-0 gray-button font-semibold"
            @click="showAddMemberModal = true"
          >
            <UserAddIcon class="w-4 h-4 mr-2" />
            <span>{{ $t("org.addMember") }}</span>
          </div>
          <AddMemberModal
            :open="showAddMemberModal"
            @close-modal="showAddMemberModal = false"
            @add-clicked="addMember"
            :modal-title="t('org.addMember')"
          >
            <div class="form-control">
              <label class="label">
                <span class="label-text text-black font-bold">{{
                  $t("user.email")
                }}</span>
              </label>
              <input
                type="email"
                v-model.trim="searchUserEmail"
                placeholder="name@domain.org"
                class="input-bordered como-focus rounded bg-white text-gray-600"
              />
            </div>
          </AddMemberModal>
        </div>
      </div>
      <div
        class="ring-1 ring-gray-300 rounded-md bg-white text-md overflow-hidden"
      >
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
                {{ $t("name") }}
              </th>
              <th
                scope="col"
                class="sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
                {{ $t("email") }}
              </th>
              <th
                scope="col"
                class="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider hidden md:table-cell"
              >
                {{ $t("role.singular") }}
              </th>
              <th
                scope="col"
                class="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
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
              <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex">
                  {{ membership.user.first_name }}
                  {{ membership.user.last_name }}
                </div>
                <div class="text-gray-700 text-sm">
                  {{ membership.user.username }}
                </div>
              </td>
              <td class="sm:px-6 py-4 whitespace-nowrap">
                {{ membership.user.email }}
              </td>
              <td
                class="hidden md:table-cell px-2 sm:px-6 py-4 whitespace-nowrap"
              >
                {{ $t(roleToString(membership.role)) }}
              </td>
              <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
                <!-- <Dropdown :options="options" :icon="icon" /> -->
                <div class="flex flex-col sm:flex-row">
                  <div
                    v-if="isOwner"
                    class="btn-sm m-2 gray-button font-semibold w-max"
                    @click="changeRole"
                  >
                    {{ $t("role.change") }}
                  </div>
                  <div
                    v-if="isOwner"
                    class="btn-sm m-2 mr-0 gray-button font-semibold"
                    @click="
                      () => {
                        openMemberRemovalModal();
                        memberToRemoveId = membership._jv.id;
                      }
                    "
                  >
                    <TrashIcon class="w-4 h-4 mr-2" />
                    <span>{{ $t("remove") }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
