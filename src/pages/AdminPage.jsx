import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ToastContainer, { showToast } from '../components/Toast';

export default function AdminPage() {
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [tokenModal, setTokenModal] = useState(null);
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenNote, setTokenNote]   = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch { showToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleTokenAction = async () => {
    if (!tokenAmount || parseInt(tokenAmount) <= 0) return showToast('Valid amount enter karein', 'warning');
    setActionLoading(true);
    try {
      const endpoint = tokenModal.action === 'give' ? '/api/admin/give-tokens' : '/api/admin/deduct-tokens';
      const res = await axios.post(endpoint, {
        userId: tokenModal.user._id,
        amount: parseInt(tokenAmount),
        description: tokenNote || undefined,
      });
      showToast(res.data.message, 'success');
      setTokenModal(null); setTokenAmount(''); setTokenNote('');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally { setActionLoading(false); }
  };

  const handleToggle = async (userId, currentStatus) => {
    try {
      const res = await axios.patch(`/api/admin/toggle-user/${userId}`);
      showToast(res.data.message, 'success');
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch { showToast('Action failed', 'error'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.shopName.toLowerCase().includes(search.toLowerCase())
  );

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex flex-col" style={{ background:'linear-gradient(135deg,#060b14 0%,#0a1628 40%,#0d1f3c 100%)' }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-transparent" style={{ borderTopColor:'#00c9a7', animation:'spin 0.7s linear infinite' }} />
          <span className="text-sm font-semibold" style={{ color:'#475569' }}>Loading dashboard...</span>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="min-h-screen relative" style={{ background:'linear-gradient(135deg,#060b14 0%,#0a1628 40%,#0d1f3c 100%)' }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
        <div className="absolute rounded-full opacity-10" style={{ width:700, height:700, top:-250, right:-150, background:'radial-gradient(circle,#00c9a7 0%,transparent 70%)' }} />
        <div className="absolute rounded-full opacity-8" style={{ width:500, height:500, bottom:-150, left:-100, background:'radial-gradient(circle,#4169e1 0%,transparent 70%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage:'radial-gradient(rgba(0,201,167,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
      </div>

      <div className="relative" style={{ zIndex:1 }}>
        <Navbar />
        <ToastContainer />

        <div className="mx-auto px-5 py-8 pb-20" style={{ maxWidth:1140 }}>

          {/* ── Header ──────────────────────────────────── */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl text-xl" style={{ background:'linear-gradient(135deg,rgba(0,201,167,0.2),rgba(0,201,167,0.05))', border:'1px solid rgba(0,201,167,0.3)' }}>🛡️</div>
                <h2 className="text-2xl font-black tracking-tight" style={{ color:'#e8f0fe', letterSpacing:'-0.5px' }}>
                  Admin <span style={{ color:'#00c9a7' }}>Dashboard</span>
                </h2>
              </div>
              <p className="text-sm" style={{ color:'#475569', paddingLeft:52 }}>Users manage karein aur tokens assign karein</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold" style={{ background:'rgba(0,201,167,0.08)', border:'1px solid rgba(0,201,167,0.2)', color:'#00c9a7' }}>
              <div className="w-2 h-2 rounded-full" style={{ background:'#00c9a7', boxShadow:'0 0 6px rgba(0,201,167,0.6)' }} />
              System Operational
            </div>
          </div>

          {/* ── Stats Cards ─────────────────────────────── */}
          {stats && (
            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))' }}>
              {[
                { label:'Total Users',       value:stats.totalUsers,            icon:'👥', color:'#00c9a7', bg:'rgba(0,201,167,0.08)' },
                { label:'Active Users',      value:stats.activeUsers,           icon:'✅', color:'#00c9a7', bg:'rgba(0,201,167,0.08)' },
                { label:'Images Generated',  value:stats.totalImagesGenerated,  icon:'🖼️', color:'#f5c842', bg:'rgba(245,200,66,0.08)' },
                { label:'Tokens Given',      value:stats.totalTokensGiven,      icon:'🪙', color:'#f5c842', bg:'rgba(245,200,66,0.08)' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 flex flex-col items-center text-center relative overflow-hidden"
                  style={{ background:s.bg, border:`1px solid ${s.color}22` }}>
                  <div className="absolute inset-0 opacity-20" style={{ background:`radial-gradient(circle at 50% 0%,${s.color} 0%,transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="text-3xl mb-3">{s.icon}</div>
                    <div className="text-3xl font-black mb-1" style={{ color:s.color }}>{s.value?.toLocaleString()}</div>
                    <div className="text-xs font-semibold" style={{ color:'#475569' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Users Table ─────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>

            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-5 flex-wrap gap-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2">
                <span className="text-base">👤</span>
                <h3 className="text-base font-bold" style={{ color:'#e8f0fe' }}>All Users</h3>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold ml-1" style={{ background:'rgba(0,201,167,0.1)', color:'#00c9a7', border:'1px solid rgba(0,201,167,0.2)' }}>
                  {filtered.length}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color:'#475569' }}>🔍</span>
                <input
                  placeholder="Search name, email, shop..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl text-sm w-64 outline-none transition-all"
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#e8f0fe' }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    {['Name / Shop','Email','Tokens','Images','Status','Joined','Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-bold tracking-widest uppercase"
                        style={{ color:'#334155', background:'rgba(255,255,255,0.02)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="text-4xl mb-3">🔍</div>
                        <div className="text-sm font-semibold" style={{ color:'#334155' }}>No users found</div>
                      </td>
                    </tr>
                  ) : filtered.map((u, idx) => (
                    <tr key={u._id}
                      className="transition-colors group"
                      style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                      onMouseOver={e => e.currentTarget.style.background='rgba(0,201,167,0.03)'}
                      onMouseOut={e => e.currentTarget.style.background= idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                    >
                      {/* Name / Shop */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                            style={{ background:'linear-gradient(135deg,rgba(0,201,167,0.2),rgba(65,105,225,0.15))', color:'#00c9a7', border:'1px solid rgba(0,201,167,0.2)' }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color:'#e8f0fe' }}>{u.name}</div>
                            <div className="text-xs" style={{ color:'#475569' }}>{u.shopName}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-xs" style={{ color:'#64748b' }}>{u.email}</td>

                      {/* Tokens */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{
                            background: u.tokens <= 3 ? 'rgba(255,77,109,0.12)' : 'rgba(245,200,66,0.1)',
                            color: u.tokens <= 3 ? '#ff4d6d' : '#f5c842',
                            border: `1px solid ${u.tokens <= 3 ? 'rgba(255,77,109,0.25)' : 'rgba(245,200,66,0.2)'}`,
                          }}>
                          🪙 {u.tokens}
                        </span>
                      </td>

                      {/* Images */}
                      <td className="px-5 py-4 text-center text-sm font-semibold" style={{ color:'#94a3b8' }}>
                        {u.totalImagesGenerated}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{
                            background: u.isActive ? 'rgba(0,201,167,0.1)' : 'rgba(255,77,109,0.1)',
                            color: u.isActive ? '#00c9a7' : '#ff4d6d',
                            border: `1px solid ${u.isActive ? 'rgba(0,201,167,0.25)' : 'rgba(255,77,109,0.25)'}`,
                          }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: u.isActive ? '#00c9a7' : '#ff4d6d' }} />
                          {u.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-xs" style={{ color:'#475569' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ActionBtn
                            color="teal"
                            onClick={() => { setTokenModal({ user:u, action:'give' }); setTokenAmount(''); setTokenNote(''); }}>
                            + Tokens
                          </ActionBtn>
                          <ActionBtn
                            color="red"
                            onClick={() => { setTokenModal({ user:u, action:'deduct' }); setTokenAmount(''); setTokenNote(''); }}>
                            − Deduct
                          </ActionBtn>
                          <ActionBtn
                            color={u.isActive ? 'orange' : 'ghost'}
                            onClick={() => handleToggle(u._id, u.isActive)}>
                            {u.isActive ? 'Block' : 'Unblock'}
                          </ActionBtn>
                          <ActionBtn color="ghost" onClick={() => navigate(`/admin/user/${u._id}`)}>
                            View
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Token Modal ───────────────────────────────── */}
      {tokenModal && (
        <div className="fixed inset-0 flex items-center justify-center p-5"
          style={{ zIndex:200, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(16px)' }}
          onClick={() => setTokenModal(null)}>
          <div className="w-full rounded-3xl overflow-hidden"
            style={{ maxWidth:440, background:'#080e1a', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 40px 100px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal top accent */}
            <div className="h-1 w-full" style={{ background: tokenModal.action === 'give' ? 'linear-gradient(90deg,#00c9a7,#00b894)' : 'linear-gradient(90deg,#ff4d6d,#cc2244)' }} />

            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl text-xl"
                    style={{ background: tokenModal.action === 'give' ? 'rgba(0,201,167,0.1)' : 'rgba(255,77,109,0.1)', border: `1px solid ${tokenModal.action === 'give' ? 'rgba(0,201,167,0.25)' : 'rgba(255,77,109,0.25)'}` }}>
                    {tokenModal.action === 'give' ? '🎁' : '🔻'}
                  </div>
                  <div>
                    <h3 className="text-base font-black" style={{ color:'#e8f0fe' }}>
                      {tokenModal.action === 'give' ? 'Give Tokens' : 'Deduct Tokens'}
                    </h3>
                    <p className="text-xs" style={{ color:'#475569' }}>Token balance update karein</p>
                  </div>
                </div>
                <button onClick={() => setTokenModal(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold"
                  style={{ background:'rgba(255,77,109,0.1)', border:'1px solid rgba(255,77,109,0.2)', color:'#ff4d6d', cursor:'pointer' }}>✕</button>
              </div>

              {/* User Info */}
              <div className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,rgba(0,201,167,0.2),rgba(65,105,225,0.15))', color:'#00c9a7', border:'1px solid rgba(0,201,167,0.2)' }}>
                  {tokenModal.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color:'#e8f0fe' }}>{tokenModal.user.name}</div>
                  <div className="text-xs" style={{ color:'#475569' }}>{tokenModal.user.shopName}</div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl" style={{ background:'rgba(245,200,66,0.1)', color:'#f5c842', border:'1px solid rgba(245,200,66,0.2)' }}>
                  🪙 {tokenModal.user.tokens}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-widest uppercase" style={{ color:'#475569' }}>Token Amount *</label>
                  <input type="number" min="1" placeholder="Enter amount..."
                    value={tokenAmount} onChange={e => setTokenAmount(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#e8f0fe' }}
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-widest uppercase" style={{ color:'#475569' }}>Note <span className="normal-case font-normal" style={{ color:'#334155' }}>(optional)</span></label>
                  <input type="text" placeholder="e.g. Monthly recharge..."
                    value={tokenNote} onChange={e => setTokenNote(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#e8f0fe' }}
                  />
                </div>

                {/* Preview */}
                {tokenAmount && parseInt(tokenAmount) > 0 && (
                  <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: tokenModal.action === 'give' ? 'rgba(0,201,167,0.06)' : 'rgba(255,77,109,0.06)', border: `1px solid ${tokenModal.action === 'give' ? 'rgba(0,201,167,0.15)' : 'rgba(255,77,109,0.15)'}` }}>
                    <span className="text-xs" style={{ color:'#64748b' }}>New balance will be</span>
                    <span className="text-lg font-black" style={{ color: tokenModal.action === 'give' ? '#00c9a7' : '#ff4d6d' }}>
                      🪙 {tokenModal.action === 'give'
                        ? tokenModal.user.tokens + parseInt(tokenAmount || 0)
                        : tokenModal.user.tokens - parseInt(tokenAmount || 0)}
                    </span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-1">
                  <button onClick={() => setTokenModal(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b', cursor:'pointer' }}>
                    Cancel
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={handleTokenAction}
                    className="py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
                    style={{
                      flex:2,
                      background: actionLoading ? 'rgba(255,255,255,0.05)' :
                        tokenModal.action === 'give'
                          ? 'linear-gradient(135deg,#00c9a7,#00b894)'
                          : 'linear-gradient(135deg,#ff4d6d,#cc2244)',
                      border:'none',
                      color: actionLoading ? '#334155' : tokenModal.action === 'give' ? '#060b14' : '#fff',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      boxShadow: actionLoading ? 'none' : tokenModal.action === 'give' ? '0 4px 20px rgba(0,201,167,0.3)' : '0 4px 20px rgba(255,77,109,0.3)',
                    }}>
                    {actionLoading
                      ? <><div className="w-4 h-4 rounded-full border-2 border-transparent" style={{ borderTopColor:'#475569', animation:'spin 0.7s linear infinite' }} /> Processing...</>
                      : tokenModal.action === 'give' ? '🎁 Give Tokens' : '🔻 Deduct Tokens'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Reusable mini action button ──────────────────────────────────────────────
function ActionBtn({ color, onClick, children }) {
  const styles = {
    teal:   { bg:'rgba(0,201,167,0.1)',   border:'rgba(0,201,167,0.25)',   color:'#00c9a7'  },
    red:    { bg:'rgba(255,77,109,0.1)',  border:'rgba(255,77,109,0.25)',  color:'#ff4d6d'  },
    orange: { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.25)',  color:'#f59e0b'  },
    ghost:  { bg:'rgba(255,255,255,0.04)',border:'rgba(255,255,255,0.08)', color:'#64748b'  },
  };
  const s = styles[color] || styles.ghost;
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{ background:s.bg, border:`1px solid ${s.border}`, color:s.color, cursor:'pointer' }}
      onMouseOver={e => e.currentTarget.style.opacity='0.8'}
      onMouseOut={e => e.currentTarget.style.opacity='1'}
    >
      {children}
    </button>
  );
}