<script setup>
import { onMounted, ref } from "vue";
import { CogIcon } from "@heroicons/vue/outline";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import OptionsButton from "@/components/OptionsButton.vue";

const route = useRoute();
const store = useStore();
const orgId = route.params.id;
const members = ref([]);
const icon = CogIcon;
const options = [
  //TODO: adapt to correct urls/onclick actions
  { href: "/change-role", title: "Change role" },
  { href: "/remove", title: "Remove" },
];

onMounted(async () => {
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
  console.log({ members });
});
</script>

<template>
  <div>
    <div class="text-black">
      <div class="flex justify-between">
        <div class="">{{ $route.params.id }}</div>
        <div class="gray-button">Invite Members (btn)</div>
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
          <OptionsButton :options="options" :icon="icon" />
        </div>
      </div>
    </div>
  </div>
</template>
