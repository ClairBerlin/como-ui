export const getInitials = (...args) =>
  args.map((a) => a[0].toUpperCase()).join("");

export const roleToString = (role) => {
  switch (role.toLowerCase()) {
    case "o":
      return "Owner";
    case "i":
      return "Inspector";
    case "a":
      return "Assistant";
    default:
      return "-";
  }
};
