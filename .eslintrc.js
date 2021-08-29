module.exports = {
  extends: [
    "plugin:prettier/recommended",
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:vue/vue3-essential",
    "plugin:vue/vue3-strongly-recommended",
  ],
  rules: {
    "vue/no-unused-vars": "error",
  },
};
