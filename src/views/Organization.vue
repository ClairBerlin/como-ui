<script setup>
import { onMounted, computed, ref } from "vue";
import { CogIcon } from "@heroicons/vue/outline";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Dropdown from "@/components/Dropdown.vue";
import { roleToString } from "@/utils";

const route = useRoute();
const store = useStore();
const orgId = route.params.orgId;
const members = ref([]);
const org = ref();
const orgName = computed(() => org?.value?.name || "…");
const icon = CogIcon;
const options = [
  //TODO: adapt to correct urls/onclick actions
  { href: "/change-role", title: "Change role" },
  { href: "/remove", title: "Remove" },
];

const orgMembership = computed(() =>
  store.getters["authuser/getMembershipByOrgId"](route.params.id)
);

const isOwner = () => orgMembership.value?.role === "O";

const deleteOrg = () => console.log("TODO: open delete modal");
const inviteMembers = () => console.log("TODO: open invite modal");

const getRole = (memberships, username) =>
  roleToString(
    Object.values(memberships).find((m) => m.user_name === username).role
  );

onMounted(async () => {
  org.value = await store.dispatch("jv/get", `organizations/${orgId}`);
  const membersIds = await store.dispatch(
    "jv/get",
    `organizations/${orgId}/users`
  );
  const memberships = await store.dispatch(
    "jv/get",
    `organizations/${orgId}/memberships`
  );
  console.log({ memberships });
  const getMembers = Object.keys(membersIds).map(async (id) => {
    const member = await store.dispatch("jv/get", `users/${id}`);
    console.log({ member });
    members.value.push({
      ...member,
      role: getRole(memberships, member.username),
    });
  });
  await Promise.all(getMembers);
});
</script>

<template>
  <div>
    <div class="text-black">
      <div class="flex justify-between items-center">
        <div class="">
          Members of <span class="font-semibold">{{ orgName }}</span>
        </div>
        <div class="flex">
          <div
            v-if="isOwner"
            class="btn-sm m-2 gray-button font-semibold"
            @click="deleteOrg"
          >
            Delete organization
          </div>
          <div
            v-if="isOwner"
            class="btn-sm m-2 gray-button font-semibold"
            @click="inviteMembers"
          >
            Invite Members
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
                Name
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
                  hidden
                  sm:table-cell
                "
              >
                Email
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
                Role
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Edit</span>
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
              <td class="hidden sm:table-cell sm:px-6 py-4 whitespace-nowrap">
                {{ member.email }}
              </td>
              <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
                {{ member.role }}
              </td>
              <td class="px-2 sm:px-6 py-4 whitespace-nowrap">
                <Dropdown :options="options" :icon="icon" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
