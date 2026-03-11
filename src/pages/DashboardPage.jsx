import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ToastContainer, { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const PRESETS = [
  { name:'White',      hex:'#ffffff' },
  { name:'Light Blue', hex:'#c8dff5' },
  { name:'Sky Blue',   hex:'#87ceeb' },
  { name:'Royal Blue', hex:'#4169e1' },
  { name:'Grey',       hex:'#b0b8c1' },
  { name:'Dark Grey',  hex:'#6c757d' },
  { name:'Cream',      hex:'#fdf6e3' },
  { name:'Gold',       hex:'#ffd700' },
  { name:'Red',        hex:'#cc0000' },
  { name:'Teal',       hex:'#008080' },
  { name:'Black',      hex:'#111111' },
];

const STEPS = [
  { icon:'🔄', label:'Removing background', detail:'remove.bg AI' },
  { icon:'🎨', label:'Applying background color', detail:'sharp' },
  { icon:'✨', label:'AI Enhancement', detail:'cutout.pro' },
  { icon:'☁️',  label:'Saving to cloud', detail:'Cloudinary' },
  { icon:'📐', label:'Sizing passport photos', detail:'sharp resize' },
  { icon:'📄', label:'Building A4 layout', detail:'sharp composite' },
  { icon:'🖨️', label:'Generating PDF', detail:'PDFKit' },
];

export default function DashboardPage() {
  const { user, updateTokens } = useAuth();
  const [images, setImages]           = useState([{ file:null, preview:null, copies:6 }]);
  const [bgColor, setBgColor]         = useState('#ffffff');
  const [generating, setGenerating]   = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showAdv, setShowAdv]         = useState(false);
  const [advanced, setAdvanced]       = useState({ width:390, height:480, spacing:10, border:2 });
  const [pdfUrl, setPdfUrl]           = useState(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [cropModal, setCropModal]     = useState({ show:false, imageIndex:null });
  const [crop, setCrop]               = useState({ x: 0, y: 0 });
  const [zoom, setZoom]               = useState(1);
  const [rotation, setRotation]       = useState(0);
  const [cropMode, setCropMode]       = useState('passport');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileRefs = useRef([]);
  const dragCounter = useRef(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (blob) { addImageFromFile(blob); showToast('📋 Image pasted successfully!', 'success'); }
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [images]);

  const handleDragEnter = (e) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false); dragCounter.current = 0;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => { if (file.type.startsWith('image/')) addImageFromFile(file); });
      showToast(`📥 ${files.length} image(s) added!`, 'success');
    }
  };

  const addImageFromFile = (file) => {
    const allowedTypes = ['image/jpeg','image/jpg','image/png','image/webp'];
    if (!allowedTypes.includes(file.type)) { showToast('Only JPG, PNG, WEBP allowed', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const emptyIndex = images.findIndex(img => !img.file);
      if (emptyIndex !== -1) {
        const updated = [...images];
        updated[emptyIndex] = { ...updated[emptyIndex], file, preview:e.target.result, originalPreview: e.target.result };
        setImages(updated);
      } else if (images.length < 5) {
        setImages([...images, { file, preview:e.target.result, originalPreview: e.target.result, copies:6 }]);
      } else { showToast('Maximum 5 images allowed', 'warning'); }
    };
    reader.readAsDataURL(file);
  };

  const addSlot = () => {
    if (images.length >= 5) return showToast('Maximum 5 images allowed', 'warning');
    setImages([...images, { file:null, preview:null, copies:6 }]);
  };
  const removeSlot = (i) => {
    if (images.length === 1) { setImages([{ file:null, preview:null, copies:6 }]); return; }
    setImages(images.filter((_,idx) => idx !== i));
  };
  const handleFile = (i, file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg','image/jpg','image/png','image/webp'];
    if (!allowedTypes.includes(file.type)) return showToast('Only JPG, PNG, WEBP allowed', 'error');
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = [...images];
      updated[i] = { ...updated[i], file, preview:e.target.result, originalPreview: e.target.result };
      setImages(updated);
    };
    reader.readAsDataURL(file);
  };
  const setCopies = (i, val) => {
    const updated = [...images];
    updated[i] = { ...updated[i], copies: Math.min(54, Math.max(1, val)) };
    setImages(updated);
  };

  const simulateProgress = () => {
    const delays = [0, 4000, 6000, 8000, 10000, 13000, 15000];
    delays.forEach((delay, idx) => { setTimeout(() => setCurrentStep(idx), delay); });
  };

  const handleGenerate = async () => {
    if (user.tokens <= 0) return showToast('Token khatam! Admin se contact karein.', 'error');
    const hasImage = images.some(img => img.file);
    if (!hasImage) return showToast('Koi image select nahi ki!', 'warning');
    setGenerating(true); setCurrentStep(0); setPdfUrl(null); simulateProgress();
    try {
      const formData = new FormData();
      let idx = 0;
      images.forEach((img) => {
        if (img.file) { formData.append(`image_${idx}`, img.file); formData.append(`copies_${idx}`, img.copies); idx++; }
      });
      formData.append('bg_color', bgColor); formData.append('width', advanced.width);
      formData.append('height', advanced.height); formData.append('spacing', advanced.spacing); formData.append('border', advanced.border);
      const res = await axios.post('/api/image/process', formData, {
        responseType:'blob', headers:{'Content-Type':'multipart/form-data'}, timeout:180000,
      });
      const remaining = res.headers['x-tokens-remaining'];
      if (remaining !== undefined) updateTokens(parseInt(remaining));
      const url = window.URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }));
      setPdfUrl(url); 
      setCurrentStep(7);
      showToast('Photo ready! 1 token use hua.', 'success');
    } catch (err) {
      const status = err.response?.status; const message = err.response?.data?.message;
      if (status === 403) showToast('🚫 Token khatam! Admin se contact karein.', 'error');
      else if (status === 402) showToast('⚠️ remove.bg quota khatam! Admin ko batayein.', 'error');
      else if (status === 401) showToast('🔑 API key invalid. Admin se contact karein.', 'error');
      else showToast(message || 'Processing failed. Please try again.', 'error');
      setCurrentStep(-1);
    } finally { setGenerating(false); }
  };

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a'); a.href = pdfUrl; a.download = 'passport-sheet.pdf'; a.click();
  };

  const openCropModal = (index) => {
    setCropModal({ show:true, imageIndex:index }); setCrop({ x:0, y:0 });
    setZoom(1); setRotation(0); setCropMode('passport');
  };
  const closeCropModal = () => { setCropModal({ show:false, imageIndex:null }); setCroppedAreaPixels(null); };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleFlip = async () => {
    if (cropModal.imageIndex === null) return;
    const image = images[cropModal.imageIndex];
    const img = new Image(); img.src = image.originalPreview;
    await new Promise((resolve) => { img.onload = resolve; });
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.scale(-1, 1); ctx.drawImage(img, -img.width, 0, img.width, img.height);
    canvas.toBlob((blob) => {
      const flippedUrl = URL.createObjectURL(blob);
      const updated = [...images];
      updated[cropModal.imageIndex] = { ...updated[cropModal.imageIndex], originalPreview: flippedUrl };
      setImages(updated);
    }, 'image/jpeg', 0.95);
  };
  const handleReset = () => { setCrop({ x:0, y:0 }); setZoom(1); setRotation(0); };
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => { setCroppedAreaPixels(croppedAreaPixels); }, []);

  const createCroppedImage = async () => {
    if (cropModal.imageIndex === null || !croppedAreaPixels) return;
    const image = images[cropModal.imageIndex];
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    const img = new Image(); img.src = image.originalPreview;
    await new Promise((resolve) => { img.onload = resolve; });
    canvas.width = croppedAreaPixels.width; canvas.height = croppedAreaPixels.height;
    if (rotation !== 0) {
      const radians = (rotation * Math.PI) / 180; const cos = Math.abs(Math.cos(radians)); const sin = Math.abs(Math.sin(radians));
      const newWidth = croppedAreaPixels.width * cos + croppedAreaPixels.height * sin;
      const newHeight = croppedAreaPixels.width * sin + croppedAreaPixels.height * cos;
      canvas.width = newWidth; canvas.height = newHeight;
      ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(radians);
      ctx.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
        -croppedAreaPixels.width / 2, -croppedAreaPixels.height / 2, croppedAreaPixels.width, croppedAreaPixels.height);
    } else {
      ctx.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
    }
    return new Promise((resolve) => { canvas.toBlob((blob) => { resolve(URL.createObjectURL(blob)); }, 'image/jpeg', 0.95); });
  };

  const handleCropSave = async () => {
    try {
      const croppedImageUrl = await createCroppedImage();
      const response = await fetch(croppedImageUrl); const blob = await response.blob();
      const file = new File([blob], images[cropModal.imageIndex].file.name, { type:'image/jpeg' });
      const updated = [...images];
      updated[cropModal.imageIndex] = { ...updated[cropModal.imageIndex], preview:croppedImageUrl, file, cropped:true };
      setImages(updated); showToast('✂️ Image cropped successfully!', 'success'); closeCropModal();
    } catch (error) { showToast('Crop failed. Please try again.', 'error'); console.error('Crop error:', error); }
  };

  const tokenDanger = user?.tokens <= 3;

  return (
    <div
      className="min-h-screen relative text-white"
      style={{ background: 'linear-gradient(135deg, #060b14 0%, #0a1628 40%, #0d1f3c 100%)' }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute rounded-full opacity-10" style={{ width: 600, height: 600, top: -200, right: -100, background: 'radial-gradient(circle, #00c9a7 0%, transparent 70%)' }} />
        <div className="absolute rounded-full opacity-8" style={{ width: 500, height: 500, bottom: -150, left: -100, background: 'radial-gradient(circle, #4169e1 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0,201,167,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <ToastContainer />

        {/* Drag Overlay */}
        {isDragging && (
          <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex:9999, background:'rgba(0,201,167,0.1)', backdropFilter:'blur(12px)', border:'3px dashed #00c9a7' }}>
            <div className="text-center rounded-3xl p-16" style={{ background:'rgba(6,11,20,0.95)', border:'1px solid rgba(0,201,167,0.4)', boxShadow:'0 40px 80px rgba(0,201,167,0.2)' }}>
              <div className="text-7xl mb-5">📸</div>
              <div className="text-3xl font-black mb-3" style={{ color:'#00c9a7', letterSpacing:'-0.5px' }}>Drop Photos Here</div>
              <div className="text-sm" style={{ color:'#64748b' }}>JPG · PNG · WEBP · Multiple files</div>
            </div>
          </div>
        )}

        <div className="mx-auto px-5 pb-20 pt-8" style={{ maxWidth: 900 }}>

          {/* Token Alerts */}
          {user?.tokens === 0 && (
            <div className="flex items-start gap-4 rounded-2xl p-5 mb-6" style={{ background:'linear-gradient(135deg, rgba(255,77,109,0.1), rgba(255,77,109,0.05))', border:'1px solid rgba(255,77,109,0.25)' }}>
              <span className="text-3xl">🚫</span>
              <div>
                <div className="font-bold text-base mb-1" style={{ color:'#ff4d6d' }}>Token Balance Zero!</div>
                <div className="text-sm leading-relaxed" style={{ color:'#94a3b8' }}>Aapke tokens khatam ho gaye hain. Photo generate karne ke liye admin se naye tokens mangein.</div>
              </div>
            </div>
          )}
          {user?.tokens > 0 && user?.tokens <= 3 && (
            <div className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-6" style={{ background:'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(245,200,66,0.04))', border:'1px solid rgba(245,200,66,0.2)' }}>
              <span className="text-xl">⚠️</span>
              <div className="text-sm" style={{ color:'#f5c842' }}>Sirf <strong>{user.tokens} token</strong> bache hain. Jaldi admin se naye tokens mangein!</div>
            </div>
          )}

          {/* ─── HEADER ─────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl text-xl" style={{ background:'linear-gradient(135deg, rgba(0,201,167,0.2), rgba(0,201,167,0.05))', border:'1px solid rgba(0,201,167,0.3)' }}>📸</div>
                <h2 className="text-xl font-black tracking-tight" style={{ color:'#e8f0fe', letterSpacing:'-0.5px' }}>
                  PHOTO<span style={{ color:'#00c9a7' }}>-</span>MAKER
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full align-middle" style={{ background:'rgba(0,201,167,0.15)', color:'#00c9a7', border:'1px solid rgba(0,201,167,0.25)' }}>PRO</span>
                </h2>
              </div>
              <p className="text-sm ml-13" style={{ color:'#64748b', paddingLeft: 52 }}>
                Welcome, <strong style={{ color:'#94a3b8' }}>{user?.name}</strong>
                <span className="mx-2" style={{ color:'#1e293b' }}>·</span>
                <span style={{ color:'#475569' }}>{user?.shopName}</span>
              </p>
            </div>
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold ${tokenDanger ? 'animate-pulse' : ''}`}
              style={{ background: tokenDanger ? 'linear-gradient(135deg, rgba(255,77,109,0.15), rgba(255,77,109,0.08))' : 'linear-gradient(135deg, rgba(0,201,167,0.15), rgba(0,201,167,0.05))', border: tokenDanger ? '1px solid rgba(255,77,109,0.3)' : '1px solid rgba(0,201,167,0.25)', color: tokenDanger ? '#ff4d6d' : '#00c9a7' }}>
              <span>🪙</span> {user?.tokens} tokens
            </div>
          </div>

          {/* ─── UPLOAD ZONE ─────────────────────────────── */}
          <div className="rounded-2xl p-px mb-5" style={{ background:'linear-gradient(135deg, rgba(0,201,167,0.3), rgba(65,105,225,0.2), rgba(0,201,167,0.1))' }}>
            <div className="rounded-2xl p-1" style={{ background:'rgba(6,11,20,0.95)' }}>
              <div
                className="rounded-xl p-8 text-center cursor-pointer relative overflow-hidden transition-all duration-300"
                style={{ background:'linear-gradient(135deg, rgba(0,201,167,0.04), rgba(65,105,225,0.03))', border:'2px dashed rgba(0,201,167,0.7)' }}
                onClick={() => fileRefs.current[images.findIndex(img => !img.file)]?.click()}
              >
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage:'radial-gradient(circle at 30% 50%, #00c9a7 0%, transparent 60%), radial-gradient(circle at 70% 50%, #4169e1 0%, transparent 60%)' }} />
                <div className="relative z-10">
                  <div className="text-5xl mb-4">📸</div>
                  <div className="text-lg font-bold mb-2" style={{ color:'#e8f0fe' }}>Upload Your Photos</div>
                  <div className="text-xs mb-5 leading-relaxed" style={{ color:'#64748b' }}>
                    Drag & Drop · Click to upload · <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#94a3b8', fontFamily:'monospace' }}>Ctrl+V</kbd> to paste
                    <br /><span style={{ color:'#334155' }}>JPG · PNG · WEBP · Multiple files</span>
                  </div>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background:'linear-gradient(135deg, rgba(0,201,167,0.2), rgba(0,201,167,0.1))', border:'1px solid rgba(0,201,167,0.35)', color:'#00c9a7' }}>
                    📁 Browse Files
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background:'rgba(0,201,167,0.1)', border:'1px solid rgba(0,201,167,0.2)', color:'#00c9a7' }}>
                  ⌨️ Ctrl+V
                </div>
              </div>
            </div>
          </div>

          {/* ─── BACKGROUND COLOR ────────────────────────── */}
          <div className="rounded-2xl p-5 mb-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(10px)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">🎨</span>
              <h3 className="text-sm font-bold" style={{ color:'#e8f0fe' }}>Background Color</h3>
              <span className="text-xs" style={{ color:'#475569' }}>— photo ka background</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              {PRESETS.map(p => (
                <button key={p.hex} title={p.name}
                  onClick={() => setBgColor(p.hex)}
                  className="transition-all duration-150"
                  style={{
                    width:32, height:32, borderRadius:'50%', flexShrink:0, cursor:'pointer',
                    background:p.hex,
                    border: bgColor.toLowerCase() === p.hex ? '3px solid #00c9a7' : '2px solid rgba(255,255,255,0.1)',
                    boxShadow: bgColor.toLowerCase() === p.hex ? '0 0 0 2px rgba(0,201,167,0.3), 0 4px 12px rgba(0,201,167,0.2)' : '0 2px 6px rgba(0,0,0,0.3)',
                    transform: bgColor.toLowerCase() === p.hex ? 'scale(1.15)' : 'scale(1)',
                  }}/>
              ))}
              <div className="flex flex-col items-center gap-1">
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                  className="cursor-pointer"
                  style={{ width:32, height:32, borderRadius:'50%', padding:2, border:'2px dashed rgba(255,255,255,0.2)', background:'transparent' }}/>
                <span className="text-xs font-bold" style={{ color:'#334155', fontSize:9, letterSpacing:0.5 }}>CUSTOM</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color:'#475569' }}>
              <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background:bgColor, border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 2px 6px rgba(0,0,0,0.4)' }} />
              <span>Selected:</span>
              <code className="px-2 py-0.5 rounded-md font-mono" style={{ background:'rgba(0,201,167,0.1)', color:'#00c9a7', border:'1px solid rgba(0,201,167,0.15)' }}>{bgColor.toUpperCase()}</code>
            </div>
          </div>

          {/* ─── IMAGE SLOTS ─────────────────────────────── */}
          <div className="flex flex-col gap-3 mb-4">
            {images.map((img, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-center gap-4 transition-all duration-200"
                style={{ background: img.preview ? 'rgba(0,201,167,0.04)' : 'rgba(255,255,255,0.03)', border: img.preview ? '1px solid rgba(0,201,167,0.2)' : '1px solid rgba(255,255,255,0.06)' }}>
                {/* Thumbnail */}
                <div
                  onClick={() => fileRefs.current[i]?.click()}
                  className="flex-shrink-0 flex items-center justify-center cursor-pointer overflow-hidden rounded-xl transition-all duration-200"
                  style={{ width:72, height:90, border: img.preview ? '2px solid rgba(0,201,167,0.35)' : '2px dashed rgba(255,255,255,0.1)', background: img.preview ? 'none' : 'rgba(255,255,255,0.02)' }}
                >
                  {img.preview
                    ? <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    : <div className="text-center p-2" style={{ color:'#475569' }}>
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs">Click</div>
                      </div>
                  }
                  <input ref={el => fileRefs.current[i] = el} type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                    onChange={e => handleFile(i, e.target.files[0])} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs mb-3 truncate">
                    {img.file
                      ? <span className="font-semibold" style={{ color:'#00c9a7' }}>{img.cropped ? '✂️ ' : '✅ '}{img.file.name}</span>
                      : <span style={{ color:'#334155' }}>No image selected</span>
                    }
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold" style={{ color:'#475569' }}>Copies:</span>
                    <div className="flex items-center rounded-xl overflow-hidden" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <button onClick={() => setCopies(i, img.copies-1)}
                        className="text-lg font-bold px-3 py-1.5 transition-colors"
                        style={{ background:'none', border:'none', color:'#00c9a7', cursor:'pointer', lineHeight:1 }}>−</button>
                      <span className="text-sm font-bold px-2 text-center min-w-7" style={{ color:'#e8f0fe' }}>{img.copies}</span>
                      <button onClick={() => setCopies(i, img.copies+1)}
                        className="text-lg font-bold px-3 py-1.5 transition-colors"
                        style={{ background:'none', border:'none', color:'#00c9a7', cursor:'pointer', lineHeight:1 }}>+</button>
                    </div>
                    <span className="text-xs" style={{ color:'#334155' }}>max 54</span>
                  </div>
                </div>

                {/* Crop Button */}
                {img.file && (
                  <button onClick={() => openCropModal(i)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{ background:'rgba(0,201,167,0.1)', border:'1px solid rgba(0,201,167,0.25)', color:'#00c9a7', cursor:'pointer' }}>
                    ✂️ Crop
                  </button>
                )}

                {/* Remove */}
                {images.length > 1 && (
                  <button onClick={() => removeSlot(i)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 text-sm font-bold"
                    style={{ background:'rgba(255,77,109,0.1)', border:'1px solid rgba(255,77,109,0.2)', color:'#ff4d6d', cursor:'pointer' }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {images.length < 5 && (
            <button onClick={addSlot}
              className="w-full mb-5 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{ background:'transparent', border:'1.5px dashed rgba(255,255,255,0.1)', color:'#475569', cursor:'pointer' }}
              onMouseOver={e => { e.currentTarget.style.borderColor='rgba(0,201,167,0.3)'; e.currentTarget.style.color='#00c9a7'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#475569'; }}>
              <span className="text-base">+</span> Add Another Image
            </button>
          )}

          {/* ─── ADVANCED OPTIONS ────────────────────────── */}
          <div className="rounded-2xl mb-5 overflow-hidden" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setShowAdv(!showAdv)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              style={{ background:'none', border:'none', cursor:'pointer' }}>
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color:'#64748b' }}>
                <span>⚙️</span> Advanced Options
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background:'rgba(255,255,255,0.05)', color:'#475569' }}>{showAdv ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {showAdv && (
              <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                {[['width','Photo Width (px)'],['height','Photo Height (px)'],['spacing','Spacing (px)'],['border','Border (px)']].map(([k,label]) => (
                  <div key={k}>
                    <label className="block text-xs font-bold mb-2" style={{ color:'#475569', letterSpacing:0.4 }}>{label}</label>
                    <input type="number" value={advanced[k]}
                      onChange={e => setAdvanced({...advanced, [k]: parseInt(e.target.value)||0})}
                      className="w-full rounded-xl px-3 py-2 text-sm font-medium"
                      style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#e8f0fe', outline:'none' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── PROCESSING STEPS ────────────────────────── */}
          {generating && (
            <div className="rounded-2xl p-5 mb-5" style={{ background:'rgba(0,201,167,0.04)', border:'1px solid rgba(0,201,167,0.15)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full border-2 border-transparent" style={{ borderTopColor:'#00c9a7', animation:'spin 0.7s linear infinite' }} />
                <span className="text-sm font-semibold" style={{ color:'#00c9a7' }}>Processing your photos...</span>
              </div>
              {STEPS.map((step, idx) => {
                const done = idx < currentStep; const active = idx === currentStep; const waiting = idx > currentStep;
                return (
                  <div key={idx} className="flex items-center gap-3 py-2.5"
                    style={{ borderBottom: idx < STEPS.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none', opacity: waiting ? 0.3 : 1, transition:'all 0.3s' }}>
                    <span className="text-base w-6 text-center">{done ? '✅' : active ? '⏳' : step.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold" style={{ color: active ? '#e8f0fe' : '#64748b' }}>{step.label}</div>
                      <div className="text-xs" style={{ color:'#334155' }}>{step.detail}</div>
                    </div>
                    {active && <div className="w-4 h-4 rounded-full border-2 border-transparent flex-shrink-0" style={{ borderTopColor:'#00c9a7', animation:'spin 0.7s linear infinite' }} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── GENERATE BUTTON ─────────────────────────── */}
          <button
            onClick={handleGenerate}
            disabled={generating || user?.tokens <= 0}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-base font-black transition-all duration-300"
            style={{
              background: generating || user?.tokens <= 0
                ? 'rgba(255,255,255,0.05)'
                : 'linear-gradient(135deg, #00c9a7 0%, #00b894 50%, #009d7e 100%)',
              border: generating || user?.tokens <= 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              color: generating || user?.tokens <= 0 ? '#334155' : '#060b14',
              cursor: generating || user?.tokens <= 0 ? 'not-allowed' : 'pointer',
              boxShadow: generating || user?.tokens <= 0 ? 'none' : '0 8px 32px rgba(0,201,167,0.35), 0 2px 8px rgba(0,201,167,0.2)',
              letterSpacing:'-0.3px'
            }}
          >
            {generating ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-transparent" style={{ borderTopColor:'#475569', animation:'spin 0.7s linear infinite' }} />
                Processing...
              </>
            ) : user?.tokens <= 0 ? '🚫 Token khatam — Admin se contact karein'
              : <><span>🖨️</span> Generate Passport Sheet <span className="opacity-60 font-normal text-sm">· 1 token</span></>
            }
          </button>

          <div className="text-center mt-3 text-xs" style={{ color:'#1e293b' }}>
            Pipeline: remove.bg → cutout.pro → Cloudinary → PDF &nbsp;·&nbsp; Tokens left:{' '}
            <strong style={{ color:'#00c9a7' }}>{user?.tokens}</strong>
          </div>

          {/* ─── PDF PREVIEW ─────────────────────────────── */}
          {pdfUrl && !generating && (
            <div className="mt-8">
              <div className="flex gap-3 mb-5 justify-center flex-wrap">
                <button onClick={handleGenerate} disabled={user?.tokens <= 0}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200"
                  style={{ background:'rgba(0,201,167,0.15)', border:'1px solid rgba(0,201,167,0.3)', color:'#00c9a7', cursor: user?.tokens <= 0 ? 'not-allowed' : 'pointer' }}>
                  🔄 Generate Sheet
                </button>
                <button onClick={downloadPdf}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200"
                  style={{ background:'linear-gradient(135deg, #ffd700, #f5a623)', border:'none', color:'#060b14', cursor:'pointer', boxShadow:'0 4px 16px rgba(255,215,0,0.25)' }}>
                  ⬇️ Download PDF
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
                <iframe src={pdfUrl} style={{ width:'100%', height:600, border:'none', background:'#fff', display:'block' }} title="PDF Preview" />
              </div>
            </div>
          )}
        </div>

        {/* ─── FOOTER ───────────────────────────────────── */}
        <footer className="relative mt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div className="absolute inset-0 opacity-50" style={{ background:'linear-gradient(180deg, transparent, rgba(0,201,167,0.03))' }} />
          <div className="relative mx-auto px-5 py-10" style={{ maxWidth:900 }}>
            <div className="grid gap-8 mb-8" style={{ gridTemplateColumns:'2fr 1fr 1fr' }}>
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg text-sm" style={{ background:'linear-gradient(135deg, rgba(0,201,167,0.2), rgba(0,201,167,0.05))', border:'1px solid rgba(0,201,167,0.25)' }}>📸</div>
                  <span className="font-black text-base tracking-tight" style={{ color:'#e8f0fe' }}>
                    PHOTO<span style={{ color:'#00c9a7' }}>-</span>MAKER
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color:'#334155', maxWidth:260 }}>
                  Professional passport photo generation platform. AI-powered background removal, enhancement, and print-ready PDF output.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background:'#00c9a7', boxShadow:'0 0 6px rgba(0,201,167,0.6)' }} />
                  <span className="text-xs font-semibold" style={{ color:'#00c9a7' }}>All systems operational</span>
                </div>
              </div>

              {/* Pipeline */}
              <div>
                <div className="text-xs font-bold mb-3 tracking-widest uppercase" style={{ color:'#475569' }}>Pipeline</div>
                <ul className="space-y-2 text-xs" style={{ color:'#334155' }}>
                  {['remove.bg — BG Removal', 'cutout.pro — AI Enhance', 'Cloudinary — CDN Storage', 'PDFKit — PDF Export'].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <span style={{ color:'rgba(0,201,167,0.5)' }}>→</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <div className="text-xs font-bold mb-3 tracking-widest uppercase" style={{ color:'#475569' }}>Support</div>
                <ul className="space-y-2 text-xs" style={{ color:'#334155' }}>
                  {['Token Recharge', 'Admin Contact', 'Usage Guide', 'FAQs'].map(item => (
                    <li key={item} className="flex items-center gap-2 cursor-pointer transition-colors" style={{ cursor:'pointer' }}>
                      <span style={{ color:'rgba(0,201,167,0.5)' }}>→</span>
                      <span className="transition-colors" style={{ color:'#334155' }}
                        onMouseOver={e => e.target.style.color='#00c9a7'}
                        onMouseOut={e => e.target.style.color='#334155'}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-6" style={{ borderTop:'1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-xs" style={{ color:'#1e293b' }}>
                © {new Date().getFullYear()} Photo-Maker. All rights reserved.
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color:'#1e293b' }}>
                <span>Made with <span style={{ color:'#ff4d6d' }}>♥</span> for photo studios</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background:'#00c9a7' }} />
                  <span>v2.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ─── CROP MODAL ──────────────────────────────── */}
      {cropModal.show && cropModal.imageIndex !== null && (
        <div className="fixed inset-0 flex items-center justify-center p-5"
          style={{ zIndex:10000, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(16px)' }}
          onClick={closeCropModal}>
          <div className="w-full rounded-3xl overflow-auto"
            style={{ maxWidth:900, maxHeight:'95vh', background:'#080e1a', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 40px 100px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}>

            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl text-xl" style={{ background:'rgba(0,201,167,0.1)', border:'1px solid rgba(0,201,167,0.2)' }}>✂️</div>
                  <h3 className="text-lg font-black tracking-tight" style={{ color:'#e8f0fe' }}>Crop Photo</h3>
                </div>
                <button onClick={closeCropModal}
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-lg font-bold transition-all"
                  style={{ background:'rgba(255,77,109,0.1)', border:'1px solid rgba(255,77,109,0.2)', color:'#ff4d6d', cursor:'pointer' }}>✕</button>
              </div>

              {/* Mode Selector */}
              <div className="mb-4">
                <div className="text-xs font-bold mb-2.5 tracking-widest uppercase" style={{ color:'#334155' }}>Mode</div>
                <div className="flex gap-2">
                  {[['free','✂️ Free Crop'],['passport','📐 Passport Ratio']].map(([mode,label]) => (
                    <button key={mode} onClick={() => setCropMode(mode)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: cropMode === mode ? 'rgba(0,201,167,0.15)' : 'rgba(255,255,255,0.04)', border: cropMode === mode ? '1px solid rgba(0,201,167,0.35)' : '1px solid rgba(255,255,255,0.07)', color: cropMode === mode ? '#00c9a7' : '#64748b', cursor:'pointer' }}>
                      {label}
                    </button>
                  ))}
                  <div className="flex items-center px-3 py-2 rounded-xl text-xs" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', color:'#334155' }}>
                    Koi bhi shape/size
                  </div>
                </div>
              </div>

              {/* Crop Area */}
              <div className="rounded-2xl overflow-hidden mb-4" style={{ width:'100%', height:480, background:'#040810', border:'1px solid rgba(255,255,255,0.06)', position:'relative' }}>
                <SimpleCrop
                  image={images[cropModal.imageIndex].originalPreview}
                  crop={crop} zoom={zoom} rotation={rotation}
                  aspect={cropMode === 'passport' ? 325/400 : undefined}
                  onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
                />
              </div>

              {/* Zoom */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color:'#334155' }}>Zoom</span>
                  <span className="text-sm font-bold" style={{ color:'#00c9a7' }}>{zoom.toFixed(1)}×</span>
                </div>
                <input type="range" value={zoom} min={1} max={3} step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full cursor-pointer" style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.08)', accentColor:'#00c9a7' }} />
              </div>

              {/* Controls */}
              <div className="grid grid-cols-3 gap-2.5 mb-5 p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
                {[['🔄 Rotate',handleRotate],['↺ Reset',handleReset],['↔ Flip H',handleFlip]].map(([label,fn]) => (
                  <button key={label} onClick={fn}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b', cursor:'pointer' }}
                    onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#94a3b8'; }}
                    onMouseOut={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#64748b'; }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={closeCropModal}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b', cursor:'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleCropSave}
                  className="flex-grow-2 py-3.5 rounded-2xl text-sm font-black transition-all"
                  style={{ flex:2, background:'linear-gradient(135deg, #00c9a7, #00b894)', border:'none', color:'#060b14', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,201,167,0.35)' }}>
                  ✓ Crop & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── SimpleCrop (unchanged logic) ──────────────────────────────────────────
function SimpleCrop({ image, crop, zoom, rotation = 0, aspect, onCropChange, onZoomChange, onCropComplete }) {
  const [imgSize, setImgSize] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 300, height: 370 });
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeHandle = useRef(null);
  const dragStart = useRef({ x: 0, y: 0, boxX: 0, boxY: 0 });

  useEffect(() => {
    const img = new Image(); img.src = image;
    img.onload = () => {
      const container = containerRef.current; if (!container) return;
      const containerWidth = container.clientWidth; const containerHeight = container.clientHeight;
      const imgAspect = img.naturalWidth / img.naturalHeight; const containerAspect = containerWidth / containerHeight;
      let width, height;
      if (imgAspect > containerAspect) { width = containerWidth * 0.9; height = width / imgAspect; }
      else { height = containerHeight * 0.9; width = height * imgAspect; }
      setImgSize({ width, height, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
      const cropW = aspect ? Math.min(width * 0.6, containerWidth * 0.5) : 300;
      const cropH = aspect ? cropW / aspect : 370;
      setCropBox({ x: (containerWidth - cropW) / 2, y: (containerHeight - cropH) / 2, width: cropW, height: cropH });
    };
  }, [image, aspect]);

  const handleMouseDown = (e, handle) => {
    e.stopPropagation();
    if (handle) { isResizing.current = true; resizeHandle.current = handle; }
    else isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, boxX: cropBox.x, boxY: cropBox.y, boxW: cropBox.width, boxH: cropBox.height };
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      const deltaX = e.clientX - dragStart.current.x; const deltaY = e.clientY - dragStart.current.y;
      const container = containerRef.current;
      let newX = Math.max(0, Math.min(dragStart.current.boxX + deltaX, container.clientWidth - cropBox.width));
      let newY = Math.max(0, Math.min(dragStart.current.boxY + deltaY, container.clientHeight - cropBox.height));
      setCropBox(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing.current && !aspect) {
      const deltaX = e.clientX - dragStart.current.x; const deltaY = e.clientY - dragStart.current.y;
      const container = containerRef.current; const handle = resizeHandle.current;
      let newW = dragStart.current.boxW; let newH = dragStart.current.boxH;
      let newX = dragStart.current.boxX; let newY = dragStart.current.boxY;
      if (handle.includes('e')) newW += deltaX;
      if (handle.includes('w')) { newW -= deltaX; newX += deltaX; }
      if (handle.includes('s')) newH += deltaY;
      if (handle.includes('n')) { newH -= deltaY; newY += deltaY; }
      newW = Math.max(100, Math.min(newW, container.clientWidth - newX));
      newH = Math.max(100, Math.min(newH, container.clientHeight - newY));
      setCropBox({ x: newX, y: newY, width: newW, height: newH });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false; isResizing.current = false; resizeHandle.current = null;
    if (imgSize.naturalWidth > 0) {
      const container = containerRef.current;
      const imgX = (container.clientWidth - imgSize.width * zoom) / 2;
      const imgY = (container.clientHeight - imgSize.height * zoom) / 2;
      const scaleX = imgSize.naturalWidth / (imgSize.width * zoom);
      const scaleY = imgSize.naturalHeight / (imgSize.height * zoom);
      onCropComplete({ x:0, y:0, width:100, height:100 }, {
        x: Math.max(0, (cropBox.x - imgX) * scaleX), y: Math.max(0, (cropBox.y - imgY) * scaleY),
        width: cropBox.width * scaleX, height: cropBox.height * scaleY
      });
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    onZoomChange(Math.min(Math.max(1, zoom + e.deltaY * -0.01), 3));
  };

  useEffect(() => {
    if (aspect && cropBox.width > 0) {
      const newHeight = cropBox.width / aspect;
      const container = containerRef.current;
      if (container && cropBox.y + newHeight <= container.clientHeight)
        setCropBox(prev => ({ ...prev, height: newHeight }));
    }
  }, [aspect]);

  return (
    <div ref={containerRef}
      style={{ position:'absolute', top:0, left:0, right:0, bottom:0, overflow:'hidden', background:'rgba(0,0,0,0.85)' }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
      <div style={{ position:'absolute', left:'50%', top:'50%', transform:`translate(-50%, -50%) rotate(${rotation}deg) scale(${zoom})`, transformOrigin:'center', transition:'transform 0.1s' }}>
        <img src={image} alt="Crop" style={{ width:imgSize.width, height:imgSize.height, display:'block', pointerEvents:'none', userSelect:'none' }} draggable={false} />
      </div>
      <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, pointerEvents:'none' }}>
        <svg width="100%" height="100%" style={{ position:'absolute' }}>
          <defs>
            <mask id="cropMask">
              <rect width="100%" height="100%" fill="white" />
              <rect x={cropBox.x} y={cropBox.y} width={cropBox.width} height={cropBox.height} fill="black" rx="8" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#cropMask)" />
        </svg>
      </div>
      <div onMouseDown={(e) => handleMouseDown(e, null)}
        style={{ position:'absolute', left:cropBox.x, top:cropBox.y, width:cropBox.width, height:cropBox.height, border:'2.5px solid #00c9a7', borderRadius:8, cursor:'move', boxShadow:'0 0 0 1px rgba(0,0,0,0.4), 0 0 20px rgba(0,201,167,0.15)' }}>
        <div style={{ position:'absolute', top:'33.33%', left:0, right:0, height:1, background:'rgba(0,201,167,0.25)' }} />
        <div style={{ position:'absolute', top:'66.66%', left:0, right:0, height:1, background:'rgba(0,201,167,0.25)' }} />
        <div style={{ position:'absolute', left:'33.33%', top:0, bottom:0, width:1, background:'rgba(0,201,167,0.25)' }} />
        <div style={{ position:'absolute', left:'66.66%', top:0, bottom:0, width:1, background:'rgba(0,201,167,0.25)' }} />
        {!aspect && (
          <>
            {['nw','ne','sw','se'].map(pos => (
              <div key={pos} onMouseDown={(e) => handleMouseDown(e, pos)}
                style={{ position:'absolute', width:14, height:14, background:'#00c9a7', border:'2px solid #080e1a', borderRadius:'50%', cursor:`${pos}-resize`, zIndex:10,
                  ...(pos.includes('n') ? { top:-7 } : { bottom:-7 }), ...(pos.includes('w') ? { left:-7 } : { right:-7 }) }} />
            ))}
            {['n','e','s','w'].map(pos => (
              <div key={pos} onMouseDown={(e) => handleMouseDown(e, pos)}
                style={{ position:'absolute', background:'#00c9a7', border:'2px solid #080e1a', zIndex:10,
                  cursor:`${pos === 'n' || pos === 's' ? 'ns' : 'ew'}-resize`,
                  ...(pos === 'n' ? { top:-4, left:'50%', transform:'translateX(-50%)', width:28, height:7, borderRadius:4 } : {}),
                  ...(pos === 's' ? { bottom:-4, left:'50%', transform:'translateX(-50%)', width:28, height:7, borderRadius:4 } : {}),
                  ...(pos === 'e' ? { right:-4, top:'50%', transform:'translateY(-50%)', width:7, height:28, borderRadius:4 } : {}),
                  ...(pos === 'w' ? { left:-4, top:'50%', transform:'translateY(-50%)', width:7, height:28, borderRadius:4 } : {}) }} />
            ))}
          </>
        )}
        <div style={{ position:'absolute', top:-30, left:'50%', transform:'translateX(-50%)', background:'#00c9a7', color:'#060b14', padding:'3px 12px', borderRadius:6, fontSize:10, fontWeight:800, whiteSpace:'nowrap', letterSpacing:0.8, pointerEvents:'none' }}>
          {aspect ? 'PASSPORT RATIO' : 'FREE CROP'}
        </div>
      </div>
    </div>
  );
}