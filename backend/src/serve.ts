import app from './app';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`API disponível em: http://localhost:${PORT}`);
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();
