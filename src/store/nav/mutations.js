import Cookies from "js-cookie";

const mutations = {
  START_ORG_LOADING(nav) {
    nav.isOrgLoading = true;
  },

  STOP_ORG_LOADING(nav) {
    nav.isOrgLoading = false;
  },

  START_INVENTORY_LOADING(nav) {
    nav.isInventoryLoading = true;
  },

  STOP_INVENTORY_LOADING(nav) {
    nav.isInventoryLoading = false;
  },

  SET_CURRENT_ORG(nav, orgId) {
    if (orgId !== undefined) {
      Cookies.set("lastVistedOrg", orgId);
    }
    nav.currentOrgId = orgId;
  },

  CLEAR_CURRENT_ORG(nav) {
    nav.currentOrgId = undefined;
  },

  SET_LOADED_ORG(nav, orgId) {
    nav.loadedOrgId = orgId;
  },

  CLEAR_LOADED_ORG(nav) {
    nav.loadedOrgId = undefined;
  },
};

export default mutations;
