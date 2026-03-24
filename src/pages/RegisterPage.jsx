import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm]       = useState({ name:'', shopName:'', email:'', password:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');
  const { register,user } = useAuth();
  const navigate = useNavigate();



  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setError(''); setLoading(true);
    try {
      await register(form.name, form.shopName, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = (name) => ({
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${focused === name ? 'rgba(0,201,167,0.5)' : 'rgba(255,255,255,0.08)'}`,
    color: '#e8f0fe',
    boxShadow: focused === name ? '0 0 0 3px rgba(0,201,167,0.08)' : 'none',
  });

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6)  return { label:'Too short', color:'#ff4d6d', width:'20%' };
    if (p.length < 8)  return { label:'Weak',      color:'#f5c842', width:'45%' };
    if (p.length < 12) return { label:'Good',      color:'#00c9a7', width:'70%' };
    return               { label:'Strong',         color:'#00e8c0', width:'100%' };
  };
  const strength = passwordStrength();

   // loading
  if (loading) return (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #060b14 0%, #0a1628 40%, #0d1f3c 100%)'
  }}>
    <div style={{
      width: '120px',
      height: '120px',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        border: '4px solid #e9ecef',
        borderTopColor: '#4a90e2',
        borderRadius: '50%',
        animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite'
      }}/>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#4a90e2'
      }}>⚡</div>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <div style={{
      marginTop: '30px',
      display: 'flex',
      gap: '8px'
    }}>
      {['L', 'O', 'A', 'D', 'I', 'N', 'G'].map((letter, index) => (
        <span key={index} style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#4a90e2',
          animation: `pulse 1.5s ease-in-out ${index * 0.1}s infinite`,
          opacity: 0
        }}>{letter}</span>
      ))}
    </div>
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); color: #764ba2; }
      }
    `}</style>
  </div>
);
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{ background:'linear-gradient(135deg,#060b14 0%,#0a1628 50%,#0d1f3c 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full opacity-15" style={{ width:700, height:700, top:-300, right:-200, background:'radial-gradient(circle,#00c9a7 0%,transparent 65%)' }} />
        <div className="absolute rounded-full opacity-10" style={{ width:600, height:600, bottom:-200, left:-150, background:'radial-gradient(circle,#0094ff 0%,transparent 65%)' }} />
        <div className="absolute rounded-full opacity-8" style={{ width:350, height:350, top:'30%', left:'5%', background:'radial-gradient(circle,#f5c842 0%,transparent 70%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage:'radial-gradient(rgba(0,201,167,0.05) 1px,transparent 1px)', backgroundSize:'36px 36px' }} />
        {/* Floating orbs */}
        <div className="absolute w-2 h-2 rounded-full opacity-40" style={{ background:'#00c9a7', top:'15%', right:'15%', animation:'float1 6s ease-in-out infinite' }} />
        <div className="absolute w-1.5 h-1.5 rounded-full opacity-30" style={{ background:'#f5c842', bottom:'25%', left:'20%', animation:'float2 8s ease-in-out infinite' }} />
        <div className="absolute w-1 h-1 rounded-full opacity-25" style={{ background:'#0094ff', top:'50%', right:'8%', animation:'float1 7s ease-in-out infinite reverse' }} />
      </div>

      {/* Card */}
      <div
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          maxWidth: 460,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,201,167,0.05)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Top accent line */}
        <div className="h-px w-full" style={{ background:'linear-gradient(90deg,transparent,#00c9a7,#f5c842,transparent)' }} />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-7">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-4 relative"
              style={{
                background: 'linear-gradient(135deg,#00c9a7,#0094ff)',
                boxShadow: '0 8px 32px rgba(0,201,167,0.4)',
              }}
            >
              📸
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-black"
                style={{ background:'#f5c842', borderColor:'#060b14', color:'#060b14' }}>+</div>
            </div>
            <h1 className="text-2xl font-black mb-2 tracking-tight" style={{ color:'#e8f0fe', letterSpacing:'-0.5px' }}>
              Create Account
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background:'rgba(245,200,66,0.1)', border:'1px solid rgba(245,200,66,0.2)', color:'#f5c842' }}>
              🎁 Get <span className="font-black text-sm">50 free tokens</span> on registration!
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="flex flex-col gap-4">

            {/* Name + Shop Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold mb-2 tracking-widest uppercase" style={{ color:'#475569' }}>Full Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focused === 'name' ? '#00c9a7' : '#334155' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input name="name" placeholder="Saif Ansari" value={form.name} onChange={handle} required
                    onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-xs outline-none transition-all duration-200"
                    style={inputStyle('name')} />
                </div>
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-xs font-bold mb-2 tracking-widest uppercase" style={{ color:'#475569' }}>Shop Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focused === 'shopName' ? '#00c9a7' : '#334155' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <input name="shopName" placeholder="Ali Photo Studio" value={form.shopName} onChange={handle} required
                    onFocus={() => setFocused('shopName')} onBlur={() => setFocused('')}
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-xs outline-none transition-all duration-200"
                    style={inputStyle('shopName')} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold mb-2 tracking-widest uppercase" style={{ color:'#475569' }}>Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focused === 'email' ? '#00c9a7' : '#334155' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyle('email')} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold mb-2 tracking-widest uppercase" style={{ color:'#475569' }}>Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focused === 'password' ? '#00c9a7' : '#334155' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input name="password" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={handle} required
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyle('password')} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ background:'none', border:'none', cursor:'pointer', color: showPass ? '#00c9a7' : '#334155', padding:0 }}>
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

              {/* Password strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color:'#334155' }}>Password strength</span>
                    <span className="text-xs font-bold" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color, boxShadow:`0 0 6px ${strength.color}` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{ background:'rgba(255,77,109,0.1)', border:'1px solid rgba(255,77,109,0.25)', color:'#ff4d6d' }}>
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* What you get */}
            <div className="grid grid-cols-3 gap-2">
              {[['🪙','50 Free','Tokens'],['🔒','Secure','Account'],['📸','Instant','Access']].map(([icon, line1, line2]) => (
                <div key={line1} className="text-center py-2.5 px-2 rounded-xl"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
                  <div className="text-lg mb-0.5">{icon}</div>
                  <div className="text-xs font-bold" style={{ color:'#94a3b8' }}>{line1}</div>
                  <div className="text-xs" style={{ color:'#334155' }}>{line2}</div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-black transition-all duration-300 mt-1"
              style={{
                background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#00c9a7 0%,#00b894 60%,#009d7e 100%)',
                border: loading ? '1px solid rgba(255,255,255,0.08)' : 'none',
                color: loading ? '#334155' : '#060b14',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 28px rgba(0,201,167,0.4)',
                letterSpacing: '-0.3px',
              }}>
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-transparent" style={{ borderTopColor:'#475569', animation:'spin 0.7s linear infinite' }} />
                  Creating account...
                </>
              ) : (
                <>
                  🎁 Create Account & Get 50 Free Tokens
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-5 text-sm" style={{ color:'#334155' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold" style={{ color:'#00c9a7' }}
              onMouseOver={e => e.target.style.color='#00e8c0'}
              onMouseOut={e => e.target.style.color='#00c9a7'}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Bottom accent */}
        <div className="h-px w-full" style={{ background:'linear-gradient(90deg,transparent,rgba(0,148,255,0.3),transparent)' }} />
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes float1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}