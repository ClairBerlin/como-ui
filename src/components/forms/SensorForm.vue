<script setup>
import * as yup from 'yup';
import { Form } from 'vee-validate';
import TextInput from './TextInput.vue';
import { useI18n } from 'vue-i18n';
import SubmitButton from './SubmitButton.vue';

defineProps({
  sensorAlias: { type: String, default: '' },
  sensorDescription: { type: String, default: '' },
  eui64: { type: String, default: '' },
  sensorId: { type: String, default: '' },
  tradeName: { type: String, default: '' },
  sensorManufacturer: { type: String, default: '' },
  allowEdit: { type: Boolean, default: false },
  buttonText: { type: String, required: true },
  onSubmit: { type: Function, required: true },
});

const { t } = useI18n();
yup.setLocale({
  mixed: { required: ({ label }) => label + ' ' + t('field_required') },
  string: {
    max: ({ label, max }) => t('field_too_big', { field: label, max }),
  },
});
const schema = yup.object().shape({
  alias: yup.string().required().max(100).label(t('node.name')),
  description: yup.string().nullable().label(t('description')),
  eui: yup.string().nullable().label(t('node.eui')),
  id: yup.string().nullable().label(t('node.id')),
  type: yup.string().nullable().label(t('node.type')),
  manufacturer: yup.string().nullable().label(t('node.manufacturer')),
});
</script>
<template>
  <Form class="space-y-6" @submit="onSubmit" :validation-schema="schema">
    <TextInput :disabled="!allowEdit" :value="sensorAlias" name="alias" :label="t('node.name')" />
    <TextInput
      :disabled="!allowEdit"
      element="textarea"
      :value="sensorDescription"
      name="description"
      :label="`${t('description')} (${t('optional')})`"
    />
    <TextInput disabled name="eui" :value="eui64" :label="t('node.eui')" />
    <TextInput disabled name="id" :value="sensorId" :label="t('node.id')" />
    <TextInput disabled name="type" :value="tradeName" :label="t('node.type')" />
    <TextInput disabled name="manufacturer" :value="sensorManufacturer" :label="t('node.manufacturer')" />
    <SubmitButton :allow-submit="allowEdit">
      {{ $t(buttonText) }}
    </SubmitButton>
  </Form>
</template>
