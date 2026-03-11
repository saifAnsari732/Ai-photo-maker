import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  // Auto-fill saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem('pm_last_credentials');
    if (saved) {
      try {
        const { email, password } = JSON.parse(saved);
        setForm({ email: email || '', password: password || '' });
      } catch {}
    }
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      // Save credentials for auto-fill after logout
      localStorage.setItem('pm_last_credentials', JSON.stringify({ email: form.email, password: form.password }));
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#060b14 0%,#0a1628 50%,#0d1f3c 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full opacity-15" style={{ width:700, height:700, top:-300, left:-200, background:'radial-gradient(circle,#00c9a7 0%,transparent 65%)' }} />
        <div className="absolute rounded-full opacity-10" style={{ width:600, height:600, bottom:-200, right:-150, background:'radial-gradient(circle,#0094ff 0%,transparent 65%)' }} />
        <div className="absolute rounded-full opacity-8" style={{ width:400, height:400, top:'40%', right:'10%', background:'radial-gradient(circle,#f5c842 0%,transparent 70%)' }} />
        {/* Grid */}
        <div className="absolute inset-0" style={{ backgroundImage:'radial-gradient(rgba(0,201,167,0.05) 1px,transparent 1px)', backgroundSize:'36px 36px' }} />
        {/* Floating orbs */}
        <div className="absolute w-2 h-2 rounded-full opacity-40" style={{ background:'#00c9a7', top:'20%', left:'15%', animation:'float1 6s ease-in-out infinite' }} />
        <div className="absolute w-1.5 h-1.5 rounded-full opacity-30" style={{ background:'#f5c842', top:'60%', right:'20%', animation:'float2 8s ease-in-out infinite' }} />
        <div className="absolute w-1 h-1 rounded-full opacity-25" style={{ background:'#0094ff', bottom:'30%', left:'30%', animation:'float1 7s ease-in-out infinite reverse' }} />
      </div>

      {/* Card */}
      <div
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          maxWidth: 420,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,201,167,0.05)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Top gradient line */}
        <div className="h-px w-full" style={{ background:'linear-gradient(90deg,transparent,#00c9a7,#0094ff,transparent)' }} />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-5 relative"
              style={{
                background: 'linear-gradient(135deg,#00c9a7,#0094ff)',
                boxShadow: '0 8px 32px rgba(0,201,167,0.4), 0 2px 8px rgba(0,148,255,0.3)',
              }}
            >
              📸
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ background:'#00c9a7', borderColor:'#060b14', fontSize:8, color:'#060b14', fontWeight:900 }}>✓</div>
            </div>
            <h1 className="text-2xl font-black mb-2 tracking-tight" style={{ color:'#e8f0fe', letterSpacing:'-0.5px' }}>
              Welcome Back
            </h1>
            <p className="text-sm" style={{ color:'#475569' }}>
              Sign in to your <span style={{ color:'#00c9a7', fontWeight:600 }}>Photo-Maker</span> account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="flex flex-col gap-4">

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold mb-2 tracking-widest uppercase" style={{ color:'#475569' }}>Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: focused === 'email' ? '#00c9a7' : '#334155' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={handle} required
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${focused === 'email' ? 'rgba(0,201,167,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: '#e8f0fe',
                    boxShadow: focused === 'email' ? '0 0 0 3px rgba(0,201,167,0.08)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold mb-2 tracking-widest uppercase" style={{ color:'#475569' }}>Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: focused === 'password' ? '#00c9a7' : '#334155' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  name="password" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={handle} required
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${focused === 'password' ? 'rgba(0,201,167,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: '#e8f0fe',
                    boxShadow: focused === 'password' ? '0 0 0 3px rgba(0,201,167,0.08)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ background:'none', border:'none', cursor:'pointer', color: showPass ? '#00c9a7' : '#334155', padding:0 }}
                >
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{ background:'rgba(255,77,109,0.1)', border:'1px solid rgba(255,77,109,0.25)', color:'#ff4d6d' }}>
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-black transition-all duration-300 mt-1"
              style={{
                background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#00c9a7 0%,#00b894 60%,#009d7e 100%)',
                border: loading ? '1px solid rgba(255,255,255,0.08)' : 'none',
                color: loading ? '#334155' : '#060b14',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 28px rgba(0,201,167,0.4), 0 2px 8px rgba(0,201,167,0.2)',
                letterSpacing: '-0.3px',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-transparent" style={{ borderTopColor:'#475569', animation:'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center mt-5 text-sm" style={{ color:'#334155' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-bold transition-colors" style={{ color:'#00c9a7' }}
              onMouseOver={e => e.target.style.color='#00e8c0'}
              onMouseOut={e => e.target.style.color='#00c9a7'}>
              Register here
            </Link>
          </p>


        </div>

        {/* Bottom gradient line */}
        <div className="h-px w-full" style={{ background:'linear-gradient(90deg,transparent,rgba(0,148,255,0.3),transparent)' }} />
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes float1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}