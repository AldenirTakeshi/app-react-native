import bcrypt from 'bcrypt';
import { connectDatabase } from '../config/database';
import { User } from '../models';

const seedUsers = async () => {
  try {
    // Conectar ao banco
    await connectDatabase();

    // Limpar usuários existentes (opcional)
    await User.deleteMany({});
    console.log('🧹 Usuários existentes removidos');

    // Criar usuários de teste
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

    // Inserir usuários no banco
    const createdUsers = await User.insertMany(users);

    console.log('✅ Usuários de teste criados:');
    createdUsers.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - Senha: 123456`);
    });

    console.log('\n🔑 Credenciais para teste:');
    console.log('   Email: joao@teste.com | Senha: 123456');
    console.log('   Email: maria@teste.com | Senha: 123456');
    console.log('   Email: pedro@teste.com | Senha: 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
    process.exit(1);
  }
};

seedUsers();
