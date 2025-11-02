import dotenv from 'dotenv';
import path from 'path';

const cwdEnvPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: cwdEnvPath });

if (!process.env.MONGODB_URI) {
  const dirnameEnvPath = path.resolve(__dirname, '../../.env');
  dotenv.config({ path: dirnameEnvPath });
}

import { connectDatabase } from '../config/database';
import { Category, Location } from '../models';

const seedData = async () => {
  try {
    await connectDatabase();

    const existingCategories = await Category.countDocuments();
    if (existingCategories === 0) {
      const categories = [
        {
          name: 'Música',
          description: 'Eventos musicais e shows',
          color: '#FF6B6B',
          icon: 'musical-notes',
        },
        {
          name: 'Esportes',
          description: 'Eventos esportivos',
          color: '#4ECDC4',
          icon: 'football',
        },
        {
          name: 'Arte e Cultura',
          description: 'Exposições e eventos culturais',
          color: '#95E1D3',
          icon: 'color-palette',
        },
        {
          name: 'Gastronomia',
          description: 'Festivais gastronômicos e eventos culinários',
          color: '#F38181',
          icon: 'restaurant',
        },
        {
          name: 'Tecnologia',
          description: 'Conferências e eventos de tecnologia',
          color: '#AA96DA',
          icon: 'laptop',
        },
        {
          name: 'Negócios',
          description: 'Conferências e networking',
          color: '#FCBAD3',
          icon: 'briefcase',
        },
      ];

      await Category.insertMany(categories);
      console.log(`✅ ${categories.length} categorias criadas`);
    } else {
      console.log(`ℹ${existingCategories} categorias`);
    }

    const existingLocations = await Location.countDocuments();
    if (existingLocations === 0) {
      const locations = [
        {
          name: 'Centro de Convenções',
          address: 'Av. Principal, 123',
          latitude: -23.5505,
          longitude: -46.6333,
          city: 'São Paulo',
          state: 'SP',
          country: 'Brasil',
          zipCode: '01310-100',
        },
        {
          name: 'Parque de Exposições',
          address: 'Rodovia, km 10',
          latitude: -23.5489,
          longitude: -46.6388,
          city: 'São Paulo',
          state: 'SP',
          country: 'Brasil',
        },
        {
          name: 'Arena Esportiva',
          address: 'Av. Esportiva, 456',
          latitude: -23.5515,
          longitude: -46.6338,
          city: 'São Paulo',
          state: 'SP',
          country: 'Brasil',
          zipCode: '01310-200',
        },
      ];

      await Location.insertMany(locations);
      console.log(`✅ ${locations.length} locais criados`);
    } else {
      console.log(`ℹ️  Já existem ${existingLocations} locais`);
    }

    console.log('\n✅ Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar dados iniciais:', error);
    process.exit(1);
  }
};

seedData();
