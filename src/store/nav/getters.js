const getters = {
  isOrgContext(nav) {
    return !(nav.currentOrgId === undefined);
  },

  getOrgMembership(nav, getters, rootState, rootGetters) {
    return nav.currentOrgId ? rootGetters['authuser/getMembershipByOrgId'](nav.currentOrgId) : undefined;
  },

  getInstallations(nav, getters, rootState, rootGetters) {
    const instObj = rootGetters['jv/get']({ _jv: { type: 'Installation' } });
    const instList = Object.entries(instObj);
    return instList.map(([, inst]) => inst);
  },

  getSites(nav, getters, rootState, rootGetters) {
    const siteObj = rootGetters['jv/get']({ _jv: { type: 'Site' } });
    const siteList = Object.entries(siteObj);
    return siteList.map(([, site]) => site);
  },

  getRooms(nav, getters, rootState, rootGetters) {
    const roomObj = rootGetters['jv/get']({ _jv: { type: 'Room' } });
    const roomList = Object.entries(roomObj);
    return roomList.map(([, room]) => room);
  },

  getSensors(nav, getters, rootState, rootGetters) {
    const sensorObj = rootGetters['jv/get']({ _jv: { type: 'Node' } });
    const sensorList = Object.entries(sensorObj);
    return sensorList.map(([, sensor]) => sensor);
  },

  isOwner(nav, getters) {
    const currentMembership = getters['getOrgMembership'];
    return currentMembership?.role === 'O';
  },

  isOrgContextLoading(nav, getters, rootState, rootGetters) {
    const isUserLoading = rootGetters['authuser/isLoading'];
    return nav.isOrgLoading || nav.isInventoryLoading || isUserLoading;
  },
};

export default getters;
