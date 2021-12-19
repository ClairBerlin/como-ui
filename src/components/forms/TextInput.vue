<script setup>
import { useField } from "vee-validate";

const props = defineProps({
  element: {
    type: String,
    default: "input",
  },
  type: {
    type: String,
    default: "text",
  },
  value: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: "",
  },
});
const {
  value: inputValue,
  errorMessage,
  handleBlur,
  handleChange,
  meta,
} = useField(props.name, undefined, { initialValue: props.value });
</script>

<template>
  <TextInput :class="{ 'has-error': !!errorMessage, success: meta.valid }">
    <label :for="name">{{ label }}</label>
    <component
      :is="element"
      :name="name"
      :id="name"
      :type="type"
      :value="inputValue"
      :placeholder="placeholder"
      @input="handleChange"
      @blur="handleBlur"
      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
    />

    <p class="mt-2 text-sm text-red-600" v-show="errorMessage">
      {{ errorMessage }}
    </p>
  </TextInput>
</template>
