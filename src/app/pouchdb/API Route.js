// pages/api/saveData.js
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const data = req.body;

  // Configuración de la conexión usando variables de entorno de Clever Cloud
  const dbConfig = {
    host: process.env.MYSQL_ADDON_HOST,
    port: process.env.MYSQL_ADDON_PORT,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
  };

  try {
    const connection = await mysql.createConnection(dbConfig);

    for (const item of data) {
      await connection.execute(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [item.name, item.email]
      );
    }

    await connection.end();

    res.status(200).json({ message: 'Datos guardados exitosamente' });
  } catch (error) {
    console.error('Error al guardar en la base de datos:', error);
    res.status(500).json({ message: 'Error al guardar los datos' });
  }
}