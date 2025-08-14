import React from 'react';
import RestaurantCard from './RestaurantCard';

// Exemplo de uso do componente RestaurantCard
const RestaurantCardExample = () => {
  // Dados de exemplo do restaurante
  const restaurantData = {
    name: "RESTAURANTE EXEMPLO",
    rating: 4.7,
    reviewCount: "1.2k",
    cuisine: "Internacional",
    address: "Rua Exemplo, 123 - Centro, Cidade - SP",
    phone: "(11) 99999-9999",
    description: "Restaurante de exemplo com pratos especiais e ambiente acolhedor. Oferecemos uma experiência gastronômica única com ingredientes frescos e preparo artesanal.",
    serviceOptions: ["Delivery", "Reservas", "Eventos corporativos"],
    highlights: ["Chef renomado", "Vinhos selecionados", "Ambiente romântico"],
    status: "Aberto",
    nextOpen: "Fecha às 22:00",
    photos: [
      "https://via.placeholder.com/400x300/3b82f6/ffffff?text=Restaurante+Exemplo"
    ],
    isFavorite: false
  };

  // Função para lidar com mudanças de favorito
  const handleFavoriteToggle = (isFavorite) => {
    console.log('Favorito alterado:', isFavorite);
    // Aqui você pode implementar a lógica para salvar no banco de dados
  };

  // Função para lidar com edição
  const handleEdit = () => {
    console.log('Editar restaurante:', restaurantData.name);
    // Aqui você pode implementar a lógica para abrir o formulário de edição
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#1e3a8a', marginBottom: '2rem' }}>
        🍽️ Exemplo de Uso do RestaurantCard
      </h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
        <h3>📋 Como Usar:</h3>
        <pre style={{ background: '#1f2937', color: '#f9fafb', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`import RestaurantCard from './components/RestaurantCard';

const MyComponent = () => {
  const restaurant = {
    name: "Nome do Restaurante",
    rating: 4.5,
    reviewCount: "1.0k",
    // ... outras propriedades
  };

  return <RestaurantCard restaurant={restaurant} />;
};`}
        </pre>
      </div>

      {/* Exemplo do componente em ação */}
      <RestaurantCard 
        restaurant={restaurantData}
        onToggleFavorite={handleFavoriteToggle}
        onEdit={handleEdit}
      />

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
        <h3>✨ Características do Componente:</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Layout Horizontal:</strong> Organização em 3 seções lado a lado</li>
          <li><strong>Responsivo:</strong> Adapta-se automaticamente para mobile e tablet</li>
          <li><strong>Cores Simbólicas:</strong> Esquema de cores com significados psicológicos</li>
          <li><strong>Interativo:</strong> Hover effects e animações suaves</li>
          <li><strong>Customizável:</strong> Fácil personalização via CSS</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
        <h3>🔧 Propriedades Disponíveis:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <h4>Informações Básicas:</h4>
            <ul style={{ fontSize: '0.9rem' }}>
              <li><code>name</code> - Nome do restaurante</li>
              <li><code>rating</code> - Avaliação (0-5)</li>
              <li><code>reviewCount</code> - Número de avaliações</li>
              <li><code>cuisine</code> - Tipo de culinária</li>
            </ul>
          </div>
          <div>
            <h4>Contato e Localização:</h4>
            <ul style={{ fontSize: '0.9rem' }}>
              <li><code>address</code> - Endereço completo</li>
              <li><code>phone</code> - Número de telefone</li>
              <li><code>description</code> - Descrição detalhada</li>
            </ul>
          </div>
          <div>
            <h4>Funcionalidades:</h4>
            <ul style={{ fontSize: '0.9rem' }}>
              <li><code>serviceOptions</code> - Array de opções de serviço</li>
              <li><code>highlights</code> - Array de destaques</li>
              <li><code>status</code> - Status de funcionamento</li>
              <li><code>photos</code> - Array de URLs de fotos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCardExample;
