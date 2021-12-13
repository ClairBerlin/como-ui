import dayjs from "dayjs";

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

// (2^31) - 1, 03:14:08 UTC on Tuesday, 19 January 2038
export const maxUnixEpoch = 2_147_483_647;

export const dayFormatTimestamp = (unixTimestamp) => {
  if (unixTimestamp === maxUnixEpoch) {
    return "—";
  } else {
    return dayjs.unix(unixTimestamp).format("YYYY-MM-DD");
  }
};

export const detailFormatTimestamp = (unixTimestamp) => {
  if (unixTimestamp === maxUnixEpoch) {
    return "—";
  } else {
    return dayjs.unix(unixTimestamp).format("YYYY-MM-DD HH:mm");
  }
};

export const isInstallationActive = (installation) => {
  if (installation == null) {
    return false;
  } else {
    let now_s = dayjs().unix();
    return (
      installation.from_timestamp_s < now_s &&
      installation.to_timestamp_s > now_s
    );
  }
};

export const isAnyInstallationActive = (installations) =>
  installations.some(isInstallationActive);
