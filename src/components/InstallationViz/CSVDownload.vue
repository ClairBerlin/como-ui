<script setup>
import dayjs from "dayjs";
const props = defineProps({
  loadSamplesFunction: { type: Function, required: true },
});

const downloadCSV = () => {
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
      const downloadLink = document.createElement("a");
      const blob = new Blob(["\ufeff", csv]);
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = "DataDump.csv"; //Name the file here
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    })
    .catch((err) => console.log(err));
};
</script>

<template>
  <div
    class="flex max-w-[327px] flex-col items-center gap-2 rounded-lg bg-white px-6 pt-7 pb-4 shadow-sm"
  >
    <p>Hier können sie die gesamten Daten als CSV herunterladen</p>
    <button class="indigo-button" @click="downloadCSV" :class="disabled">
      Download CSV
    </button>
  </div>
</template>
