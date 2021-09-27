export const getInitials = (...args) =>
  args.map((a) => a[0].toUpperCase()).join("");

export default getInitials;
