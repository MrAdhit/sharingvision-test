-- migrate:up
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    category VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- I would normally use ENUM instead of VARCHAR & CHECK
    status VARCHAR(100) CHECK (status IN ("Publish", "Draft", "Trash"))
);

-- migrate:down
DROP TABLE posts;
