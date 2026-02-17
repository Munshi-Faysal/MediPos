BEGIN TRANSACTION;
GO

CREATE TABLE [HubUserConnection] (
    [Id] int NOT NULL IDENTITY,
    [HubConnectionId] nvarchar(450) NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [ConnectAt] datetime NOT NULL DEFAULT ((getdate())),
    [LoginAt] datetime NOT NULL DEFAULT ((getdate())),
    [LogOutAt] datetime NULL,
    [IsActiveConnection] bit NOT NULL DEFAULT (((1))),
    [AppType] nvarchar(100) NULL,
    CONSTRAINT [PK_HubUserConnection] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Messages] (
    [Id] int NOT NULL IDENTITY,
    [SenderId] int NOT NULL,
    [ReceiverId] int NOT NULL,
    [Content] nvarchar(1000) NOT NULL,
    [SenderName] nvarchar(200) NULL,
    [SentAt] datetime NOT NULL DEFAULT ((getdate())),
    [DeliveredAt] datetime NULL,
    [SeenAt] datetime NULL,
    [Status] int NOT NULL DEFAULT 1,
    [MessageId] nvarchar(450) NULL,
    [CreatedDate] datetime2 NOT NULL,
    [UpdatedDate] datetime2 NOT NULL,
    [CreatedBy] int NOT NULL,
    [UpdatedBy] int NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_Messages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Messages_ApplicationUser_Receiver] FOREIGN KEY ([ReceiverId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Messages_ApplicationUser_Sender] FOREIGN KEY ([SenderId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_AspNetUsers_DepartmentId] ON [AspNetUsers] ([DepartmentId]);
GO

CREATE INDEX [IX_AspNetUsers_DesignationId] ON [AspNetUsers] ([DesignationId]);
GO

CREATE INDEX [IX_Messages_ReceiverId] ON [Messages] ([ReceiverId]);
GO

CREATE INDEX [IX_Messages_SenderId] ON [Messages] ([SenderId]);
GO

ALTER TABLE [AspNetUsers] ADD CONSTRAINT [FK_AspNetUsers_WfBaseDepartment_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [WfBaseDepartment] ([Id]);
GO

ALTER TABLE [AspNetUsers] ADD CONSTRAINT [FK_AspNetUsers_WfBaseDesignation_DesignationId] FOREIGN KEY ([DesignationId]) REFERENCES [WfBaseDesignation] ([Id]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251006040316_AddMessagesTable', N'8.0.19');
GO

COMMIT;
GO

