const actions = {
  async changeOrganization({ dispatch, commit, state }, targetOrgId) {
    if (targetOrgId !== undefined) {
      console.log(`Change context to organization with ID ${targetOrgId}.`);
      commit("START_ORG_LOADING");
      if (state.currentOrgId !== targetOrgId) {
        clearInventory(commit);
      }
      await dispatch("jv/get", `organizations/${targetOrgId}`, { root: true });
      commit("STOP_ORG_LOADING");
    } else {
      console.log("No target organization provided.");
    }
    commit("SET_CURRENT_ORG", targetOrgId);
  },
};

export default actions;

const clearInventory = (commit) => {
  commit("jv/clearRecords", { _jv: { type: "Installation" } }, { root: true });
  commit("jv/clearRecords", { _jv: { type: "Room" } }, { root: true });
  commit("jv/clearRecords", { _jv: { type: "Node" } }, { root: true });
  commit("jv/clearRecords", { _jv: { type: "Site" } }, { root: true });
  commit("jv/clearRecords", { _jv: { type: "Address" } }, { root: true });
};
