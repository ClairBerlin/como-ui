import axios from "axios";

const actions = {
  logout() {
    return axios.post("/api/v1/auth/logout/");
  },
  async fetchMemberships(context) {
    context.commit("START_MEMBERSHIPSLOADING");
    try {
      const userId = context.getters.getId;
      const { memberships } = await context.dispatch(
        "jv/getRelated",
        `users/${userId}/memberships`,
        {
          root: true,
        }
      );
      context.commit("SET_MEMBERSHIPS", memberships || []);
    } catch (error) {
      context.commit("MARK_ERROR");
      throw error;
    } finally {
      context.commit("STOP_MEMBERSHIPSLOADING");
    }
  },
  async fetchAuthenticatedUser(context) {
    context.commit("START_USERLOADING");
    try {
      const authUser = await axios.get("/api/v1/auth/user");
      const userId = authUser.data.data.id;
      const userDetails = await context.dispatch("jv/get", `users/${userId}/`, {
        root: true,
      });
      context.commit("SET_ID", userId);
      context.commit("SET_AUTHUSER", userDetails._jv.attrs);
      context.dispatch("fetchMemberships");
      context.commit("MARK_SUCCESS");
    } catch (error) {
      context.commit("MARK_ERROR");
      throw error;
    } finally {
      context.commit("STOP_USERLOADING");
    }
  },
};

export default actions;
