import React from 'react';
import { addDocument } from './dbconfig'; // Importa la función desde dbUtils

const AddDocumentButton: React.FC = () => {
  return (
    <button onClick={addDocument}>
      Añadir Documento a PouchDB
    </button>
  );
};

export default AddDocumentButton;