<template>
  <!-- Organization Menu -->
  <div class="flex items-center justify-between">
    <div
      class="
        w-2/3
        flex
        items-center
        p-2
        mr-1
        rounded
        cursor-pointer
        hover:bg-gray-100
        relative
      "
      @click="data.showOrgMenu = !data.showOrgMenu"
    >
      <div
        class="
          flex
          text-sm
          items-center
          justify-center
          rounded-sm
          w-4.5
          h-4.5
          font-bold
          text-white
          bg-blue-800
          mr-2.5
          px-2
        "
      >
        {{ getInitials(organizationName) }}
      </div>
      <div class="truncate text-sm font-bold mr-2.5">
        {{ organizationName }}
      </div>
      <ChevronDownIcon class="h-3 w-3" />
      <ProfileMenu
        class="absolute top-10"
        v-if="data.showOrgMenu"
      ></ProfileMenu>
    </div>
    <!-- Profile Menu -->
    <div
      @click="data.showProfileMenu = !data.showProfileMenu"
      class="
        w-2/3
        flex
        items-center
        p-2
        mr-1
        rounded
        cursor-pointer
        hover:bg-gray-100
        relative
      "
    >
      <div
        class="
          flex
          text-sm
          items-center
          justify-center
          rounded-sm
          w-4.5
          h-4.5
          font-bold
          text-white
          bg-blue-600
          mr-2.5
          px-2
        "
      >
        {{ getInitials(username) }}
      </div>
      <ChevronDownIcon class="h-3 w-3" />
      <!-- TODO: fix width of  -->
      <ProfileMenu
        class="absolute top-10"
        :isOpen="data.showProfileMenu"
        v-if="data.showProfileMenu"
        v-on:closeProfile="data.showProfileMenu = false"
      ></ProfileMenu>
    </div>
  </div>
</template>

<script>
import { reactive } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/outline";
import ProfileMenu from "./ProfileMenu.vue";
import OrganizationMenu from "./OrganizationMenu.vue";
export default {
  components: { ProfileMenu, OrganizationMenu, ChevronDownIcon },
  props: {
    organizationName: String,
    username: String,
  },
  setup() {
    const data = reactive({
      showOrgMenu: false,
      showProfileMenu: false,
    });
    const getInitials = (s) => {
      return s
        .split(" ")
        .map((n) => n.substring(0, 1).toUpperCase())
        .join("");
    };
    return { data, getInitials };
  },
};
</script>
