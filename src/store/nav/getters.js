const getters = {
  isOrgContext(nav) {
    return !(nav.currentOrgId === undefined);
  },

  getOrgMembership(nav, getters, rootState, rootGetters) {
    return nav.currentOrgId
      ? rootGetters["authuser/getMembershipByOrgId"](nav.currentOrgId)
      : undefined;
  },

  isOwner(nav, getters) {
    const currentMembership = getters["getOrgMembership"];
    return currentMembership.value?.role === "O";
  },
};

export default getters;
