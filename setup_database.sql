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
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Criar tabela de restaurantes
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Criar tabela de posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
    title VARCHAR(150),
    content TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Criar tabela de fotos dos posts
CREATE TABLE post_photos (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- 8. Criar tabela de comentários
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Criar tabela de likes
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 10. Criar tabela de favoritos
CREATE TABLE favorites (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, restaurant_id)
);

-- 11. Criar tabela de seguidores
CREATE TABLE follows (
    follower_id INT REFERENCES users(id) ON DELETE CASCADE,
    following_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- 12. Criar índices para melhor performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_restaurant_id ON posts(restaurant_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- 13. Criar índice espacial para PostGIS
CREATE INDEX idx_restaurants_location ON restaurants USING GIST (location);

-- 14. Inserir dados de exemplo (opcional)
INSERT INTO users (name, username, email, password_hash, bio) VALUES
('João Silva', 'joaosilva', 'joao@email.com', '$2a$10$example.hash.here', 'Amante da gastronomia'),
('Maria Santos', 'mariasantos', 'maria@email.com', '$2a$10$example.hash.here', 'Foodie de carteirinha'),
('Pedro Costa', 'pedrocosta', 'pedro@email.com', '$2a$10$example.hash.here', 'Chef amador');

INSERT INTO restaurants (name, description, address, location, created_by) VALUES
('Restaurante Italiano Bella Vista', 'Autêntica culinária italiana', 'Rua das Flores, 123', ST_SetSRID(ST_MakePoint(-23.5505, -46.6333), 4326), 1),
('Churrascaria Gaúcha', 'Melhor churrasco da cidade', 'Av. Paulista, 456', ST_SetSRID(ST_MakePoint(-23.5631, -46.6544), 4326), 2),
('Sushi Bar Japonês', 'Sushi fresco e tradicional', 'Rua Augusta, 789', ST_SetSRID(ST_MakePoint(-23.5489, -46.6388), 4326), 3);

-- 15. Verificar se tudo foi criado corretamente
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
