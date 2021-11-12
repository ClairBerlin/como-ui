import Overview from "./views/Overview.vue";
import Dashboard from "./views/Dashboard.vue";
const Organizations = () => import("./views/Organizations.vue");
const Organization = () => import("./views/Organization.vue");
const AddOrganization = () => import("./views/AddOrganization.vue");
const EditOrganization = () => import("./views/EditOrganization.vue");
const NotFound = () => import("./views/NotFound.vue");
const Sites = () => import("@/views/Sites.vue");
const Site = () => import("@/views/Site.vue");
const Rooms = () => import("@/views/Rooms.vue");
const Room = () => import("@/views/Room.vue");
const Installation = () => import("@/views/Installation.vue");
const Sensors = () => import("@/views/Sensors.vue");
const Sensor = () => import("@/views/Sensor.vue");
const Logout = () => import("@/views/Logout.vue");

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
  },
  {
    path: "/dashboard/:orgId",
    name: "home",
    component: Dashboard,
    props: true,
    meta: { title: "org.singular" },
    children: [
      {
        // Summary of all current sensor readings of an organization
        path: "",
        name: "overview",
        component: Overview,
        meta: { title: "overview" },
      },
      {
        // Details and visualization for a single installation
        path: "installation/:installationId",
        name: "installation",
        component: Installation,
        meta: { title: "installation.details" },
      },
      {
        // Management of the Sites of the given organization (add, update, delete)
        path: "sites",
        name: "sites",
        component: Sites,
        meta: { title: "sites" },
      },
      {
        path: "sites/:siteId",
        name: "site",
        component: Site,
        meta: { title: "site.details" },
      },
      {
        // Management of the Rooms of a given site (add, update, delete)
        path: "rooms",
        name: "rooms",
        component: Rooms,
        meta: { title: "rooms" },
      },
      {
        path: "rooms/:roomId",
        name: "room",
        component: Room,
        meta: { title: "room.details" },
      },
      {
        // Management of the sensors of the given organization (add, delete, assign)
        path: "sensors",
        name: "sensors",
        component: Sensors,
        meta: { title: "nodes" },
      },
      {
        path: "sensors/:sensorId",
        name: "sensor",
        component: Sensor,
        meta: { title: "node.details" },
      },
    ],
  },
  {
    path: "/org-management",
    name: "org-management",
    meta: { title: "org.manage" },
    component: Organizations,
  },
  {
    path: "/org-management/:orgId",
    name: "org-management-detail",
    meta: { title: "org.detail" },
    component: Organization,
  },
  {
    path: "/org-management/:orgId/edit",
    name: "org-management-edit",
    meta: { title: "org.edit" },
    component: EditOrganization,
  },
  {
    path: "/org-management/add",
    name: "org-management-add",
    meta: { title: "org.add" },
    component: AddOrganization,
  },
  {
    path: "/accounts/email",
    name: "change-email",
    beforeEnter() {
      window.location.href = "/accounts/email";
    },
  },
  {
    path: "/accounts/password/change",
    name: "change-password",
    beforeEnter() {
      window.location.href = "/accounts/password/change";
    },
  },
  {
    path: "/logout",
    name: "logout",
    meta: { title: "user.logout" },
    component: Logout,
  },
  { path: "/:pathMatch(.*)", component: NotFound },
];
