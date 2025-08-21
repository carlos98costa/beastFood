-- Script de configuração do banco de dados BeastFood
-- Execute este script no PostgreSQL para criar o banco e as tabelas

-- 1. Criar o banco de dados
CREATE DATABASE beastfood;

-- 2. Conectar ao banco beastfood
\c beastfood;

-- 3. Habilitar a extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 4. Criar tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    bio TEXT,
    profile_picture TEXT,
    cover_picture TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Criar tabela de restaurantes
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    cuisine_type VARCHAR(100),
    price_range VARCHAR(20),
    phone_number VARCHAR(20),
    website TEXT,
    external_id VARCHAR(100),
    source VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Criar tabela de restaurantes pendentes (sugestões)
CREATE TABLE pending_restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    cuisine_type VARCHAR(100),
    price_range VARCHAR(20),
    phone_number VARCHAR(20),
    website TEXT,
    suggested_by INT REFERENCES users(id) ON DELETE CASCADE,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by INT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Criar tabela de posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
    pending_restaurant_id INT REFERENCES pending_restaurants(id) ON DELETE CASCADE,
    title VARCHAR(150),
    content TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    is_suggestion BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Criar tabela de fotos dos posts
CREATE TABLE post_photos (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- 9. Criar tabela de comentários
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Criar tabela de likes
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 11. Criar tabela de favoritos
CREATE TABLE favorites (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, restaurant_id)
);

-- 12. Criar tabela de seguidores
CREATE TABLE follows (
    follower_id INT REFERENCES users(id) ON DELETE CASCADE,
    following_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- 13. Criar tabela de notificações
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
    comment_id INTEGER REFERENCES comments(id) ON DELETE SET NULL,
    pending_restaurant_id INTEGER REFERENCES pending_restaurants(id) ON DELETE SET NULL,
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Criar índices para melhor performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_restaurant_id ON posts(restaurant_id);
CREATE INDEX idx_posts_pending_restaurant_id ON posts(pending_restaurant_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_is_suggestion ON posts(is_suggestion);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_pending_restaurants_status ON pending_restaurants(status);
CREATE INDEX idx_pending_restaurants_suggested_by ON pending_restaurants(suggested_by);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- 15. Criar índice espacial para PostGIS
CREATE INDEX idx_restaurants_location ON restaurants USING GIST (location);
CREATE INDEX idx_pending_restaurants_location ON pending_restaurants USING GIST (location);

-- 16. Inserir dados de exemplo (opcional)
INSERT INTO users (name, username, email, password_hash, bio, role) VALUES
('João Silva', 'joaosilva', 'joao@email.com', '$2a$10$example.hash.here', 'Amante da gastronomia', 'user'),
('Maria Santos', 'mariasantos', 'maria@email.com', '$2a$10$example.hash.here', 'Foodie de carteirinha', 'user'),
('Pedro Costa', 'pedrocosta', 'pedro@email.com', '$2a$10$example.hash.here', 'Chef amador', 'user'),
('Admin BeastFood', 'admin', 'admin@beastfood.com', '$2a$10$example.hash.here', 'Administrador do sistema', 'admin');

INSERT INTO restaurants (name, description, address, location, created_by, status, approved_by, approved_at) VALUES
('Restaurante Italiano Bella Vista', 'Autêntica culinária italiana', 'Rua das Flores, 123', ST_SetSRID(ST_MakePoint(-23.5505, -46.6333), 4326), 1, 'active', 4, NOW()),
('Churrascaria Gaúcha', 'Melhor churrasco da cidade', 'Av. Paulista, 456', ST_SetSRID(ST_MakePoint(-23.5631, -46.6544), 4326), 2, 'active', 4, NOW()),
('Sushi Bar Japonês', 'Sushi fresco e tradicional', 'Rua Augusta, 789', ST_SetSRID(ST_MakePoint(-23.5489, -46.6388), 4326), 3, 'active', 4, NOW());

-- 17. Verificar se tudo foi criado corretamente
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
