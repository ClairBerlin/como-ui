import Dashboard from "./views/Dashboard.vue";
import Team from "./views/Team.vue";
import NotFound from "./views/NotFound.vue";
import Sites from "@/views/Sites.vue";
import Rooms from "@/views/Rooms.vue";
import Installations from "@/views/Installations.vue";
import Sensors from "@/views/Sensors.vue";

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  { path: "/", component: Dashboard, meta: { title: "COMo" } },
  { path: "/team", meta: { title: "Team" }, component: Team },
  { path: "/sites", meta: { title: "Sites" }, component: Sites },
  { path: "/rooms", meta: { title: "Rooms" }, component: Rooms },
  {
    path: "/installations",
    meta: { title: "Installations" },
    component: Installations,
  },
  { path: "/sensors", meta: { title: "Sensors" }, component: Sensors },
  { path: "/:path(.*)", component: NotFound },
];
