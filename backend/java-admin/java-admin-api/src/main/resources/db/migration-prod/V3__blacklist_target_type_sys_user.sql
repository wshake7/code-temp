-- v15: sys_blacklist.target_type USER → SYS_USER（对齐表名 sys_user）
UPDATE sys_blacklist
SET target_type = 'SYS_USER'
WHERE target_type = 'USER';
