
import React, { useState, useEffect } from 'react';
import { AUTH_KEY, USERS_KEY } from '../constants';
import { User } from '../types';

interface AuthGuardProps {
  children: (user: User, onLogout: () => void) => React.ReactNode;
}

type AuthStep = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'VERIFY_CODE' | 'RESET_PASSWORD';

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState<AuthStep>('LOGIN');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  
  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth) {
      setUser(JSON.parse(savedAuth));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (foundUser) {
      const loggedUser = { email: foundUser.email, name: foundUser.name };
      setUser(loggedUser);
      localStorage.setItem(AUTH_KEY, JSON.stringify(loggedUser));
      setError('');
    } else {
      setError('E-mail ou senha incorretos.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Este e-mail já está cadastrado.');
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    setSuccess('Conta criada com sucesso! Faça login para acessar.');
    setStep('LOGIN');
    setError('');
    setName('');
  };

  const initiatePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!exists) {
      setError('E-mail não encontrado no sistema.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setError('');
    // SIMULATED EMAIL SENDING
    alert(`[SIMULAÇÃO] Código enviado para ${email}: ${code}`);
    setStep('VERIFY_CODE');
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationInput === generatedCode) {
      setStep('RESET_PASSWORD');
      setError('');
    } else {
      setError('Código de verificação incorreto.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, password };
      }
      return u;
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    setSuccess('Senha alterada com sucesso! Faça login.');
    setStep('LOGIN');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    setEmail('');
    setPassword('');
  };

  const resetStates = () => {
    setError('');
    setSuccess('');
    setVerificationInput('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
              {step === 'LOGIN' && 'Bem-vindo'}
              {step === 'REGISTER' && 'Criar Conta'}
              {step === 'FORGOT_PASSWORD' && 'Recuperar Senha'}
              {step === 'VERIFY_CODE' && 'Verificar E-mail'}
              {step === 'RESET_PASSWORD' && 'Nova Senha'}
            </h2>
            <p className="text-center text-slate-500 mb-8">
              {step === 'LOGIN' && 'Acesse sua conta exclusiva'}
              {step === 'REGISTER' && 'Cadastre-se para gerenciar seus cavaletes'}
              {step === 'FORGOT_PASSWORD' && 'Enviaremos um código para seu e-mail'}
              {step === 'VERIFY_CODE' && `Digite o código enviado para ${email}`}
              {step === 'RESET_PASSWORD' && 'Crie uma senha forte e segura'}
            </p>
            
            <form 
              onSubmit={
                step === 'LOGIN' ? handleLogin :
                step === 'REGISTER' ? handleRegister :
                step === 'FORGOT_PASSWORD' ? initiatePasswordRecovery :
                step === 'VERIFY_CODE' ? handleVerifyCode :
                handleResetPassword
              } 
              className="space-y-4"
            >
              {step === 'REGISTER' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              
              {(step === 'LOGIN' || step === 'REGISTER' || step === 'FORGOT_PASSWORD') && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              {step === 'VERIFY_CODE' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Código de 6 dígitos</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 text-center tracking-widest text-2xl font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="000000"
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                  />
                </div>
              )}
              
              {(step === 'LOGIN' || step === 'REGISTER' || step === 'RESET_PASSWORD') && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    {step === 'RESET_PASSWORD' ? 'Nova Senha' : 'Senha'}
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {step === 'RESET_PASSWORD' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
              
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              {success && step === 'LOGIN' && (
                <div className="p-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-100 mt-2"
              >
                {step === 'LOGIN' && 'Entrar no Sistema'}
                {step === 'REGISTER' && 'Criar Minha Conta'}
                {step === 'FORGOT_PASSWORD' && 'Enviar Código'}
                {step === 'VERIFY_CODE' && 'Validar Código'}
                {step === 'RESET_PASSWORD' && 'Redefinir Senha'}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-center">
              {step === 'LOGIN' && (
                <>
                  <button
                    onClick={() => { setStep('REGISTER'); resetStates(); }}
                    className="text-indigo-600 font-semibold hover:text-indigo-800 transition text-sm"
                  >
                    Não tem uma conta? Criar conta
                  </button>
                  <button
                    onClick={() => { setStep('FORGOT_PASSWORD'); resetStates(); }}
                    className="text-slate-500 hover:text-indigo-600 transition text-sm"
                  >
                    Esqueceu sua senha?
                  </button>
                </>
              )}

              {(step !== 'LOGIN') && (
                <button
                  onClick={() => { setStep('LOGIN'); resetStates(); }}
                  className="text-slate-500 hover:text-indigo-600 transition text-sm"
                >
                  Voltar para o Login
                </button>
              )}
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">CavaleteMaster Individual Account System</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children(user, handleLogout)}</>;
};

export default AuthGuard;
