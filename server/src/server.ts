// src/server.ts
import 'dotenv/config'; // 👈 Adicione esta linha no topo de tudo!
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

