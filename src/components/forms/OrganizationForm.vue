<script setup>
import * as yup from "yup";
import { Form } from "vee-validate";
import TextInput from "./TextInput.vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  orgName: { type: String, default: "" },
  orgDescription: { type: String, default: "" },
  allowEdit: { type: Boolean, default: false },
  buttonText: { type: String, required: true },
  submit: { type: Function, required: true },
});

const { t } = useI18n();
yup.setLocale({
  mixed: { required: ({ label }) => label + " " + t("field_required") },
});
const schema = yup.object().shape({
  name: yup.string().required().label(t("org.name")),
  description: yup.string().label(t("org.name")),
});
</script>
<template>
  <Form
    class="space-y-8 divide-y divide-gray-200"
    @submit="submit"
    :validation-schema="schema"
  >
    <TextInput
      :value="orgName"
      name="name"
      :label="t('org.name')"
      :placeholder="name"
    />
    <TextInput
      element="textarea"
      :value="orgDescription"
      name="description"
      :label="`${t('description')} (${t('optional')})`"
      :placeholder="orgDescription"
    />
    <button
      type="submit"
      class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      v-if="allowEdit"
    >
      {{ $t(buttonText) }}
    </button>
  </Form>
</template>
