-- =========================================================================================
-- Script to Promote a Registered User to System-Admin
-- 
-- INSTRUCTIONS:
-- 1. Register a user in the application (e.g. via /api/Account/Register or the UI).
--    Note: The initial user will have no roles.
-- 2. Update the @Email variable below to match the registered user's email.
-- 3. Run this script against your database.
-- 4. Login with the user. You should now have System-Admin access.
-- =========================================================================================

DECLARE @Email NVARCHAR(256) = 'your.email@example.com'; -- <<< CHANGE THIS TO YOUR EMAIL
DECLARE @RoleName NVARCHAR(256) = 'System-Admin';
DECLARE @ScopeCode NVARCHAR(50) = 'GLOBAL';

BEGIN TRANSACTION;

BEGIN TRY
    -- 1. Ensure GLOBAL Scope exists (Required for ApplicationRole)
    DECLARE @ScopeId INT;
    SELECT @ScopeId = Id FROM WfBaseKeyword WHERE KeywordCode = @ScopeCode AND KeywordType = 'Scope';

    IF @ScopeId IS NULL
    BEGIN
        PRINT 'Creating GLOBAL Scope...';
        INSERT INTO WfBaseKeyword (KeywordType, KeywordCode, KeywordText, Sequence, IsActive)
        VALUES ('Scope', @ScopeCode, 'Global Scope', 1, 1);
        
        SET @ScopeId = SCOPE_IDENTITY();
    END

    -- 2. Ensure System-Admin Role exists
    DECLARE @RoleId INT;
    SELECT @RoleId = Id FROM AspNetRoles WHERE Name = @RoleName;

    IF @RoleId IS NULL
    BEGIN
        PRINT 'Creating System-Admin Role...';
        INSERT INTO AspNetRoles (
            Name, 
            NormalizedName, 
            RoleCode, 
            IsActive, 
            ScopeId, 
            CreatedDate, 
            UpdatedDate, 
            CreatedBy, 
            UpdatedBy,
            IsAllowMultiple,
            IsParallel, 
            IsByPass,
            MinApprovalCount,
            HierarchyLevel,
            IsSendEmail
        )
        VALUES (
            @RoleName, 
            UPPER(@RoleName), 
            'SYS_ADMIN', -- RoleCode
            1, -- IsActive
            @ScopeId, 
            GETDATE(), 
            GETDATE(), 
            0, -- System
            0, -- System
            0, 0, 0, 0, 0, 0 -- Defaults
        );
        
        SET @RoleId = SCOPE_IDENTITY();
    END

    -- 3. Get User ID
    DECLARE @UserId INT;
    SELECT @UserId = Id FROM AspNetUsers WHERE Email = @Email;

    IF @UserId IS NULL
    BEGIN
        PRINT 'User not found! Please register the user with email ' + @Email + ' first.';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- 4. Assign Role to User
    IF NOT EXISTS (SELECT 1 FROM AspNetUserRoles WHERE UserId = @UserId AND RoleId = @RoleId)
    BEGIN
        PRINT 'Assigning System-Admin role to user...';
        INSERT INTO AspNetUserRoles (UserId, RoleId) VALUES (@UserId, @RoleId);
        PRINT 'Success! User ' + @Email + ' is now a System-Admin.';
    END
    ELSE
    BEGIN
        PRINT 'User ' + @Email + ' is already a System-Admin.';
    END

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    PRINT 'Error occurred: ' + ERROR_MESSAGE();
    ROLLBACK TRANSACTION;
END CATCH;
