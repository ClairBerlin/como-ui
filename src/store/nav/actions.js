const actions = {
  async changeOrganization({ dispatch, commit, state }, targetOrgId) {
    if (targetOrgId !== undefined) {
      console.log(`Change context to organization with ID ${targetOrgId}.`);
      commit("START_ORG_LOADING");
      if (
        state.loadedOrgId !== undefined &&
        state.loadedOrgId !== targetOrgId
      ) {
        clearInventory(commit);
      }
      await dispatch("jv/get", `organizations/${targetOrgId}`, { root: true });
      commit("STOP_ORG_LOADING");
    } else {
      console.log("No target organization provided.");
    }
    commit("SET_CURRENT_ORG", targetOrgId);
  },

  async loadInvetory({ dispatch, commit, state }, targetOrgId) {
    if (targetOrgId !== undefined && state.loadedOrgId !== targetOrgId) {
      commit("START_INVENTORY_LOADING");
      console.log(
        `Loading inventory for organization with ID ${targetOrgId}...`
      );
      const orgPromise = dispatch(
        "jv/get",
        ["sites", { params: { "filter[organization]": targetOrgId } }],
        { root: true }
      );
      const roomPromise = dispatch(
        "jv/get",
        ["rooms", { params: { "filter[organization]": targetOrgId } }],
        { root: true }
      );
      const sensorPromise = dispatch(
        "jv/get",
        ["nodes", { params: { "filter[organization]": targetOrgId } }],
        { root: true }
      );
      const instPromise = dispatch(
        "jv/get",
        ["installations", { params: { "filter[organization]": targetOrgId } }],
        { root: true }
      );
      await Promise.all([orgPromise, roomPromise, sensorPromise, instPromise]);
      commit("SET_LOADED_ORG", targetOrgId);
      commit("STOP_INVENTORY_LOADING");
      console.log(
        `Done loading inventory for organization with ID ${targetOrgId}.`
      );
    }
  },
};

export default actions;

const clearInventory = (commit) => {
  console.log("Clear stale inventory");
  commit("jv/clearRecords", { _jv: { type: "Installation" } }, { root: true });
  commit("jv/clearRecords", { _jv: { type: "Room" } }, { root: true });
  commit("jv/clearRecords", { _jv: { type: "Node" } }, { root: true });
  commit("jv/clearRecords", { _jv: { type: "Site" } }, { root: true });
  commit("jv/clearRecords", { _jv: { type: "Address" } }, { root: true });
  commit("CLEAR_LOADED_ORG");
};
