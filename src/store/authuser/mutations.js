const mutation = {
  START_USERLOADING(authuser) {
    authuser.isUserLoading = true;
  },

  STOP_USERLOADING(authuser) {
    authuser.isUserLoading = false;
  },

  START_MEMBERSHIPSLOADING(authuser) {
    authuser.membershipsAreLoading = true;
  },

  STOP_MEMBERSHIPSLOADING(authuser) {
    authuser.membershipsAreLoading = false;
  },

  MARK_ERROR(authuser) {
    authuser.error = true;
  },

  MARK_SUCCESS(authuser) {
    authuser.error = false;
  },

  SET_ID(authuser, id) {
    authuser.id = id;
  },

  SET_AUTHUSER(authuser, { email, first_name, last_name, username }) {
    authuser.email = email;
    authuser.firstName = first_name;
    authuser.lastName = last_name;
    authuser.userName = username;
  },

  SET_MEMBERSHIPS(authuser, memberships) {
    authuser.memberships = [];
    authuser.memberships.push(...memberships);
  },
};

export default mutation;
