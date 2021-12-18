const getters = {
  isOrgContext(nav) {
    return !(nav.currentOrgId === undefined);
  },

  getOrgMembership(nav, getters, rootState, rootGetters) {
    return nav.currentOrgId
      ? rootGetters["authuser/getMembershipByOrgId"](nav.currentOrgId)
      : undefined;
  },

  getInstallations(nav, getters, rootState, rootGetters) {
    const instObj = rootGetters["jv/get"]({ _jv: { type: "Installation" } });
    const instList = Object.entries(instObj);
    return instList.map(([, inst]) => inst);
  },

  isOwner(nav, getters) {
    const currentMembership = getters["getOrgMembership"];
    return currentMembership?.role === "O";
  },

  isOrgContextLoading(nav, getters, rootState, rootGetters) {
    const isUserLoading = rootGetters["authuser/isLoading"];
    return (nav.isOrgLoading || nav.isInventoryLoading || isUserLoading);
  }
};

export default getters;
