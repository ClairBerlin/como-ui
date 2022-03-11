<script setup>
import * as yup from 'yup';
import { Form } from 'vee-validate';
import TextInput from './TextInput.vue';
import { useI18n } from 'vue-i18n';
import SubmitButton from './SubmitButton.vue';

defineProps({
  roomName: { type: String, default: '' },
  roomDescription: { type: String, default: '' },
  roomSize: { type: String, default: '' },
  roomHeight: { type: String, default: '' },
  roomCapacity: { type: String, default: '' },
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

const countDecimalPlaces = (numString) => {
  const seperator = numString.includes(',') ? ',' : '.';
  const [, places] = numString.split(seperator);
  return places?.length || 0;
};

const isValidSize = (value) => {
  if (!value) return true;
  if (countDecimalPlaces(value) > 1) return false;
  const size = parseFloat(value.replace(',', '.'));
  if (isNaN(size)) return false;
  if (size < 0 || size >= 10000) return false;
  return true;
};

const isValidHeight = (value) => {
  if (!value) return true;
  if (countDecimalPlaces(value) > 1) return false;
  const size = parseFloat(value.replace(',', '.'));
  if (isNaN(size)) return false;
  if (size < 0 || size > 20) return false;
  return true;
};

const isValidCapacity = (value) => {
  if (!value) return true;
  const size = parseInt(value);
  if (isNaN(size)) return false;
  if (size < 0 || size > 500) return false;
  return true;
};

const schema = yup.object().shape({
  name: yup.string().required().max(50).label(t('room.name')),
  description: yup.string().nullable().optional().label(t('description')),
  size: yup.string().test('is-valid-size', t('room.invalidSize'), isValidSize).label(t('room.size')),
  height: yup.string().test('is-valid-height', t('room.invalidHeight'), isValidHeight).label(t('room.height')),
  capacity: yup
    .string()
    .test('is-valid-capacity', t('room.invalidMaxOccupancy'), isValidCapacity)
    .label(t('room.maxOccupancy')),
});
</script>
<template>
  <Form class="space-y-6" @submit="onSubmit" :validation-schema="schema">
    <TextInput :disabled="!allowEdit" :value="roomName" name="name" :label="t('room.name')" />
    <TextInput
      :disabled="!allowEdit"
      element="textarea"
      :value="roomDescription"
      name="description"
      :label="`${t('description')} (${t('optional')})`"
    />
    <TextInput :disabled="!allowEdit" :value="roomSize" name="size" :label="`${t('room.size')} (${t('optional')})`" />
    <TextInput
      :disabled="!allowEdit"
      :value="roomHeight"
      name="height"
      :label="`${t('room.height')} (${t('optional')})`"
    />
    <TextInput
      :disabled="!allowEdit"
      :value="roomCapacity"
      name="capacity"
      :label="`${t('room.maxOccupancy')} (${t('optional')})`"
    />
    <SubmitButton :allow-submit="allowEdit">
      {{ $t(buttonText) }}
    </SubmitButton>
  </Form>
</template>
