<script setup>
import { useI18n } from "vue-i18n";
import EyeIcon from "@/assets/EyeIcon.svg";
import EyeOffIcon from "@/assets/EyeOffIcon.svg";
import MeasurementVisualization from "./widget/MeasurementVisualization.vue";

const { t } = useI18n();

defineProps({
  installationId: { type: String, required: true },
  sensorName: { type: String, required: true },
  sensorId: { type: String, required: true },
  roomName: { type: String, required: true },
  roomId: { type: String, required: true },
  isPublic: { type: Boolean, required: true },
  latestMeasurement: { type: String, default: undefined },
});

const installationTooltip = (isPublic) => {
  const tip = isPublic
    ? "This installation is public."
    : "This installation is not public.";
  return t(tip);
};
</script>

<template>
  <div
    :class="[
      'card max-h-80 w-full max-w-2xs rounded bg-white text-[#1E398F] shadow-md',
    ]"
  >
    <div class="flex h-40 flex-col px-4 pt-5">
      <div
        :data-tip="installationTooltip(isPublic)"
        class="tooltip ml-1 mb-6 flex h-1 w-full"
      >
        <div class="flex w-full items-center justify-center" v-if="isPublic">
          <img class="mr-1 h-4 w-auto" :src="EyeIcon" alt="Data published" />
          <span class="text-xs font-semibold">{{ $t("public") }}</span>
        </div>
        <div class="flex w-full items-center justify-center" v-else>
          <img
            class="mr-1 h-4 w-auto"
            :src="EyeOffIcon"
            alt="Data not published"
          />
          <span class="text-xs font-semibold">{{ $t("not-public") }}</span>
        </div>
      </div>
      <div class="flex flex-col">
        <router-link
          :to="{
            name: 'room',
            params: { roomId: roomId },
          }"
          class="mb-1 break-words text-center text-xl font-bold line-clamp-2 hover:underline"
        >
          {{ roomName }}
        </router-link>
        <router-link
          :to="{
            name: 'sensor',
            params: { sensorId: sensorId },
          }"
          class="break-words text-center font-light leading-5 line-clamp-2 hover:underline"
        >
          {{ sensorName }}
        </router-link>
      </div>
    </div>
    <div
      v-if="latestMeasurement"
      class="flex h-20 flex-col justify-between px-4 pb-4"
    >
      <div class="flex flex-col">
        <div class="mb-3 flex items-center justify-end text-right">
          <div class="mr-1 text-2xl font-bold">
            {{ latestMeasurement || "-" }}
          </div>
          <div class="text-md">ppm</div>
        </div>
      </div>
      <div class="w-full">
        <MeasurementVisualization :ppm="latestMeasurement" />
      </div>
    </div>
    <div v-else class="flex h-20 items-end justify-center pb-7 text-[#E40032]">
      <span>– {{ $t("widget.error.title") }} –</span>
    </div>
    <div>
      <router-link
        :to="{ name: 'installation', params: { installationId } }"
        class="flex w-full items-center justify-center rounded-b bg-[#385BA7] p-5 font-semibold text-[#EFF0F0] hover:opacity-80"
      >
        <span>{{ $t("View") }} {{ $t("Chart") }}</span>
      </router-link>
    </div>
  </div>
</template>
