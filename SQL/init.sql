-- 创建用户聊天集合表
CREATE TABLE chat_collections (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,  -- Cognito用户ID
    collection_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建聊天记录表
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES chat_collections(id),
    sequence_number INTEGER NOT NULL,  -- 在对话中的序号
    role VARCHAR(50) NOT NULL,  -- 'user' 或 'model'
    content JSONB NOT NULL, -- 包含text和image,结构为{"text": string, "images": string[]}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_user_id ON chat_collections(user_id);
CREATE INDEX idx_collection_id ON chat_messages(collection_id);
CREATE INDEX idx_sequence ON chat_messages(collection_id, sequence_number);


-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为chat_collections表添加触发器
CREATE TRIGGER update_chat_collections_updated_at
    BEFORE UPDATE ON chat_collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();