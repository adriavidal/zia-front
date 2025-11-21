import React, { useState, useRef } from 'react';
import {
  Mic,
  Users,
  MessageSquare,
  Activity,
  Save,
  Play,
  Trash2,
  Search,
  Settings,
  Clock,
  PhoneIncoming,
  ArrowRightCircle,
  Upload,
} from 'lucide-react';

// --- Datos Simulados nuevos ---

const MOCK_VOICES = [
  {
    id: 'aura-2-alvaro-es',
    name: 'Alvaro',
    gender: 'male',
    tone: 'Profesional y Cálida',
    text: 'Hola soy Alvaro en que puedo ayudarte.'
  },
  {
    id: 'aura-2-carina-es',
    name: 'Carina',
    gender: 'female',
    tone: 'Seria y Directa',
    text: 'Hola soy Carina en que puedo ayudarte.'
  },
  {
    id: 'aura-2-diana-es',
    name: 'diana',
    gender: 'female',
    tone: 'Elegante y Sofisticada',
    text: 'Hola soy Diana en que puedo ayudarte.'
  },
  {
    id: 'aura-2-celeste-es',
    name: 'Celeste',
    gender: 'female',
    tone: 'Dulce y Amigable',
    text: 'Hola soy Celeste en que puedo ayudarte.'
  },
  {
    id: 'aura-2-nestor-es',
    name: 'nestor',
    gender: 'male',
    tone: 'Autoritaria y Fuerte',
    text: 'Hola soy Zeus en que puedo ayudarte.'
  },
];

const INITIAL_PROFILES = [
  {
    id: 1,
    phoneNumber: '+34 91 123 45 67',
    label: 'Sede Central - Madrid',
    voiceId: 'aura-2-luna-es',
    welcomeMessage:
      'Hola, bienvenido a Zerovoz Soy Zia, su asistente virtual. Por favor, dígame brevemente el motivo de su llamada o el nombre de la persona con la que desea contactar.',
    contacts: [
      { id: 101, name: 'Ana García', dept: 'Ventas', ext: '1001' },
      { id: 102, name: 'Carlos Ruiz', dept: 'Soporte', ext: '1002' },
      { id: 103, name: 'Dirección General', dept: 'Gerencia', ext: '2001' },
    ],
  },
  {
    id: 2,
    phoneNumber: '+34 93 987 65 43',
    label: 'Oficina Comercial - Barcelona',
    voiceId: 'aura-2-zeus-es',
    welcomeMessage:
      'Gracias por llamar a la delegación de Barcelona. Soy su operador virtual. ¿En qué puedo ayudarle hoy?',
    contacts: [
      { id: 201, name: 'Jordi Puig', dept: 'Comercial', ext: '3005' },
      { id: 202, name: 'Marta Soler', dept: 'Administración', ext: '3006' },
    ],
  },
];

const MOCK_LOGS = [
  {
    id: 1,
    date: '2023-10-27 10:15',
    origin: '+34 600 111 222',
    destination: '+34 91 123 45 67',
    duration: '1m 20s',
    summary: 'Cliente preguntando por facturación.',
    action: 'Transferido',
    target: 'Marta Soler (3006)',
  },
  {
    id: 2,
    date: '2023-10-27 10:45',
    origin: '+34 611 333 444',
    destination: '+34 91 123 45 67',
    duration: '0m 45s',
    summary: 'Solicitud de horario de apertura.',
    action: 'Resuelto por Bot',
    target: 'N/A',
  },
  {
    id: 3,
    date: '2023-10-27 11:00',
    origin: '+34 622 555 666',
    destination: '+34 93 987 65 43',
    duration: '2m 10s',
    summary: 'Incidencia técnica urgente.',
    action: 'Transferido',
    target: 'Carlos Ruiz (1002)',
  },
  {
    id: 4,
    date: '2023-10-27 11:30',
    origin: '+34 633 777 888',
    destination: '+34 91 123 45 67',
    duration: '0m 30s',
    summary: 'Llamada cortada / Silencio.',
    action: 'Finalizada',
    target: 'N/A',
  },
];

// --- Componentes ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <div
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors cursor-pointer ${
      active
        ? 'bg-indigo-500 text-white'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={18} />
    <span className="text-sm hidden lg:block">{label}</span>
  </div>
);

const ConfigPanel = ({
  profiles,
  setProfiles,
  activeProfileId,
  setActiveProfileId,
}: any) => {
  const activeProfile =
    profiles.find((p: any) => p.id === activeProfileId) || profiles[0];
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceTexts, setVoiceTexts] = useState(
    MOCK_VOICES.reduce((acc, voice) => ({ ...acc, [voice.id]: voice.text }), {})
  );
  const [genderFilter, setGenderFilter] = useState('all');
  const [selectedVoiceId, setSelectedVoiceId] = useState(activeProfile.voiceId);
  const [voices, setVoices] = useState(MOCK_VOICES);

  // Update voice texts when voices change
  React.useEffect(() => {
    setVoiceTexts(prev => {
      const newTexts = { ...prev };
      voices.forEach(voice => {
        if (!newTexts[voice.id]) {
          newTexts[voice.id] = voice.text;
        }
      });
      return newTexts;
    });
  }, [voices]);

  // Fetch voices from Deepgram API
  const fetchVoices = async () => {
    try {
      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
      const response = await fetch('https://api.deepgram.com/v1/models?model_family=tts', {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const ttsVoices = data.models.map((model: any) => ({
          id: model.name,
          name: model.name,
          gender: model.name.includes('luna') || model.name.includes('stella') || model.name.includes('hera') || model.name.includes('diana') || model.name.includes('asteria') ? 'female' : 'male',
          tone: 'AI Voice',
          text: `Hola soy ${model.name} en que puedo ayudarte.`
        }));
        setVoices(ttsVoices);
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
    }
  };

  // Fetch voices on component mount
  React.useEffect(() => {
    fetchVoices();
  }, []);

  // Estado local para el formulario de nuevo contacto
  const [newContact, setNewContact] = useState({ name: '', dept: '', ext: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = (field: any, value: any) => {
    const updatedProfiles = profiles.map((p: any) =>
      p.id === activeProfileId ? { ...p, [field]: value } : p
    );
    setProfiles(updatedProfiles);
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.ext) return;
    const updatedContacts = [
      ...activeProfile.contacts,
      { ...newContact, id: Date.now() },
    ];
    updateProfile('contacts', updatedContacts);
    setNewContact({ name: '', dept: '', ext: '' });
  };

  const handleDeleteContact = (contactId: any) => {
    const updatedContacts = activeProfile.contacts.filter(
      (c: any) => c.id !== contactId
    );
    updateProfile('contacts', updatedContacts);
  };

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Parse CSV simple (asumiendo formato: Nombre, Departamento, Extensión)
      // Se salta la primera línea si parece ser encabezado
      const lines = text.split('\n');
      const newContacts = [];

      // Empezamos desde 0, pero si detectamos cabecera podríamos empezar desde 1
      // Para este mock, asumiremos que si la línea 1 tiene "nombre" es cabecera
      const startIndex = lines[0].toLowerCase().includes('nombre') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',');
        if (parts.length >= 3) {
          newContacts.push({
            id: Date.now() + Math.random(), // ID único simple
            name: parts[0].trim(),
            dept: parts[1].trim(),
            ext: parts[2].trim(),
          });
        }
      }

      if (newContacts.length > 0) {
        const updatedContacts = [...activeProfile.contacts, ...newContacts];
        updateProfile('contacts', updatedContacts);
        alert(`Se importaron ${newContacts.length} contactos correctamente.`);
      } else {
        alert(
          'No se encontraron contactos válidos o el formato es incorrecto (Nombre, Dept, Ext).'
        );
      }
    };

    reader.readAsText(file);
    // Limpiar input para permitir subir el mismo archivo de nuevo si se desea
    event.target.value = '';
  };

  const playVoicePreview = async (text: string, voiceId: string) => {
    try {
      setIsPlaying(true);
      
      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
      console.log('API Key exists:', !!apiKey);
      console.log('API Key length:', apiKey?.length || 0);
      
      const headers = {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      };
      
      console.log('Request headers:', headers);
      console.log('Request URL:', `https://api.deepgram.com/v1/speak?model=${voiceId}&encoding=linear16&sample_rate=24000`);
      
      // Demo usando Deepgram Aura API
      const response = await fetch(`https://api.deepgram.com/v1/speak?model=${voiceId}&encoding=linear16&sample_rate=24000`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: text,
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsPlaying(false);
      // Fallback al navegador
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        alert('Error al reproducir audio. Configure su API key de Deepgram.');
      }
    }
  };

  return (
    <div className="flex h-full">
      {/* Sub-sidebar para seleccionar número */}
      <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-2 h-full overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Líneas Activas
        </h3>
        {profiles.map((profile: any) => (
          <button
            key={profile.id}
            onClick={() => setActiveProfileId(profile.id)}
            className={`text-left p-3 rounded-lg border transition-all ${
              activeProfileId === profile.id
                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-bold text-slate-700">
              {profile.phoneNumber}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {profile.label}
            </div>
          </button>
        ))}

      </div>

      {/* Área Principal de Configuración */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Cabecera */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Configuración de Asistente
              </h2>
              <p className="text-slate-500">
                Editando comportamiento para{' '}
                <span className="font-mono font-medium text-indigo-600">
                  {activeProfile.phoneNumber}
                </span>
              </p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
              <Save size={18} /> Guardar Cambios
            </button>
          </div>

          {/* Selección de Voz */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Mic size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Perfil de Voz Bot
              </h3>
            </div>

            <div className="space-y-4">
              {/* Gender Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setGenderFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    genderFilter === 'all'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setGenderFilter('female')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    genderFilter === 'female'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Femeninas
                </button>
                <button
                  onClick={() => setGenderFilter('male')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    genderFilter === 'male'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Masculinas
                </button>
              </div>

              {/* Voice Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seleccionar Voz
                </label>
                <select
                  value={activeProfile.voiceId}
                  onChange={(e) => {
                    updateProfile('voiceId', e.target.value);
                    setSelectedVoiceId(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
                >
                  {voices
                    .filter(voice => genderFilter === 'all' || voice.gender === genderFilter)
                    .map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} - {voice.tone}
                      </option>
                    ))}
                </select>
              </div>

              {/* Selected Voice Preview */}
              {(() => {
                const selectedVoice = voices.find(v => v.id === activeProfile.voiceId);
                if (!selectedVoice) return null;
                
                return (
                  <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            selectedVoice.gender === 'female'
                              ? 'bg-pink-400'
                              : 'bg-blue-400'
                          }`}
                        ></span>
                        <div>
                          <div className="font-bold text-slate-700">{selectedVoice.name}</div>
                          <div className="text-xs text-slate-500">{selectedVoice.tone}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          playVoicePreview(
                            voiceTexts[selectedVoice.id] || selectedVoice.text,
                            selectedVoice.id
                          );
                        }}
                        className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-indigo-600 border border-slate-200"
                      >
                        {isPlaying ? (
                          <Activity
                            size={16}
                            className="animate-pulse text-indigo-600"
                          />
                        ) : (
                          <Play size={16} />
                        )}
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Mensaje de prueba
                      </label>
                      <input
                        type="text"
                        value={voiceTexts[selectedVoice.id] || selectedVoice.text}
                        onChange={(e) => {
                          setVoiceTexts(prev => ({
                            ...prev,
                            [selectedVoice.id]: e.target.value
                          }));
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
                        placeholder="Texto para probar la voz..."
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Mensaje de Bienvenida */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Mensaje de Bienvenida
              </h3>
            </div>
            <textarea
              className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-slate-600 leading-relaxed"
              value={activeProfile.welcomeMessage}
              onChange={(e) => updateProfile('welcomeMessage', e.target.value)}
              placeholder="Escribe aquí lo que dirá el bot al descolgar..."
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() =>
                  playVoicePreview(
                    activeProfile.welcomeMessage,
                    activeProfile.voiceId
                  )
                }
                className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
              >
                <Play size={14} /> Probar audio completo
              </button>
            </div>
          </div>

          {/* Bloque de Contactos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <Users size={20} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Directorio  Contactos
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                  {activeProfile.contacts.length} destinos
                </span>
                <div className="h-4 w-px bg-slate-300"></div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                >
                  <Upload size={14} /> Importar CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Departamento</th>
                    <th className="px-4 py-3">Extensión </th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProfile.contacts.map((contact: any) => (
                    <tr
                      key={contact.id}
                      className="bg-white border-b hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {contact.name.charAt(0)}
                        </div>
                        {contact.name}
                      </td>
                      <td className="px-4 py-3">{contact.dept}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {contact.ext}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Añadir contacto inline */}
            <div className="flex gap-2 items-end bg-slate-50 p-4 rounded-lg border border-slate-200 border-dashed">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  value={newContact.dept}
                  onChange={(e) =>
                    setNewContact({ ...newContact, dept: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ej. Ventas"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Extensión
                </label>
                <input
                  type="text"
                  value={newContact.ext}
                  onChange={(e) =>
                    setNewContact({ ...newContact, ext: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 font-mono"
                  placeholder="1001"
                />
              </div>
              <button
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.ext}
                className="px-4 py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogsPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = MOCK_LOGS.filter(
    (log) =>
      log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.origin.includes(searchTerm)
  );

  return (
    <div className="flex-1 p-8 bg-slate-50 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Registro de Llamadas
            </h2>
            <p className="text-slate-500">
              Historial de interacciones atendidas por Zia
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nº o resumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
            />
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Fecha / Hora</th>
                <th className="px-6 py-4">Origen & Destino</th>
                <th className="px-6 py-4">Resumen IA</th>
                <th className="px-6 py-4">Resultado</th>
                <th className="px-6 py-4">Duración</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="bg-white border-b hover:bg-slate-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900 flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" /> {log.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-slate-900 font-medium">
                        <PhoneIncoming size={14} className="text-emerald-500" />{' '}
                        {log.origin}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <ArrowRightCircle size={12} /> {log.destination}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className="truncate max-w-xs text-slate-600"
                      title={log.summary}
                    >
                      "{log.summary}"
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        log.action === 'Transferido'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : log.action === 'Finalizada'
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {log.action}
                      {log.target !== 'N/A' && (
                        <span className="ml-1 opacity-75">➔ {log.target}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {log.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron llamadas con ese criterio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('config'); // 'config' | 'logs'
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState(1);

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      {/* Sidebar Global */}
      <div className="w-16 lg:w-56 bg-slate-950 flex-shrink-0 flex flex-col text-white">
        <div className="h-14 flex items-center justify-center lg:justify-start lg:px-4">
          <div className="w-7 h-7 bg-indigo-500 rounded flex items-center justify-center mr-0 lg:mr-2">
            <span className="font-bold text-sm">Z</span>
          </div>
          <span className="font-semibold text-lg hidden lg:block">
            Zia
          </span>
        </div>

        <div className="flex-1 py-4 px-2 space-y-1">
          <SidebarItem
            icon={Settings}
            label="Configuración"
            active={view === 'config'}
            onClick={() => setView('config')}
          />
          <SidebarItem
            icon={Activity}
            label="Llamadas"
            active={view === 'logs'}
            onClick={() => setView('logs')}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-hidden">
        {view === 'config' ? (
          <ConfigPanel
            profiles={profiles}
            setProfiles={setProfiles}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
          />
        ) : (
          <LogsPanel />
        )}
      </div>
    </div>
  );
};

export default App;
