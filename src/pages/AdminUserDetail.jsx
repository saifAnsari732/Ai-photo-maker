import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ToastContainer, { showToast } from '../components/Toast';

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [tokenAmount, setTokenAmount] = useState('');
  const [note, setNote]             = useState('');
  const [action, setAction]         = useState('give');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get(`/api/admin/users/${id}`);
      setData(res.data);
    } catch { showToast('Failed to load user', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleSubmit = async () => {
    if (!tokenAmount || parseInt(tokenAmount) <= 0) return showToast('Valid amount enter karein', 'warning');
    setSubmitting(true);
    try {
      const endpoint = action === 'give' ? '/api/admin/give-tokens' : '/api/admin/deduct-tokens';
      const res = await axios.post(endpoint, { userId:id, amount:parseInt(tokenAmount), description:note });
      showToast(res.data.message, 'success');
      setTokenAmount(''); setNote('');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setSubmitting(false); }
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex flex-col" style={{ background:'linear-gradient(135deg,#060b14 0%,#0a1628 40%,#0d1f3c 100%)' }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-transparent" style={{ borderTopColor:'#00c9a7', animation:'spin 0.7s linear infinite' }} />
          <span className="text-sm font-semibold" style={{ color:'#475569' }}>Loading user...</span>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return null;
  const { user, transactions } = data;

  return (
    <div className="min-h-screen relative" style={{ background:'linear-gradient(135deg,#060b14 0%,#0a1628 40%,#0d1f3c 100%)' }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
        <div className="absolute rounded-full opacity-10" style={{ width:600, height:600, top:-200, right:-100, background:'radial-gradient(circle,#00c9a7 0%,transparent 70%)' }} />
        <div className="absolute rounded-full opacity-8" style={{ width:500, height:500, bottom:-150, left:-100, background:'radial-gradient(circle,#4169e1 0%,transparent 70%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage:'radial-gradient(rgba(0,201,167,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
      </div>

      <div className="relative" style={{ zIndex:1 }}>
        <Navbar />
        <ToastContainer />

        <div className="mx-auto px-5 py-8 pb-20" style={{ maxWidth:960 }}>

          {/* ── Back Button ─────────────────────────────── */}
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold mb-7 transition-all"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b', cursor:'pointer' }}
            onMouseOver={e => { e.currentTarget.style.color='#00c9a7'; e.currentTarget.style.borderColor='rgba(0,201,167,0.25)'; }}
            onMouseOut={e => { e.currentTarget.style.color='#64748b'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
          >
            ← Back to Dashboard
          </button>

          {/* ── Page Header ─────────────────────────────── */}
          <div className="flex items-center gap-4 mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
              style={{ background:'linear-gradient(135deg,rgba(0,201,167,0.25),rgba(65,105,225,0.15))', color:'#00c9a7', border:'1px solid rgba(0,201,167,0.3)', boxShadow:'0 4px 20px rgba(0,201,167,0.15)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight mb-0.5" style={{ color:'#e8f0fe', letterSpacing:'-0.5px' }}>{user.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm" style={{ color:'#475569' }}>{user.shopName}</span>
                <span style={{ color:'#1e293b' }}>·</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: user.isActive ? 'rgba(0,201,167,0.1)' : 'rgba(255,77,109,0.1)', color: user.isActive ? '#00c9a7' : '#ff4d6d', border:`1px solid ${user.isActive ? 'rgba(0,201,167,0.25)' : 'rgba(255,77,109,0.25)'}` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: user.isActive ? '#00c9a7' : '#ff4d6d' }} />
                  {user.isActive ? 'Active' : 'Blocked'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Top Cards Grid ──────────────────────────── */}
          <div className="grid gap-5 mb-6" style={{ gridTemplateColumns:'1fr 1fr' }}>

            {/* User Info Card */}
            <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.02)' }}>
                <span>👤</span>
                <h3 className="text-sm font-bold" style={{ color:'#e8f0fe' }}>User Info</h3>
              </div>
              <div className="px-5 pt-4 pb-2">
                {[
                  ['Name',   user.name],
                  ['Shop',   user.shopName],
                  ['Email',  user.email],
                  ['Joined', new Date(user.createdAt).toLocaleDateString('en-IN')],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-xs font-semibold" style={{ color:'#475569' }}>{k}</span>
                    <span className="text-sm font-medium" style={{ color:'#94a3b8' }}>{v}</span>
                  </div>
                ))}
              </div>
              {/* Mini stat row */}
              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="rounded-xl p-4 text-center" style={{ background:'rgba(245,200,66,0.07)', border:'1px solid rgba(245,200,66,0.15)' }}>
                  <div className="text-2xl font-black mb-0.5" style={{ color:'#f5c842' }}>{user.tokens}</div>
                  <div className="text-xs" style={{ color:'#64748b' }}>Current Tokens</div>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background:'rgba(0,201,167,0.07)', border:'1px solid rgba(0,201,167,0.15)' }}>
                  <div className="text-2xl font-black mb-0.5" style={{ color:'#00c9a7' }}>{user.totalImagesGenerated}</div>
                  <div className="text-xs" style={{ color:'#64748b' }}>Images Made</div>
                </div>
              </div>
            </div>

            {/* Manage Tokens Card */}
            <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              {/* Colored top accent */}
              <div className="h-0.5 w-full transition-all" style={{ background: action === 'give' ? 'linear-gradient(90deg,#00c9a7,#00b894)' : 'linear-gradient(90deg,#ff4d6d,#cc2244)' }} />
              <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.02)' }}>
                <span>🪙</span>
                <h3 className="text-sm font-bold" style={{ color:'#e8f0fe' }}>Manage Tokens</h3>
              </div>
              <div className="p-5 flex flex-col gap-4">

                {/* Give / Deduct Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  {[['give','+ Give'],['deduct','− Deduct']].map(([a, label]) => (
                    <button key={a} onClick={() => setAction(a)}
                      className="py-2.5 rounded-lg text-sm font-bold transition-all"
                      style={{
                        background: action === a ? (a === 'give' ? 'linear-gradient(135deg,#00c9a7,#00b894)' : 'linear-gradient(135deg,#ff4d6d,#cc2244)') : 'transparent',
                        border: 'none',
                        color: action === a ? (a === 'give' ? '#060b14' : '#fff') : '#475569',
                        cursor: 'pointer',
                        boxShadow: action === a ? (a === 'give' ? '0 4px 12px rgba(0,201,167,0.3)' : '0 4px 12px rgba(255,77,109,0.3)') : 'none',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-widest uppercase" style={{ color:'#475569' }}>Amount *</label>
                  <input type="number" min="1" placeholder="e.g. 50"
                    value={tokenAmount} onChange={e => setTokenAmount(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#e8f0fe' }} />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-widest uppercase" style={{ color:'#475569' }}>Note <span className="normal-case font-normal" style={{ color:'#334155' }}>(optional)</span></label>
                  <input type="text" placeholder="Monthly package..."
                    value={note} onChange={e => setNote(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#e8f0fe' }} />
                </div>

                {/* Preview */}
                {tokenAmount && parseInt(tokenAmount) > 0 && (
                  <div className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: action === 'give' ? 'rgba(0,201,167,0.06)' : 'rgba(255,77,109,0.06)', border:`1px solid ${action === 'give' ? 'rgba(0,201,167,0.15)' : 'rgba(255,77,109,0.15)'}` }}>
                    <span className="text-xs" style={{ color:'#64748b' }}>New balance</span>
                    <span className="text-lg font-black" style={{ color: action === 'give' ? '#00c9a7' : '#ff4d6d' }}>
                      🪙 {action === 'give' ? user.tokens + parseInt(tokenAmount || 0) : user.tokens - parseInt(tokenAmount || 0)}
                    </span>
                  </div>
                )}

                {/* Submit */}
                <button onClick={handleSubmit} disabled={submitting}
                  className="w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: submitting ? 'rgba(255,255,255,0.05)' : action === 'give' ? 'linear-gradient(135deg,#00c9a7,#00b894)' : 'linear-gradient(135deg,#ff4d6d,#cc2244)',
                    border: 'none',
                    color: submitting ? '#334155' : action === 'give' ? '#060b14' : '#fff',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: submitting ? 'none' : action === 'give' ? '0 4px 20px rgba(0,201,167,0.3)' : '0 4px 20px rgba(255,77,109,0.3)',
                  }}>
                  {submitting
                    ? <><div className="w-4 h-4 rounded-full border-2 border-transparent" style={{ borderTopColor:'#475569', animation:'spin 0.7s linear infinite' }} /> Processing...</>
                    : action === 'give' ? '🎁 Give Tokens' : '🔻 Deduct Tokens'
                  }
                </button>
              </div>
            </div>
          </div>

          {/* ── Transaction History ─────────────────────── */}
          <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div className="px-6 py-5 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2">
                <span>📜</span>
                <h3 className="text-sm font-bold" style={{ color:'#e8f0fe' }}>Token History</h3>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background:'rgba(255,255,255,0.05)', color:'#475569' }}>Last 20</span>
              </div>
              <span className="text-xs" style={{ color:'#334155' }}>{transactions.length} transactions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    {['Type','Amount','Balance After','Description','By','Date'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-bold tracking-widest uppercase"
                        style={{ color:'#334155', background:'rgba(255,255,255,0.02)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <div className="text-4xl mb-3">📭</div>
                        <div className="text-sm font-semibold" style={{ color:'#334155' }}>No transactions yet</div>
                      </td>
                    </tr>
                  ) : transactions.map((t, idx) => (
                    <tr key={t._id}
                      className="transition-colors"
                      style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                      onMouseOver={e => e.currentTarget.style.background='rgba(0,201,167,0.03)'}
                      onMouseOut={e => e.currentTarget.style.background= idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                    >
                      {/* Type */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{
                            background: t.type === 'credit' ? 'rgba(0,201,167,0.1)' : 'rgba(255,77,109,0.1)',
                            color: t.type === 'credit' ? '#00c9a7' : '#ff4d6d',
                            border:`1px solid ${t.type === 'credit' ? 'rgba(0,201,167,0.25)' : 'rgba(255,77,109,0.25)'}`,
                          }}>
                          {t.type === 'credit' ? '↑ Credit' : '↓ Debit'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-black" style={{ color: t.type === 'credit' ? '#00c9a7' : '#ff4d6d' }}>
                          {t.type === 'credit' ? '+' : '-'}{t.amount}
                        </span>
                      </td>

                      {/* Balance After */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background:'rgba(245,200,66,0.08)', color:'#f5c842', border:'1px solid rgba(245,200,66,0.15)' }}>
                          🪙 {t.balanceAfter}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 text-xs max-w-40" style={{ color:'#64748b' }}>
                        <span className="truncate block">{t.description || <span style={{ color:'#334155' }}>—</span>}</span>
                      </td>

                      {/* By */}
                      <td className="px-5 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ background:'rgba(255,255,255,0.05)', color:'#475569' }}>
                          {t.givenBy ? t.givenBy.name : 'System'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs" style={{ color:'#475569' }}>
                        {new Date(t.createdAt).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}