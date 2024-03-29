import Dashboard from "@/views/Dashboard.vue";
import Overview from "@/views/Overview.vue";
const Organizations = () => import("@/views/Organizations.vue");
const Organization = () => import("@/views/Organization.vue");
const AddOrganization = () => import("@/views/AddOrganization.vue");
const EditOrganization = () => import("@/views/EditOrganization.vue");
const NotFound = () => import("@/views/NotFound.vue");
const Sites = () => import("@/views/Sites.vue");
const Site = () => import("@/views/Site.vue");
const AddSite = () => import("@/views/AddSite.vue");
const AddRoom = () => import("@/views/AddRoom.vue");
const Rooms = () => import("@/views/Rooms.vue");
const Room = () => import("@/views/Room.vue");
const Installation = () => import("@/views/Installation.vue");
const AddInstallation = () => import("@/views/AddInstallation.vue");
const Sensors = () => import("@/views/Sensors.vue");
const Sensor = () => import("@/views/Sensor.vue");
const AddSensor = () => import("@/views/AddSensor.vue");
const Logout = () => import("@/views/Logout.vue");
const Widget = () => import("@/views/Widget.vue");

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/embed/:siteId",
    name: "embed",
    component: Widget,
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
    meta: { title: "org.details", breadcrumbs: ["org-management"] },
    component: Organization,
  },
  {
    path: "/org-management/:orgId/edit",
    name: "org-management-edit",
    meta: { title: "org.edit", breadcrumbs: ["org-management"] },
    component: EditOrganization,
  },
  {
    path: "/org-management/add",
    name: "org-management-add",
    meta: { title: "org.add", breadcrumbs: ["org-management"] },
    component: AddOrganization,
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
        path: "",
        name: "overview",
        component: Overview,
        meta: { title: "overview" },
      },
      {
        path: "installation/:installationId",
        name: "installation",
        component: Installation,
        meta: {
          title: "installation.details",
          breadcrumbs: ["overview"],
        },
      },
      {
        path: "sites",
        name: "sites",
        component: Sites,
        meta: { title: "sites" },
      },
      {
        path: "sites/addSite",
        name: "addSite",
        component: AddSite,
        meta: { title: "site.add", breadcrumbs: ["sites"] },
      },
      {
        path: "sites/:siteId",
        name: "site",
        component: Site,
        meta: { title: "site.details", breadcrumbs: ["sites"] },
      },
      {
        path: "sites/:siteId/addRoom",
        name: "addRoom",
        component: AddRoom,
        meta: { title: "room.add", breadcrumbs: ["sites"] },
      },
      {
        path: "rooms",
        name: "rooms",
        component: Rooms,
        meta: { title: "rooms" },
      },
      {
        path: "rooms/:roomId",
        name: "room",
        component: Room,
        meta: { title: "room.details", breadcrumbs: ["rooms"] },
      },
      {
        path: "rooms/:roomId/addInstallation",
        name: "addInstallation",
        component: AddInstallation,
        meta: { title: "installation.add", breadcrumbs: ["rooms"] },
      },
      {
        path: "sensors",
        name: "sensors",
        component: Sensors,
        meta: { title: "nodes" },
      },
      {
        path: "addSensor",
        name: "addSensor",
        component: AddSensor,
        meta: { title: "node.add" },
      },
      {
        path: "sensors/:sensorId",
        name: "sensor",
        component: Sensor,
        meta: { title: "node.details", breadcrumbs: ["sensors"] },
      },
    ],
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
