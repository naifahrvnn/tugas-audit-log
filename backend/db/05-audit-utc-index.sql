USE review_kantin;
GO
IF EXISTS (SELECT 1 FROM sys.default_constraints
           WHERE name = 'DF_AUDIT_LOGS_created_at' AND parent_object_id = OBJECT_ID('dbo.AUDIT_LOGS'))
    ALTER TABLE dbo.AUDIT_LOGS DROP CONSTRAINT DF_AUDIT_LOGS_created_at;
GO
ALTER TABLE dbo.AUDIT_LOGS
    ADD CONSTRAINT DF_AUDIT_LOGS_created_at DEFAULT SYSUTCDATETIME() FOR created_at;
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AUDIT_LOGS_created' AND object_id = OBJECT_ID('dbo.AUDIT_LOGS'))
    CREATE INDEX IX_AUDIT_LOGS_created ON dbo.AUDIT_LOGS (created_at DESC, id DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AUDIT_LOGS_user' AND object_id = OBJECT_ID('dbo.AUDIT_LOGS'))
    CREATE INDEX IX_AUDIT_LOGS_user ON dbo.AUDIT_LOGS (user_id, created_at DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AUDIT_LOGS_action' AND object_id = OBJECT_ID('dbo.AUDIT_LOGS'))
    CREATE INDEX IX_AUDIT_LOGS_action ON dbo.AUDIT_LOGS (action, target_table, created_at);
GO