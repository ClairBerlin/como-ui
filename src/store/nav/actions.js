const actions = {
  async changeOrganization({ dispatch, commit, state }, targetOrgId) {
    if (targetOrgId !== undefined) {
      console.log(`Change context to organization with ID ${targetOrgId}.`);
      commit("START_ORG_LOADING");
      if (state.loadedOrgId !== targetOrgId) {
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
      clearInventory(commit);
      console.log(
        `Loading inventory for organization with ID ${targetOrgId}...`
      );
      const instObj = await dispatch(
        "jv/get",
        ["installations", { params: { "filter[organization]": targetOrgId } }],
        { root: true }
      );
      const instList = Object.entries(instObj);
      instList.map(([, inst]) => inst);
      const relatedResourcePromises = instList.map(([instId, inst]) => {
        console.log(`Get related objects for installation ${instId}.`);
        return dispatch("jv/getRelated", `installations/${instId}`, {
          root: true,
        }).then(() => {
          // At this point vuex-jsonapi has fetched the room object in inst.room, if any
          if (typeof inst.room === "object") {
            dispatch("jv/getRelated", `rooms/${inst.room._jv.id}`, {
              root: true,
            });
          }
        });
      });
      await Promise.all(relatedResourcePromises);
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
