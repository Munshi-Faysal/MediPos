namespace Domain.Helpers;

public static class PermissionHelper
{
    public const string PermissionClaimType = "Permission";
    public const string BranchPermissionClaimType = "BranchPermission";

    public static class Actions
    {
        public const string View = "View";
        public const string Create = "Create";
        public const string Edit = "Edit";
        public const string Delete = "Delete";
        public const string Export = "Export";
        public const string Import = "Import";
        public const string Approve = "Approve";
        public const string Reject = "Reject";
        public const string Print = "Print";
    }

    public static string GeneratePermissionKey(string menuName, string actionName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(menuName);
        ArgumentException.ThrowIfNullOrWhiteSpace(actionName);

        return $"{CreateMenuKey(menuName)}_{actionName.ToLower().Trim()}";
    }

    public static string CreateMenuKey(string menuName)
    {
        if (string.IsNullOrWhiteSpace(menuName))
            return string.Empty;

        return menuName.ToLower().Replace(" ", "_").Replace("-", "_").Replace(".", "_");
    }

    public static (string MenuKey, string ActionKey) ParsePermissionKey(string permissionKey)
    {
        if (string.IsNullOrWhiteSpace(permissionKey))
            return (string.Empty, string.Empty);

        var lastUnderscoreIndex = permissionKey.LastIndexOf('_');
        if (lastUnderscoreIndex <= 0)
            return (permissionKey, string.Empty);

        return (permissionKey[..lastUnderscoreIndex], permissionKey[(lastUnderscoreIndex + 1)..]);
    }

    public static bool IsValidPermissionKey(string permissionKey)
    {
        if (string.IsNullOrWhiteSpace(permissionKey) || !permissionKey.Contains('_') || permissionKey != permissionKey.ToLower())
            return false;

        var (menuKey, actionKey) = ParsePermissionKey(permissionKey);
        return !string.IsNullOrEmpty(menuKey) && !string.IsNullOrEmpty(actionKey);
    }
}