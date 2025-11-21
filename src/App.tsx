import { useState, useRef } from 'react';
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

// --- Datos Simulados ---

const MOCK_VOICES = [
  {
    id: 'v1',
    name: 'Lucía (Estándar)',
    gender: 'female',
    tone: 'Profesional y Cálida',
  },
  {
    id: 'v2',
    name: 'Sofía (Joven)',
    gender: 'female',
    tone: 'Energética y Rápida',
  },
  {
    id: 'v3',
    name: 'Mateo (Corporativo)',
    gender: 'male',
    tone: 'Serio y Directo',
  },
  {
    id: 'v4',
    name: 'Javier (Amigable)',
    gender: 'male',
    tone: 'Relajado y Empático',
  },
];

const INITIAL_PROFILES = [
  {
    id: 1,
    phoneNumber: '+34 91 123 45 67',
    label: 'Sede Central - Madrid',
    voiceId: 'v1',
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
    voiceId: 'v3',
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

  const playVoicePreview = (text: string, voiceId: string) => {
    // Simulación de TTS usando la API del navegador
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Intentamos ajustar tono (simulado)
      if (voiceId === 'v3' || voiceId === 'v4') utterance.pitch = 0.8; // Más grave para hombre
      if (voiceId === 'v1' || voiceId === 'v2') utterance.pitch = 1.2; // Más agudo para mujer
      utterance.rate = 1.0;

      setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tu navegador no soporta síntesis de voz para la demo.');
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_VOICES.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => updateProfile('voiceId', voice.id)}
                  className={`cursor-pointer relative p-4 rounded-lg border-2 flex items-center justify-between transition-all ${
                    activeProfile.voiceId === voice.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-700">{voice.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          voice.gender === 'female'
                            ? 'bg-pink-400'
                            : 'bg-blue-400'
                        }`}
                      ></span>
                      {voice.tone}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playVoicePreview(
                        'Hola, soy Zia. Esta es una prueba de mi voz.',
                        voice.id
                      );
                    }}
                    className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-indigo-600 border border-slate-200"
                  >
                    {isPlaying && activeProfile.voiceId === voice.id ? (
                      <Activity
                        size={18}
                        className="animate-pulse text-indigo-600"
                      />
                    ) : (
                      <Play size={18} />
                    )}
                  </button>

                  {activeProfile.voiceId === voice.id && (
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                      <span className="flex h-4 w-4 bg-indigo-600 rounded-full border-2 border-white"></span>
                    </div>
                  )}
                </div>
              ))}
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
