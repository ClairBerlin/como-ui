<template>
  <div class="">
    <div
      class="
        max-w-screen-xl
        px-4
        py-12
        mx-auto
        sm:px-6
        lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between
      "
    >
      <h2
        class="
          text-3xl
          font-extrabold
          leading-9
          tracking-tight
          text-gray-900
          sm:text-4xl sm:leading-10
        "
      >
        Teams
      </h2>
    </div>
    <div class="flex flex-col" v-for="m in memberships" :key="m.orgId">
      <div class="text-xl font-bold">
        {{ m.orgName }}
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();
    return {
      memberships: computed(() => store.state.authuser.memberships),
    };
  },
};
</script>
