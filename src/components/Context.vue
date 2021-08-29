<template>
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
          text-white
          bg-yellow-500
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
    </div>
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
          bg-yellow-500
          mr-2.5
          px-2
        "
      >
        {{ getInitials(username) }}
      </div>
      <ChevronDownIcon class="h-3 w-3" />
    </div>
  </div>
</template>

<script>
import { ChevronDownIcon } from "@heroicons/vue/outline";
export default {
  components: { ChevronDownIcon },
  props: {
    organizationName: String,
    username: String,
  },
  methods: {
    getInitials(s) {
      return s
        .split(" ")
        .map((n) => n.substring(0, 1).toUpperCase())
        .join("");
    },
  },
};
</script>
