-- Users and Galleries tables used by login/signup and user gallery routes.
-- Run after Books exists. Existing data is preserved because this uses CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS Users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_email_not_blank CHECK (length(trim(email)) > 0),
  CONSTRAINT users_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE TABLE IF NOT EXISTS Galleries (
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id),
  CONSTRAINT galleries_user_fk FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  CONSTRAINT galleries_book_fk FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON Users (email);
CREATE INDEX IF NOT EXISTS idx_galleries_user_id ON Galleries (user_id);
CREATE INDEX IF NOT EXISTS idx_galleries_book_id ON Galleries (book_id);
CREATE INDEX IF NOT EXISTS idx_galleries_added_at ON Galleries (added_at DESC);
