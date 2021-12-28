<script setup>
import * as yup from "yup";
import { Form } from "vee-validate";
import TextInput from "./TextInput.vue";
import { useI18n } from "vue-i18n";
import SubmitButton from "./SubmitButton.vue";

const props = defineProps({
  orgName: { type: String, default: "" },
  orgDescription: { type: String, default: "" },
  allowEdit: { type: Boolean, default: false },
  buttonText: { type: String, required: true },
  onSubmit: { type: Function, required: true },
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
  <Form class="space-y-6" @submit="onSubmit" :validation-schema="schema">
    <TextInput
      :disabled="!allowEdit"
      :value="orgName"
      name="name"
      :label="t('org.name')"
    />
    <TextInput
      :disabled="!allowEdit"
      element="textarea"
      :value="orgDescription"
      name="description"
      :label="`${t('description')} (${t('optional')})`"
    />
    <SubmitButton :allow-submit="allowEdit">
      {{ $t(buttonText) }}
    </SubmitButton>
  </Form>
</template>
