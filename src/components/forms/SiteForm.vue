<script setup>
import * as yup from 'yup';
import { Form } from 'vee-validate';
import TextInput from './TextInput.vue';
import { useI18n } from 'vue-i18n';
import SubmitButton from './SubmitButton.vue';

defineProps({
  siteName: { type: String, default: '' },
  siteDescription: { type: String, default: '' },
  addressStreet1: { type: String, default: '' },
  addressStreet2: { type: String, default: '' },
  addressZip: { type: String, default: '' },
  addressCity: { type: String, default: '' },
  allowEdit: { type: Boolean, default: false },
  buttonText: { type: String, required: true },
  onSubmit: { type: Function, required: true },
});

const { t } = useI18n();
yup.setLocale({
  mixed: { required: ({ label }) => t('field_required', { field: label }) },
  string: {
    max: ({ label, max }) => t('field_too_big', { field: label, max }),
    length: ({ label, length }) => t('field_length_mismatch', { field: label, length }),
  },
});
const schema = yup.object().shape({
  name: yup.string().required().max(50).label(t('site.name')),
  description: yup.string().nullable().optional().label(t('description')),
  street1: yup.string().required().max(50).label(t('address.street1')),
  street2: yup.string().nullable().optional().max(50).label(t('address.street2')),
  zip: yup.string().required().length(5).label(t('address.zip')),
  city: yup.string().required().max(50).label(t('address.city')),
});
</script>
<template>
  <Form class="space-y-6" @submit="onSubmit" :validation-schema="schema">
    <TextInput :disabled="!allowEdit" :value="siteName" name="name" :label="t('site.name')" />
    <TextInput
      :disabled="!allowEdit"
      element="textarea"
      :value="siteDescription"
      name="description"
      :label="`${t('description')} (${t('optional')})`"
    />
    <TextInput :disabled="!allowEdit" :value="addressStreet1" name="street1" :label="t('address.street1')" />
    <TextInput
      :disabled="!allowEdit"
      :value="addressStreet2"
      name="street2"
      :label="`${t('address.street2')} (${t('optional')})`"
    />
    <TextInput :disabled="!allowEdit" :value="addressZip" name="zip" :label="t('address.zip')" />
    <TextInput :disabled="!allowEdit" :value="addressCity" name="city" :label="t('address.city')" />
    <SubmitButton :allow-submit="allowEdit">
      {{ $t(buttonText) }}
    </SubmitButton>
  </Form>
</template>
