export const getInitials = (...args) =>
  args.map((a) => a[0].toUpperCase()).join("");

export const roleToString = (role) => {
  switch (role.toLowerCase()) {
    case "o":
      return "role.owner";
    case "i":
      return "role.inspector";
    case "a":
      return "role.assistant";
    default:
      return "-";
  }
};
