<script setup>
import { onMounted, computed, ref } from "vue";
import { CogIcon } from "@heroicons/vue/outline";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Dropdown from "@/components/Dropdown.vue";

const route = useRoute();
const store = useStore();
const orgId = route.params.id;
const members = ref([]);
const org = ref();
const orgName = computed(() => org?.value?.name || "…");
const icon = CogIcon;
const options = [
  //TODO: adapt to correct urls/onclick actions
  { href: "/change-role", title: "Change role" },
  { href: "/remove", title: "Remove" },
];

onMounted(async () => {
  org.value = await store.dispatch("jv/get", `organizations/${orgId}`);
  const membersIds = await store.dispatch(
    "jv/get",
    `organizations/${orgId}/users`
  );
  const getMembers = Object.keys(membersIds).map(async (id) => {
    const member = await store.dispatch("jv/get", `users/${id}`);
    // TODO: get role
    members.value.push(member);
  });
  await Promise.all(getMembers);
});
</script>

<template>
  <div>
    <div class="text-black">
      <div class="flex justify-between items-center">
        <div class="">Members of the {{ orgName }}</div>
        <div class="btn-sm m-2 gray-button font-semibold">Invite Members</div>
      </div>
      <div class="ring-1 ring-gray-300 rounded-md bg-white text-lg">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex items-center justify-between border-b p-4"
        >
          <div class="flex flex-col flex-1">
            <div class="flex">
              {{ member.first_name }} {{ member.last_name }}
            </div>
            <div class="text-gray-700 text-sm">{{ member.username }}</div>
          </div>
          <div class="hidden sm:flex flex-1">{{ member.email }}</div>
          <!-- <div class="flex flex-1">role</div> -->
          <Dropdown :options="options" :icon="icon" />
        </div>
      </div>
    </div>
  </div>
</template>
