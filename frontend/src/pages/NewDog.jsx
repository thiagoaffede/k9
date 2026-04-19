import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const NewDog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '', raza: '', sexo: 'macho', color: '', nro_chip: '',
    estado: 'entrenamiento', origen: '', observaciones: ''
  });
  const [foto, setFoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Crear perro (JSON)
      const res = await api.post('/dogs', formData);
      const dogId = res.data.id;

      // 2. Subir foto si existe (FormData)
      if (foto) {
        const uploadData = new FormData();
        uploadData.append('photo', foto);
        await api.post(`/dogs/${dogId}/photo`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/'); // Volver al dashboard
    } catch (err) {
      console.error(err);
      alert('Error registrando perro');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Registrar Nuevo Perro</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nombre</label>
            <input required type="text" className="mt-1 w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nro Chip</label>
            <input type="text" className="mt-1 w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.nro_chip} onChange={e => setFormData({ ...formData, nro_chip: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Raza</label>
            <input type="text" className="mt-1 w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.raza} onChange={e => setFormData({ ...formData, raza: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Sexo</label>
            <select className="mt-1 w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.sexo} onChange={e => setFormData({ ...formData, sexo: e.target.value })}>
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Estado Inicial</label>
            <select className="mt-1 w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value })}>
              <option value="entrenamiento">Entrenamiento</option>
              <option value="activo">Servicio Activo</option>
              <option value="retirado">Retirado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Foto</label>
            <input type="file" accept="image/*" className="mt-1 w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={e => setFoto(e.target.files[0])} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Observaciones</label>
          <textarea rows="3" className="mt-1 w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })}></textarea>
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/')} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancelar</button>
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Registrar Perro</button>
        </div>
      </form>
    </div>
  );
};

export default NewDog;
