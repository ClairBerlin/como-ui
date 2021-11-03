import Overview from "./views/Overview.vue";
import Dashboard from "./views/Dashboard.vue";
import Organizations from "./views/Organizations.vue";
import Organization from "./views/Organization.vue";
import AddOrganization from "./views/AddOrganization.vue";
import EditOrganization from "./views/EditOrganization.vue";
import NotFound from "./views/NotFound.vue";
import Sites from "@/views/Sites.vue";
import Site from "@/views/Site.vue";
import Rooms from "@/views/Rooms.vue";
import Room from "@/views/Room.vue";
import Installation from "@/views/Installation.vue";
import Sensors from "@/views/Sensors.vue";
import Sensor from "@/views/Sensor.vue";
import Logout from "@/views/Logout.vue";

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
        meta: { title: "Overview" },
      },
      {
        // Details and visualization for a single installation
        path: "installation/:installationId",
        name: "installation",
        component: Installation,
        meta: { title: "Installation" },
      },
      {
        // Management of the Sites of the given organization (add, update, delete)
        path: "sites",
        name: "sites",
        component: Sites,
        meta: { title: "Sites" },
        children: [
          {
            path: ":siteId",
            name: "site",
            component: Site,
            meta: { title: "Site Details" },
          },
        ],
      },
      {
        // Management of the Rooms of a given site (add, update, delete)
        path: "rooms",
        name: "rooms",
        meta: { title: "Rooms" },
        component: Rooms,
        children: [
          {
            path: ":roomId",
            name: "room",
            component: Room,
            meta: { title: "Room Details" },
          },
        ],
      },
      {
        // Management of the sensors of the given organization (add, delete, assign)
        path: "sensors",
        name: "sensors",
        component: Sensors,
        meta: { title: "Sensors" },
        children: [
          {
            path: ":sensorId",
            name: "sensor",
            component: Sensor,
            meta: { title: "Sensor Details" },
          },
        ],
      },
    ],
  },
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
  {
    path: "/org-management/add",
    name: "org-management-add",
    meta: { title: "Add Organization" },
    component: AddOrganization,
  },
  {
    path: "/accounts/email",
    name: "change-email",
    beforeEnter() {
      window.location.href = "/accounts/email";
    }
  },
  {
    path: "/accounts/password/change",
    name: "change-password",
    beforeEnter() {
      window.location.href = "/accounts/password/change";
    }
  },
  {
    path: "/logout",
    name: "logout",
    meta: { title: "Logout" },
    component: Logout
  },
  { path: "/:pathMatch(.*)", component: NotFound },
];
