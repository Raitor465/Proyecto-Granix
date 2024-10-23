// pages/api/saveData.js
import { supabase } from '../../utils/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const data = req.body;

  try {
    const { data: insertedData, error } = await supabase
      .from('users')
      .insert(data)
    
    if (error) throw error;

    res.status(200).json({ message: 'Datos guardados exitosamente', data: insertedData });
  } catch (error) {
    console.error('Error al guardar en la base de datos:', error);
    res.status(500).json({ message: 'Error al guardar los datos' });
  }
}