
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
  
  // Campos do Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  
  // Estados de feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth) {
      try {
        setUser(JSON.parse(savedAuth));
      } catch (e) {
        localStorage.removeItem(AUTH_KEY);
      }
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
    
    setSuccess('Conta criada! Agora você pode fazer login.');
    setStep('LOGIN');
    setError('');
  };

  const initiateRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userExists = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!userExists) {
      setError('E-mail não encontrado.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    alert(`[SISTEMA] Código de recuperação enviado para ${email}: ${code}`);
    setStep('VERIFY_CODE');
    setError('');
  };

  const verifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationInput === generatedCode) {
      setStep('RESET_PASSWORD');
      setError('');
    } else {
      setError('Código inválido.');
    }
  };

  const resetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => 
      u.email.toLowerCase() === email.toLowerCase() ? { ...u, password } : u
    );

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    setSuccess('Senha alterada com sucesso!');
    setStep('LOGIN');
    setError('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    // Limpa a URL se houver parâmetro de visualização
    if (window.location.search.includes('view=')) {
      window.location.href = window.location.pathname;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-100">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-center text-slate-800 mb-2">
              {step === 'LOGIN' && 'Acessar Conta'}
              {step === 'REGISTER' && 'Nova Conta'}
              {step === 'FORGOT_PASSWORD' && 'Recuperar Senha'}
              {step === 'VERIFY_CODE' && 'Verificação'}
              {step === 'RESET_PASSWORD' && 'Nova Senha'}
            </h2>
            <p className="text-center text-slate-500 mb-8 text-sm">
              {step === 'LOGIN' && 'Entre para gerenciar seus cavaletes'}
              {step === 'REGISTER' && 'Crie seu acesso individual seguro'}
              {step === 'FORGOT_PASSWORD' && 'Digite seu e-mail para receber o código'}
              {step === 'VERIFY_CODE' && 'Digite o código que você recebeu'}
              {step === 'RESET_PASSWORD' && 'Escolha uma nova senha de acesso'}
            </p>

            <form onSubmit={
              step === 'LOGIN' ? handleLogin :
              step === 'REGISTER' ? handleRegister :
              step === 'FORGOT_PASSWORD' ? initiateRecovery :
              step === 'VERIFY_CODE' ? verifyCode :
              resetPassword
            } className="space-y-4">
              
              {step === 'REGISTER' && (
                <input
                  type="text" required placeholder="Seu nome"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={name} onChange={e => setName(e.target.value)}
                />
              )}

              {(step === 'LOGIN' || step === 'REGISTER' || step === 'FORGOT_PASSWORD') && (
                <input
                  type="email" required placeholder="E-mail"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              )}

              {step === 'VERIFY_CODE' && (
                <input
                  type="text" required placeholder="Código de 6 dígitos"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-xl tracking-widest"
                  value={verificationInput} onChange={e => setVerificationInput(e.target.value)}
                />
              )}

              {(step === 'LOGIN' || step === 'REGISTER' || step === 'RESET_PASSWORD') && (
                <input
                  type="password" required placeholder="Senha"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              )}

              {step === 'RESET_PASSWORD' && (
                <input
                  type="password" required placeholder="Confirmar Senha"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                />
              )}

              {error && <div className="p-3 text-xs text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
              {success && <div className="p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100">{success}</div>}

              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition active:scale-95 shadow-lg shadow-indigo-100">
                Continuar
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-center">
              {step === 'LOGIN' ? (
                <>
                  <button onClick={() => setStep('REGISTER')} className="text-indigo-600 text-sm font-bold">Criar uma conta</button>
                  <button onClick={() => setStep('FORGOT_PASSWORD')} className="text-slate-400 text-xs">Esqueci minha senha</button>
                </>
              ) : (
                <button onClick={() => setStep('LOGIN')} className="text-slate-500 text-sm">Voltar para o Login</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children(user, handleLogout)}</>;
};

export default AuthGuard;
