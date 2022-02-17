# COMo UI

This is the frontend for the [Clair Platform](https://github.com/ClairBerlin/clair-stack), a system to collect measurements from networked CO2-sensors for indoor air-quality monitoring.[^como-note]

The frontend is a [Vue 3](https://v3.vuejs.org/) single page application. [Tailwind CSS](https://tailwindcss.com/) is used for styling, [Headless UI](https://headlessui.dev/) for accessible UI components, and [Heroicons](https://heroicons.com/) as the icon library.

## Setup

[Vite](https://vitejs.dev/) is used as the build tool.

Assuming the backend API is available on localhost:8888 (see [dev setup](https://github.com/ClairBerlin/clair-stack#development-setup)).

The backend provies a [json:api](https://jsonapi.org/) which is accessed from the frontend via the [jsonapi-vuex](https://github.com/mrichar1/jsonapi-vuex) library.

To install the dependencies:

```bash
yarn
```

To run the frontend in local development mode:

```bash
yarn dev
```

## Recommended Reading

- [Composition API](https://v3.vuejs.org/api/composition-api.html)
  - [Setup](https://v3.vuejs.org/api/composition-api.html#setup)
  - [Lifecycle Hooks](https://v3.vuejs.org/api/composition-api.html#lifecycle-hooks)
- [Vuex + Composition API](https://next.vuex.vuejs.org/guide/composition-api.html)
- [Nested Routes](https://router.vuejs.org/guide/essentials/nested-routes.html)
- [Programmatic Navigation](https://router.vuejs.org/guide/essentials/navigation.html)

[^como-note]: The clair platform and the Clair-Berlin initiative are now part of the [CO2-Monitoring (COMo) project](https://www.technologiestiftung-berlin.de/projekte/como-berlin), funded by a grant from the [Senate Chancellery of the Governing Mayor of Berlin](https://www.berlin.de/rbmskzl/en/).
