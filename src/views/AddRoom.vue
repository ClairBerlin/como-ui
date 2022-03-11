<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import RoomForm from '@/components/forms/RoomForm.vue';

const store = useStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const siteId = computed(() => route.params.siteId);
const isOwner = computed(() => store.getters['nav/isOwner']);

const createRoom = async ({ name, description, size, height, capacity }) => {
  const newRoom = {
    _jv: {
      type: 'Room',
      relationships: {
        site: {
          data: {
            type: 'Site',
            id: siteId.value,
          },
        },
      },
    },
    name,
    description,
    size_sqm: size?.replace(',', '.') || undefined,
    height_m: height?.replace(',', '.') || undefined,
    max_occupancy: capacity || undefined,
  };
  try {
    await store.dispatch('jv/post', [newRoom, { url: `rooms/` }]);
    router.push({
      name: 'site',
      params: { siteId: siteId.value },
    });
  } catch (e) {
    toast.error(t('room.createError'));
  }
};
</script>

<template>
  <div class="mt-8 max-w-sm sm:max-w-lg">
    <div class="rounded-sm bg-white p-6 shadow-md">
      <RoomForm :allow-edit="isOwner" button-text="room.add" :on-submit="createRoom" />
    </div>
  </div>
</template>
