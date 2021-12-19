export default function () {
  return {
    currentOrgId: undefined, // Selected and displayed organization (if any)
    loadedOrgId: undefined, // Organization whose inventory is currently loaded
    isOrgLoading: true,
    isInventoryLoading: true,
  };
}
