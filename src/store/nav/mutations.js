const mutation = {
  START_ORG_LOADING(nav) {
    nav.orgIsLoading = true;
  },

  STOP_ORG_LOADING(nav) {
    nav.orgIsLoading = false;
  },

  SET_CURRENT_ORG(nav, orgId) {
    nav.currentOrgId = orgId;
  },
};

export default mutation;
