<script setup>
import dayjs from "dayjs";
import { ref } from "vue";
const props = defineProps({
  loadSamplesFunction: { type: Function, required: true },
  alias: { type: Object || undefined, required: true },
});

const loadingStatus = ref("default");

const downloadCSV = () => {
  loadingStatus.value = "loading";
  const filename = props.alias?.eui64
    ? props.alias?.eui64
    : props.alias?.alias
    ? props.alias?.alias
    : "Installation-data";

  props
    .loadSamplesFunction(0, dayjs().utc().unix())
    .then((res) => {
      var json = res;
      var fields = Object.keys(json[0]);
      var replacer = function (key, value) {
        return value === null ? "" : value;
      };
      var csv = json.map(function (row) {
        return fields
          .map(function (fieldName) {
            return JSON.stringify(row[fieldName], replacer);
          })
          .join(",");
      });
      csv.unshift(fields.join(",")); // add header column
      return csv.join("\r\n");
    })
    .then((csv) => {
      //Download the file as CSV
      loadingStatus.value = "started";
      const downloadLink = document.createElement("a");
      const blob = new Blob(["\ufeff", csv]);
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = `${filename}.csv`; //Name the file here
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    })
    .catch((err) => console.log(err));
};
</script>

<template>
  <div class="mt-16 flex flex-col gap-4">
    <h2 class="text-left text-2xl font-bold leading-10 text-[#1E398F]">
      {{ $t("download.header") }}
    </h2>
    <p class="pb-2.5 font-bold text-[#3B3B3A]">{{ $t("download.text") }}</p>

    <button
      v-if="loadingStatus === `default`"
      class="indigo-button w-fit bg-[#385BA7] py-3 px-8 font-bold"
      @click="downloadCSV"
    >
      {{ $t("download.button.default") }}
    </button>

    <button
      v-else
      class="gray-button w-fit cursor-default py-3 px-8 font-bold hover:bg-gray-300 hover:ring-0"
      disabled
      @click="downloadCSV"
    >
      {{ $t(`download.button.${loadingStatus}`) }}
    </button>
  </div>
</template>
