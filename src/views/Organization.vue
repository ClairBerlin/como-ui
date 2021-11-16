<script setup>
import { onMounted, watch, computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { roleToString } from "@/utils";
import DeletionModal from "@/components/DeletionModal.vue";

const route = useRoute();
const router = useRouter();
const store = useStore();
const members = ref([]);
const org = ref();
const orgName = computed(() => org?.value?.name || "…");
const options = [
  //TODO: adapt to correct urls/onclick actions
  { href: "/change-role", title: "role.change" },
  { href: "/remove", title: "remove" },
];

const currentOrgId = computed(() => route.params.orgId);
onMounted(async () => update());
watch(currentOrgId, () => update());

const isLoading = ref(true);

const orgMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.id)
);

const isOwner = () => orgMembership.value?.role === "O";

const showDeleteOrgModal = ref(false);

const openDeleteOrgModal = () => (showDeleteOrgModal.value = true);
const deleteOrg = async () => {
  await store.dispatch("jv/delete", `organizations/${currentOrgId.value}`);
  router.push({ name: "org-management" });
};
const inviteMembers = () => console.log("TODO: open invite modal");
const removeMember = () => console.log("TODO: open modal to confirm removal");
const changeRole = () => console.log("TODO: open modal to change role");

const getRole = (memberships, username) =>
  roleToString(
    Object.values(memberships).find((m) => m.user_name === username).role
  );

const update = async () => {
  members.value = [];
  isLoading.value = true;
  org.value = await store.dispatch(
    "jv/get",
    `organizations/${currentOrgId.value}`
  );
  const membersIds = await store.dispatch(
    "jv/get",
    `organizations/${currentOrgId.value}/users`
  );
  const memberships = await store.dispatch(
    "jv/get",
    `organizations/${currentOrgId.value}/memberships`
  );
  const getMembers = Object.keys(membersIds).map(async (id) => {
    const member = await store.dispatch("jv/get", `users/${id}`);
    members.value.push({
      ...member,
      role: getRole(memberships, member.username),
    });
  });
  await Promise.all(getMembers);
  isLoading.value = false;
};
</script>

<template>
  <header class="bg-white shadow-md sm:rounded-md" v-if="$route.meta.title">
    <div class="max-w-screen-xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">
        {{ $t("org.members") }} {{ $t("of") }} {{ orgName }}
      </h1>
    </div>
  </header>
  <div v-if="isLoading">{{ $t("loading...") }}</div>
  <div v-else class="mt-8">
    <DeletionModal
      :open="showDeleteOrgModal"
      @close-modal="showDeleteOrgModal = false"
      @delete-clicked="deleteOrg"
      modal-title="delete-org-modal.title"
    >
      <p class="text-sm text-gray-500">{{ $t("delete-org-modal.message") }}</p>
    </DeletionModal>
    <div class="text-black">
      <div class="flex justify-end items-center">
        <div class="flex">
          <div
            v-if="isOwner"
            class="btn-sm m-2 gray-button font-semibold"
            @click="openDeleteOrgModal"
          >
            {{ $t("org.delete") }}
          </div>
          <div
            v-if="isOwner"
            class="btn-sm m-2 mr-0 gray-button font-semibold"
            @click="inviteMembers"
          >
            {{ $t("org.invite") }}
          </div>
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
                class="
                  px-2
                  sm:px-6
                  py-3
                  text-left text-xs
                  font-medium
                  text-gray-500
                  tracking-wider
                "
              >
                {{ $t("name") }}
              </th>
              <th
                scope="col"
                class="
                  sm:px-6
                  py-3
                  text-left text-xs
                  font-medium
                  text-gray-500
                  tracking-wider
                "
              >
                {{ $t("email") }}
              </th>
              <th
                scope="col"
                class="
                  px-2
                  sm:px-6
                  py-3
                  text-left text-xs
                  font-medium
                  text-gray-500
                  tracking-wider
                  hidden
                  md:table-cell
                "
              >
                {{ $t("role.singular") }}
              </th>
              <th
                scope="col"
                class="
                  px-2
                  sm:px-6
                  py-3
                  text-left text-xs
                  font-medium
                  text-gray-500
                  tracking-wider
                "
              >
                {{ $t("actions") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(member, memberIdx) in members"
              :key="member.id"
              :class="[memberIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50']"
            >
              <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex">
                  {{ member.first_name }} {{ member.last_name }}
                </div>
                <div class="text-gray-700 text-sm">{{ member.username }}</div>
              </td>
              <td class="sm:px-6 py-4 whitespace-nowrap">
                {{ member.email }}
              </td>
              <td
                class="hidden md:table-cell px-2 sm:px-6 py-4 whitespace-nowrap"
              >
                {{ $t(member.role) }}
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
                    class="btn-sm m-2 mr-0 gray-button font-semibold w-max"
                    @click="removeMember"
                  >
                    {{ $t("remove") }}
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
