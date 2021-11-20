<script setup>
import { useI18n } from "vue-i18n";
import { ChartBarIcon, EyeIcon, EyeOffIcon } from "@heroicons/vue/solid";

const { t } = useI18n();

const props = defineProps({
  installationId: { type: String, required: true },
  sensorName: { type: String, required: true },
  sensorId: { type: String, required: true },
  roomName: { type: String, required: true },
  roomId: { type: String, required: true },
  isPublic: { type: Boolean, required: true },
  latestMeasurement: { type: String, default: "" },
});

const installationTooltip = (isPublic) => {
  const tip = isPublic
    ? "This installation is public."
    : "This installation is not public.";
  return t(tip);
};

const ppm = parseInt(props?.latestMeasurement || "0");
const getColor = () => {
  if (!ppm) return "#9CA3AF";
  if (ppm <= 800) return "#7DBF70";
  if (ppm <= 1200) return "#EBAC56";
  return "#E1665E";
};

const getCircleHeight = () => {
  if (!ppm) return "-100";
  if (ppm <= 800) return "75";
  if (ppm <= 1200) return "50";
  return "25";
};

const ppmHeight = getCircleHeight();
const ppmColor = getColor();
</script>

<template>
  <div
    :class="[
      !ppm
        ? 'bg-gray-400'
        : ppm <= 800
        ? 'bg-[#7DBF70]'
        : ppm <= 1200
        ? 'bg-[#EBAC56]'
        : 'bg-[#E1665E]',
      'max-w-xs rounded-md shadow-md hover:shadow-lg drop-shadow-md hover:drop-shadow-lg p-8 ring-1 ring-gray-300 ring-opacity-50 text-black',
    ]"
  >
    <div class="flex justify-between font-bold">
      <div class="flex flex-col text-black">
        <router-link
          :to="{
            name: 'sensor',
            params: { sensorId: sensorId },
          }"
          class="underline text-2xl hover:text-gray-900 hover:no-underline"
        >
          {{ sensorName }}
        </router-link>
        <router-link
          :to="{
            name: 'room',
            params: { roomId: roomId },
          }"
          class="underline text-xl hover:text-gray-900 hover:no-underline"
        >
          {{ roomName }}
        </router-link>
      </div>
      <div :data-tip="installationTooltip(isPublic)" class="tooltip h-8 w-8">
        <EyeIcon v-if="isPublic" />
        <EyeOffIcon v-else />
      </div>
    </div>
    <div class="mt-6 flex justify-between">
      <div class="flex flex-col">
        <div class="text-gray-900 text-lg font-bold">
          {{ $t("Latest") }} CO<sub>2</sub> {{ $t("Value") }}
        </div>
        <div class="text-right mt-2">
          <div class="text-5xl font-black tracking-tight">
            {{ latestMeasurement || "-" }}
          </div>
          <div class="text-2xl font-bold tracking-tight leading-3">ppm</div>
        </div>
      </div>
      <div>
        <svg
          width="40"
          height="100"
          viewBox="0 0 40 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 6C0 2.68629 2.68629 0 6 0H34C37.3137 0 40 2.68629 40 6V94C40 97.3137 37.3137 100 34 100H6C2.68629 100 0 97.3137 0 94V6Z"
            fill="black"
          />
          <circle cx="20" :cy="ppmHeight" r="14" :fill="ppmColor" />
        </svg>
      </div>
    </div>
    <div class="mt-8">
      <router-link
        :to="{ name: 'installation', params: { installationId } }"
        class="
          bg-black
          hover:ring hover:ring-gray-300
          shadow-md
          drop-shadow-md
          flex
          p-2
          w-full
          rounded-lg
          text-lg text-gray-300
          font-semibold
          items-center
          justify-center
        "
      >
        <ChartBarIcon class="w-5 h-5 mr-3" />
        <span>{{ $t("View") }} CO<sub>2</sub> {{ $t("Chart") }}</span>
      </router-link>
    </div>
  </div>
</template>
