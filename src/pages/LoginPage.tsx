import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BunkerLogo } from '../components/BunkerLogo';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Inputs are strictly empty — no pre-filled credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Brute-force protection / rate limiting
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor completá tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      setFailedAttempts(0);
      navigate('/admin');
    } else {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      if (attempts >= 5) {
        setLockoutTimer(30);
        setError('Demasiados intentos fallidos. Por seguridad, esperá 30 segundos.');
      } else {
        setError(res.error || 'Credenciales inválidas.');
      }
    }
  };

  const isLocked = lockoutTimer > 0;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#ECEEF1] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#17191D] p-8 text-center text-white relative">
          <BunkerLogo variant="light" size="lg" className="justify-center mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#F28C28]">
            Panel de Administración Privado
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Autenticación de seguridad requerida para acceder al sistema.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5" autoComplete="off">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
              Usuario / Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isLocked || isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresá tu usuario o correo"
                autoComplete="off"
                className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-3 pl-10 focus:outline-none focus:border-[#F28C28] disabled:opacity-50"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLocked || isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-3 pl-10 pr-10 focus:outline-none focus:border-[#F28C28] disabled:opacity-50"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLocked}
            className="w-full py-3.5 px-4 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Validando credenciales...</span>
              </>
            ) : isLocked ? (
              <span>Bloqueado ({lockoutTimer}s)</span>
            ) : (
              <>
                <span>Ingresar al Panel</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs pt-2">
            <Link to="/" className="text-gray-500 hover:text-[#17191D] font-bold">
              ← Volver a la tienda
            </Link>
            <span className="flex items-center gap-1 text-[11px] text-[#25D366]">
              <ShieldCheck size={13} />
              Acceso encriptado
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
