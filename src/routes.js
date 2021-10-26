import Overview from "./views/Overview.vue";
import Dashboard from "./views/Dashboard.vue";
import Organizations from "./views/Organizations.vue";
import Organization from "./views/Organization.vue";
import AddOrganization from "./views/AddOrganization.vue";
import EditOrganization from "./views/EditOrganization.vue";
import NotFound from "./views/NotFound.vue";
import Sites from "@/views/Sites.vue";
import Rooms from "@/views/Rooms.vue";
import Installations from "@/views/Installations.vue";
import Sensors from "@/views/Sensors.vue";

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  {
    path: "/dashboard/:orgId",
    name: "home",
    component: Dashboard,
    props: true,
    meta: { title: "Organization" },
    children: [
      {
        // Summary of all current sensor readings of an organization
        path: "",
        name: "overview",
        component: Overview,
        meta: { title: "Sensor Overview" },
      },
      {
        // Details and visualization for a single installation
        path: "detail/:installationId",
        component: Installations,
        meta: { title: "Installation" },
      },
      {
        // Management of the Sites of the given organization (add, update, delete)
        path: "sites",
        name: "sites",
        component: Sites,
        meta: { title: "Sites" },
      },
      {
        // Management of the Rooms of a given site (add, update, delete)
        path: "sites/:siteId/rooms",
        meta: { title: "Rooms" },
        component: Rooms,
      },
      {
        // Management of the sensors of the given organization (add, delete, assign)
        path: "sensors",
        name: "sensors",
        component: Sensors,
        meta: { title: "Sensor Overview" },
        children: [
          {
            path: ":sensorId",
            component: Sensor,
            meta: { title: "Sensor Details" },
          },
        ],
      },
    ],
  },
  // { path: "/rooms", meta: { title: "Rooms" }, component: Rooms },
  // {
  //   path: "/installations",
  //   meta: { title: "Installations" },
  //   component: Installations,
  // },
  { path: "/:orgId/sensors", meta: { title: "Sensors" }, component: Sensors },
  {
    path: "/org-management",
    name: "org-management",
    meta: { title: "Manage Organizations" },
    component: Organizations,
  },
  {
    path: "/org-management/:orgId",
    name: "org-management-detail",
    meta: { title: "Organization" },
    component: Organization,
  },
  {
    path: "/org-management/:orgId/edit",
    name: "org-management-edit",
    meta: { title: "Edit Organization" },
    component: EditOrganization,
  },
  { path: "/:pathMatch(.*)", component: NotFound },
];
