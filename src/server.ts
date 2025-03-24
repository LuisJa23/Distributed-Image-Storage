import app from './app';

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔍 API de visión disponible en http://localhost:${PORT}/api/vision`);
});