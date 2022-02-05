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
  disabled: {
    type: Boolean,
    default: false,
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
  <div>
    <label class="mb-1 block font-semibold text-gray-900" :for="name">{{
      label
    }}</label>
    <component
      :disabled="disabled ? true : undefined"
      :is="element"
      :name="name"
      :id="name"
      :type="type"
      :value="inputValue"
      :placeholder="placeholder"
      @input="handleChange"
      @blur="handleBlur"
      :class="[
        'border-2 focus:outline-none focus:ring-1',
        !meta.valid
          ? '!important border-red-500 focus:ring-red-500'
          : '!important border-gray-300 focus:ring-indigo-500',
        'w-full rounded-md text-gray-900 shadow-inner',
        'disabled:cursor-not-allowed disabled:opacity-50',
      ]"
    />

    <p class="mt-1 text-sm font-medium text-red-600" v-show="errorMessage">
      {{ errorMessage }}
    </p>
  </div>
</template>
