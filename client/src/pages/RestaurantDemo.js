import React, { useState } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import './RestaurantDemo.css';

const RestaurantDemo = () => {
  const [currentRestaurant, setCurrentRestaurant] = useState(0);
  
  const restaurants = [
    {
      name: "BAR DA CARETA",
      rating: 4.4,
      reviewCount: "2.4k",
      cuisine: "Brasileira",
      address: "Av. Maj. Nicácio, 2073 - Cidade Nova, Franca - SP, 14401-135",
      phone: "(16) 99341-7871",
      description: "Carnes assadas na brasa, além de saladas, sushis e queijos, em churrascaria com toque rústico e playground. Ambiente familiar com espaço para crianças e opções para todos os gostos. Nossa especialidade são as carnes grelhadas na brasa, preparadas com técnicas tradicionais brasileiras.",
      serviceOptions: ["Buffet à vontade", "Delivery", "Reservas"],
      highlights: ["Ótimos coquetéis", "Opções vegetarianas", "Ambiente familiar"],
      status: "Fechado",
      nextOpen: "Abre às 11:00",
      photos: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop&crop=center"
      ],
      isFavorite: false
    },
    {
      name: "RESTAURANTE SABOR & ARTE",
      rating: 4.8,
      reviewCount: "1.8k",
      cuisine: "Italiana",
      address: "Rua das Flores, 456 - Centro, Franca - SP, 14400-000",
      phone: "(16) 98888-7777",
      description: "Autêntica culinária italiana com massas frescas, pizzas artesanais e ambiente romântico ideal para casais. Nossos pratos são preparados com ingredientes importados da Itália e técnicas tradicionais passadas de geração em geração. O chef italiano Mario Rossi traz toda a autenticidade da culinária mediterrânea para sua mesa.",
      serviceOptions: ["Jantar romântico", "Delivery premium", "Reservas online"],
      highlights: ["Vinhos importados", "Chef italiano", "Música ao vivo"],
      status: "Aberto",
      nextOpen: "Fecha às 23:00",
      photos: [
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop&crop=center"
      ],
      isFavorite: true
    },
    {
      name: "CHURRASCARIA ESTRELA",
      rating: 4.6,
      reviewCount: "3.2k",
      cuisine: "Churrascaria",
      address: "Av. Presidente Vargas, 789 - Jardim América, Franca - SP, 14401-000",
      phone: "(16) 97777-6666",
      description: "Tradicional churrascaria brasileira com carnes nobres, buffet completo e ambiente familiar com playground. Nossa casa oferece o melhor da gastronomia brasileira, com carnes premium selecionadas e preparadas na brasa por churrasqueiros experientes. O buffet inclui saladas frescas, pratos quentes e sobremesas tradicionais.",
      serviceOptions: ["Rodízio completo", "Buffet à vontade", "Estacionamento"],
      highlights: ["Carnes premium", "Playground infantil", "Show de samba"],
      status: "Fechado",
      nextOpen: "Abre às 18:00",
      photos: [
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center"
      ],
      isFavorite: false
    }
  ];

  const handleRestaurantChange = (direction) => {
    if (direction === 'next') {
      setCurrentRestaurant((prev) => (prev + 1) % restaurants.length);
    } else {
      setCurrentRestaurant((prev) => (prev - 1 + restaurants.length) % restaurants.length);
    }
  };

  const toggleFavorite = () => {
    const updatedRestaurants = [...restaurants];
    updatedRestaurants[currentRestaurant].isFavorite = !updatedRestaurants[currentRestaurant].isFavorite;
    // Em uma aplicação real, você faria uma chamada para a API aqui
  };

  return (
    <div className="restaurant-demo">
      <div className="demo-header">
        <h1>🍽️ Demonstração do Sistema de Restaurantes</h1>
        <p>Design inspirado no BAR DA CARETA com cores simbólicas e layout horizontal compacto</p>
        
        <div className="demo-controls">
          <button 
            className="btn-nav"
            onClick={() => handleRestaurantChange('prev')}
          >
            ← Anterior
          </button>
          
          <span className="restaurant-counter">
            {currentRestaurant + 1} de {restaurants.length}
          </span>
          
          <button 
            className="btn-nav"
            onClick={() => handleRestaurantChange('next')}
          >
            Próximo →
          </button>
        </div>
      </div>

      <div className="demo-content">
        <RestaurantCard 
          restaurant={restaurants[currentRestaurant]}
          onToggleFavorite={toggleFavorite}
        />
      </div>

      <div className="demo-info">
        <div className="layout-info">
          <h3>🔄 Layout Horizontal Compacto Implementado</h3>
          <p>
            <strong>Nova estrutura compacta:</strong> Fotos (280px) | Descrição (flexível) | Detalhes (220px) | Status (220px)
          </p>
          <p>
            Card reduzido para melhor aproveitamento do espaço + Modal de fotos interativo com imagens reais
          </p>
        </div>

        <h2>🎨 Esquema de Cores Simbólicas</h2>
        <div className="color-scheme">
          <div className="color-item">
            <div className="color-preview blue"></div>
            <span><strong>Azul Profundo:</strong> Confiança e Profissionalismo</span>
          </div>
          <div className="color-item">
            <div className="color-preview gold"></div>
            <span><strong>Dourado:</strong> Qualidade e Excelência</span>
          </div>
          <div className="color-item">
            <div className="color-preview green"></div>
            <span><strong>Verde Esmeralda:</strong> Crescimento e Positividade</span>
          </div>
          <div className="color-item">
            <div className="color-preview purple"></div>
            <span><strong>Roxo:</strong> Criatividade e Sofisticação</span>
          </div>
        </div>

        <div className="features">
          <h3>✨ Características do Design</h3>
          <ul>
            <li>Layout horizontal compacto com 4 seções organizadas</li>
            <li>Seções: Fotos (280px) | Descrição (flexível) | Detalhes (220px) | Status (220px)</li>
            <li>Card reduzido para melhor aproveitamento do espaço</li>
            <li><strong>Modal de fotos interativo</strong> com navegação e controles</li>
            <li><strong>Imagens reais de alta qualidade</strong> para demonstração</li>
            <li>Animações suaves e transições elegantes</li>
            <li>Gradientes e sombras para profundidade</li>
            <li>Ícones emoji para melhor usabilidade</li>
            <li>Hover effects interativos</li>
            <li>Design mobile-first com breakpoints responsivos</li>
          </ul>
        </div>

        <div className="features">
          <h3>📸 Funcionalidades do Modal de Fotos</h3>
          <ul>
            <li><strong>Clique na foto:</strong> Abre o modal para visualização ampliada</li>
            <li><strong>Navegação:</strong> Botões de anterior/próximo para múltiplas fotos</li>
            <li><strong>Controles de teclado:</strong> Setas para navegar, ESC para fechar</li>
            <li><strong>Contador:</strong> Mostra posição atual (ex: "2 de 3")</li>
            <li><strong>Responsivo:</strong> Adapta-se a diferentes tamanhos de tela</li>
            <li><strong>Backdrop blur:</strong> Efeito visual elegante ao fundo</li>
            <li><strong>Informações:</strong> Nome do restaurante e detalhes da foto</li>
            <li><strong>Imagens reais:</strong> Fotos de alta qualidade para demonstração</li>
          </ul>
        </div>

        <div className="features">
          <h3>🖼️ Imagens Implementadas</h3>
          <ul>
            <li><strong>BAR DA CARETA:</strong> Ambiente de churrascaria, pratos tradicionais, coquetéis</li>
            <li><strong>SABOR & ARTE:</strong> Pizzas artesanais, massas frescas, vinhos importados</li>
            <li><strong>CHURRASCARIA ESTRELA:</strong> Carnes premium, buffet completo, ambiente familiar</li>
            <li><strong>Qualidade:</strong> Imagens de 800x600px otimizadas para web</li>
            <li><strong>Fonte:</strong> Unsplash - Imagens gratuitas de alta qualidade</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDemo;
