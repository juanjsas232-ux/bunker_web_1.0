import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  isSupabaseConfigured,
  getSupabaseClient,
} from '../../lib/supabase';
import { updateLocalAdminCredentials } from '../../lib/authCrypto';
import { uploadProductImage } from '../../lib/imageStorage';
import {
  Save,
  RotateCcw,
  Trash2,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Lock,
  Key,
  ShieldCheck,
  Upload,
  Loader2,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToInitialData, clearAllDemoData } = useStore();

  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const handleBannerUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingBanner(true);
    try {
      const url = await uploadProductImage(files[0], 'banners');
      setFormData((prev) => ({ ...prev, heroImageUrl: url }));
    } catch (err: any) {
      alert(`Error al procesar la imagen del banner: ${err.message}`);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Supabase connection state
  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.anonKey);
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Security Credentials state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [credMessage, setCredMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);

    if (!adminEmail.trim()) {
      setCredMessage({ type: 'error', text: 'El correo/usuario de administración es obligatorio.' });
      return;
    }

    if (adminNewPassword && adminNewPassword !== adminConfirmPassword) {
      setCredMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    if (adminNewPassword && adminNewPassword.length < 6) {
      setCredMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    try {
      await updateLocalAdminCredentials(adminEmail, adminNewPassword || undefined);
      setCredMessage({
        type: 'success',
        text: '¡Credenciales de administración actualizadas con éxito y encriptadas con SHA-256!',
      });
      setAdminNewPassword('');
      setAdminConfirmPassword('');
    } catch (err: any) {
      setCredMessage({ type: 'error', text: err.message || 'Error guardando credenciales.' });
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestAndSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingSupabase(true);
    setSupabaseStatus(null);

    try {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Formato de URL o API Key inválido.');
      }

      // Quick test ping
      const { data, error } = await client.from('store_settings').select('*').limit(1);
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Error Supabase (${error.code}): ${error.message}`);
      }

      setSupabaseStatus('¡Conexión verificada con Supabase exitosamente!');
    } catch (err: any) {
      setSupabaseStatus(`Aviso: ${err.message}. Verificá haber ejecutado el archivo SQL en tu proyecto.`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCopySqlInstructions = () => {
    const text = `-- El script completo está disponible en el archivo supabase_schema.sql en la raíz del proyecto.`;
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* 1. HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17191D]">
          Configuración General de la Tienda
        </h1>
        <p className="text-xs text-[#68707D] mt-0.5">
          Modificá el número de WhatsApp comercial, banners, límites de envío y conectividad Supabase.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2.5 text-xs text-green-800 font-bold">
          <CheckCircle2 size={16} className="text-[#25D366]" />
          <span>¡Configuración de BUNKER guardada exitosamente!</span>
        </div>
      )}

      {/* 2. GENERAL SETTINGS FORM */}
      <form onSubmit={handleSettingsSubmit} className="bg-white rounded-3xl border border-[#ECEEF1] p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        <h3 className="text-sm font-black uppercase tracking-wider text-[#17191D] border-b border-[#ECEEF1] pb-3">
          Datos Comerciales y WhatsApp
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold mb-1.5 text-gray-700">Nombre de la Marca</label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full text-sm font-bold bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div>
            <label className="block font-bold mb-1.5 text-gray-700">
              WhatsApp Comercial (Recepción de Pedidos)
            </label>
            <input
              type="text"
              required
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full text-sm font-mono font-bold bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5 text-[#25D366]"
            />
            <span className="text-[10px] text-gray-400">Formato internacional ej: +5493876447169</span>
          </div>

          <div>
            <label className="block font-bold mb-1.5 text-gray-700">Usuario de Instagram</label>
            <input
              type="text"
              value={formData.instagramHandle}
              onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
              className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1.5 text-gray-700">Ubicación y Despacho</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div>
            <label className="block font-bold mb-1.5 text-gray-700">Horarios de Atención</label>
            <input
              type="text"
              value={formData.supportHours}
              onChange={(e) => setFormData({ ...formData, supportHours: e.target.value })}
              className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
            />
          </div>
        </div>

        {/* Hero & Banner Editor */}
        <h3 className="text-sm font-black uppercase tracking-wider text-[#17191D] border-b border-[#ECEEF1] pt-4 pb-3">
          Banner Principal (Hero) y Barra Superior
        </h3>

        <div>
          <label className="block font-bold mb-1.5 text-gray-700">Texto de Barra Superior</label>
          <input
            type="text"
            value={formData.announcementText}
            onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
            className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1.5 text-gray-700">Título Principal (Headline)</label>
            <input
              type="text"
              value={formData.heroHeadline}
              onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
              className="w-full text-sm font-black bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div>
            <label className="block font-bold mb-1.5 text-gray-700">Texto del Botón CTA</label>
            <input
              type="text"
              value={formData.heroCtaText}
              onChange={(e) => setFormData({ ...formData, heroCtaText: e.target.value })}
              className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1.5 text-gray-700">Subtítulo Breve</label>
          <input
            type="text"
            value={formData.heroSubtitle}
            onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
            className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
          />
        </div>

        <div>
          <label className="block font-bold mb-1.5 text-gray-700">Imagen Destacada del Banner</label>
          <div className="flex items-center gap-3 mb-2">
            <input
              type="file"
              accept="image/*"
              id="heroBannerPhotoInput"
              className="hidden"
              disabled={isUploadingBanner}
              onChange={(e) => handleBannerUpload(e.target.files)}
            />
            <label
              htmlFor="heroBannerPhotoInput"
              className="px-4 py-2 bg-[#17191D] hover:bg-[#282C33] text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-2 shadow-sm transition"
            >
              {isUploadingBanner ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Guardando en la web...</span>
                </>
              ) : (
                <>
                  <Upload size={15} />
                  <span>Subir foto desde dispositivo</span>
                </>
              )}
            </label>

            {formData.heroImageUrl && (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#ECEEF1] p-0.5 bg-[#FAFAF8] flex-shrink-0">
                <img src={formData.heroImageUrl} alt="Banner Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          <input
            type="text"
            value={formData.heroImageUrl}
            onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
            placeholder="O pegar URL web: https://..."
            className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
          />
        </div>

        {/* Stock Alert & Shipping */}
        <h3 className="text-sm font-black uppercase tracking-wider text-[#17191D] border-b border-[#ECEEF1] pt-4 pb-3">
          Parámetros de Stock y Envío
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1.5 text-gray-700">
              Umbral para Alerta de Stock Bajo
            </label>
            <input
              type="number"
              min="1"
              value={formData.stockAlertThreshold}
              onChange={(e) => setFormData({ ...formData, stockAlertThreshold: Number(e.target.value) })}
              className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
            />
            <span className="text-[10px] text-gray-400">
              Productos con esta cantidad o menos dispararán la advertencia.
            </span>
          </div>

          <div>
            <label className="block font-bold mb-1.5 text-gray-700">
              Monto Mínimo para Envío Gratis (ARS)
            </label>
            <input
              type="number"
              min="0"
              value={formData.freeShippingMinAmount}
              onChange={(e) => setFormData({ ...formData, freeShippingMinAmount: Number(e.target.value) })}
              className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition active:scale-95"
          >
            <Save size={16} />
            <span>Guardar Toda la Configuración</span>
          </button>
        </div>
      </form>

      {/* 2.5 SEGURIDAD Y CREDENCIALES DE ADMINISTRACIÓN */}
      <div className="bg-white rounded-3xl border border-[#ECEEF1] p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-[#ECEEF1] pb-4">
          <div className="flex items-center gap-2.5">
            <Lock size={22} className="text-[#F28C28]" />
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide text-[#17191D]">
                Seguridad y Credenciales de Administrador
              </h3>
              <p className="text-gray-400 text-[11px]">
                Definí tu propio usuario y contraseña privada. Se almacenan mediante hash criptográfico irreversible (SHA-256 + Salt).
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-800">
            <ShieldCheck size={13} />
            Protegido
          </span>
        </div>

        {credMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              credMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {credMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{credMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold mb-1 text-gray-700">Tu Usuario / Email Privado</label>
              <input
                type="text"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Ingresá tu email personal de acceso"
                className="w-full text-xs bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-gray-700">Nueva Contraseña Secreta</label>
              <input
                type="password"
                value={adminNewPassword}
                onChange={(e) => setAdminNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full text-xs bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-gray-700">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={adminConfirmPassword}
                onChange={(e) => setAdminConfirmPassword(e.target.value)}
                placeholder="Reingresá tu contraseña"
                className="w-full text-xs bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#17191D] hover:bg-[#282C33] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow transition"
            >
              <Key size={15} />
              <span>Actualizar Credenciales Privadas</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. SUPABASE INTEGRATION CARD (Section 6 & 8) */}
      <div className="bg-white rounded-3xl border border-[#ECEEF1] p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-[#ECEEF1] pb-4">
          <div className="flex items-center gap-2.5">
            <Database size={22} className="text-[#25D366]" />
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide text-[#17191D]">
                Conexión con Supabase
              </h3>
              <p className="text-gray-400 text-[11px]">
                Integración de base de datos Postgres y almacenamiento cloud.
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              isSupabaseConfigured()
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isSupabaseConfigured() ? '● Credenciales Configuradas' : '○ Modo Local / Persistente'}
          </span>
        </div>

        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#ECEEF1] space-y-3 leading-relaxed">
          <p className="font-bold text-[#17191D]">Cómo conectar tu proyecto de Supabase:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-gray-600 pl-1">
            <li>
              Creá un proyecto gratuito en <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#F28C28] font-bold hover:underline">supabase.com</a>.
            </li>
            <li>
              En el menú lateral de Supabase, hacé clic en <strong>SQL Editor</strong>.
            </li>
            <li>
              Abrí el archivo <code className="bg-white px-1.5 py-0.5 rounded border">supabase_schema.sql</code> incluido en el proyecto y ejecutalo.
            </li>
            <li>
              En Supabase, andá a <strong>Project Settings &gt; API</strong> y copiá tu <em>Project URL</em> y tu <em>anon public key</em> aquí abajo:
            </li>
          </ol>
        </div>

        <form onSubmit={handleTestAndSaveSupabase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1 text-gray-700">Project URL</label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full text-xs font-mono bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-gray-700">Anon / Public API Key</label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full text-xs font-mono bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5"
              />
            </div>
          </div>

          {supabaseStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-medium">
              {supabaseStatus}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isTestingSupabase}
              className="px-5 py-2.5 rounded-xl bg-[#17191D] hover:bg-[#282C33] text-white font-bold text-xs uppercase tracking-wider transition"
            >
              {isTestingSupabase ? 'Verificando...' : 'Guardar y Probar Conexión Supabase'}
            </button>

            <button
              type="button"
              onClick={handleCopySqlInstructions}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#ECEEF1] font-bold text-xs text-gray-700 hover:text-black flex items-center gap-1.5"
            >
              <Copy size={14} />
              <span>{copiedSql ? '¡Instrucción Copiada!' : 'Ver ubicación de script SQL'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. DEMO DATA RESET & CLEAR (Section 11) */}
      <div className="bg-white rounded-3xl border border-red-200 p-6 sm:p-8 shadow-sm space-y-4 text-xs">
        <h3 className="text-sm font-black uppercase tracking-wider text-red-600 border-b border-red-100 pb-3">
          Gestión de Datos Iniciales y Demostración (Sección 11)
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Los productos y categorías de prueba permiten evaluar el catálogo de forma inmediata. Cuando estés listo para cargar tus productos comerciales reales, podés limpiar los datos de prueba o restablecerlos cuando lo necesites.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            type="button"
            onClick={async () => {
              if (confirm('¿Restablecer el catálogo a los datos iniciales de demostración de BUNKER?')) {
                await resetToInitialData();
                alert('Datos de prueba restablecidos correctamente.');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-[#17191D] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#282C33]"
          >
            <RotateCcw size={14} />
            <span>Restablecer Datos Demo Iniciales</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (
                confirm(
                  'ATENCIÓN: ¿Seguro que deseás eliminar todos los datos de prueba para comenzar con una tienda limpia?'
                )
              ) {
                await clearAllDemoData();
                alert('Se limpiaron todos los datos de prueba. Ahora podés cargar tus productos reales.');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-red-700 shadow"
          >
            <Trash2 size={14} />
            <span>Eliminar Todos los Datos de Prueba (Tienda Limpia)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
