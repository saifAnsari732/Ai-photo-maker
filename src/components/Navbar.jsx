import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [supportHover, setSupportHover] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const tokenDanger = user?.tokens <= 3;

  const openWhatsApp = () => {
    window.open('https://wa.me/919905234866?text=Hello%2C%20I%20need%20support%20for%20Photo-Maker%20app.', '_blank');
  };

  return (
    <nav
      className="sticky top-0 flex items-center justify-between px-6 h-16"
      style={{
        background: 'rgba(6,11,20,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        zIndex: 100,
      }}
    >
      {/* ── Logo ─────────────────────────────────────── */}
      <div
        onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
        className="flex items-center gap-2.5 cursor-pointer select-none"
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl text-lg flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg,#00c9a7 0%,#0094ff 100%)',
            boxShadow: '0 4px 14px rgba(0,201,167,0.35)',
          }}
        >
          📸
        </div>
        <span
          className="font-black text-lg tracking-tight hidden sm:block"
          style={{
            background: 'linear-gradient(90deg,#00c9a7,#f5c842)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          Photo-Maker
        </span>
      </div>

      {/* ── Right Side ───────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        {user && (
          <>
            {/* Token Badge (non-admin) */}
            {user.role !== 'admin' && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{
                  background: tokenDanger ? 'rgba(255,77,109,0.12)' : 'rgba(245,200,66,0.1)',
                  border: `1px solid ${tokenDanger ? 'rgba(255,77,109,0.3)' : 'rgba(245,200,66,0.2)'}`,
                  color: tokenDanger ? '#ff4d6d' : '#f5c842',
                  animation: tokenDanger ? 'pulse 2s infinite' : 'none',
                }}
              >
                🪙 {user.tokens} tokens
              </div>
            )}

            {/* WhatsApp Support Button */}
            <button
              onClick={openWhatsApp}
              onMouseEnter={() => setSupportHover(true)}
              onMouseLeave={() => setSupportHover(false)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                background: supportHover
                  ? 'linear-gradient(135deg,#25d366,#128c7e)'
                  : 'rgba(37,211,102,0.1)',
                border: '1px solid rgba(37,211,102,0.3)',
                color: supportHover ? '#fff' : '#25d366',
                cursor: 'pointer',
                boxShadow: supportHover ? '0 4px 16px rgba(37,211,102,0.3)' : 'none',
                transform: supportHover ? 'translateY(-1px)' : 'translateY(0)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden sm:inline">Support</span>
            </button>

            {/* User Info */}
            <div
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg,rgba(0,201,167,0.3),rgba(65,105,225,0.2))',
                  color: '#00c9a7',
                  border: '1px solid rgba(0,201,167,0.2)',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold" style={{ color:'#e8f0fe' }}>{user.name}</span>
              {user.role === 'admin' && (
                <span
                  className="text-xs px-2 py-0.5 rounded-lg font-bold ml-0.5"
                  style={{
                    background: 'linear-gradient(135deg,rgba(245,200,66,0.2),rgba(245,200,66,0.1))',
                    color: '#f5c842',
                    border: '1px solid rgba(245,200,66,0.25)',
                  }}
                >
                  Admin
                </span>
              )}
            </div>

            {/* Admin Dashboard Link */}
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
                onMouseOver={e => { e.currentTarget.style.color='#00c9a7'; e.currentTarget.style.borderColor='rgba(0,201,167,0.25)'; }}
                onMouseOut={e => { e.currentTarget.style.color='#64748b'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
              >
                🛡️ Dashboard
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: 'rgba(255,77,109,0.08)',
                border: '1px solid rgba(255,77,109,0.18)',
                color: '#ff4d6d',
                cursor: 'pointer',
              }}
              onMouseOver={e => { e.currentTarget.style.background='rgba(255,77,109,0.15)'; e.currentTarget.style.borderColor='rgba(255,77,109,0.35)'; }}
              onMouseOut={e => { e.currentTarget.style.background='rgba(255,77,109,0.08)'; e.currentTarget.style.borderColor='rgba(255,77,109,0.18)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
      `}</style>
    </nav>
  );
}