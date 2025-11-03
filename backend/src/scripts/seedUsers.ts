import dotenv from 'dotenv';
import path from 'path';

const cwdEnvPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: cwdEnvPath });

if (!process.env.MONGODB_URI) {
  const dirnameEnvPath = path.resolve(__dirname, '../../.env');
  dotenv.config({ path: dirnameEnvPath });
}

import bcrypt from 'bcrypt';
import { connectDatabase } from '../config/database';
import { User } from '../models';

const seedUsers = async () => {
  try {
    await connectDatabase();

    await User.deleteMany({});

    const users = [
      {
        name: 'João Silva',
        email: 'joao@teste.com',
        password: await bcrypt.hash('123456', 10),
      },
      {
        name: 'Maria Santos',
        email: 'maria@teste.com',
        password: await bcrypt.hash('123456', 10),
      },
      {
        name: 'Pedro Costa',
        email: 'pedro@teste.com',
        password: await bcrypt.hash('123456', 10),
      },
    ];

    const createdUsers = await User.insertMany(users);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
    process.exit(1);
  }
};

seedUsers();
