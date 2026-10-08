import React, { useState, useRef } from 'react';
import { useAppState } from '../store/appState';
import {
  Upload,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Link as LinkIcon,
  Smile,
  Sliders,
  X,
  Camera,
} from 'lucide-react';

export interface AvatarPickerProps {
  currentAvatar: string;
  onAvatarSelect: (avatarUrl: string) => void;
  className?: string;
}

const PRESET_AVATARS = [
  // 3D & Tech Avatars (Dicebear Bottts & Adventurer)
  {
    category: '3D & Tech',
    items: [
      { id: 'tech-1', name: 'Cyber Blue', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBlue&backgroundColor=0284c7' },
      { id: 'tech-2', name: 'Quantum Purple', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuantumAI&backgroundColor=7c3aed' },
      { id: 'tech-3', name: 'Matrix Green', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MatrixGreen&backgroundColor=059669' },
      { id: 'tech-4', name: 'Titan Orange', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TitanOrange&backgroundColor=ea580c' },
      { id: 'tech-5', name: 'Echo Neon', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=EchoNeon&backgroundColor=db2777' },
    ],
  },
  // Modern Illustrative (Adventurer & Lorelei)
  {
    category: 'Modern Characters',
    items: [
      { id: 'char-1', name: 'Alex Explorer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlexExplorer&backgroundColor=b6e3f4' },
      { id: 'char-2', name: 'Priya Artist', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=PriyaArtist&backgroundColor=ffd5dc' },
      { id: 'char-3', name: 'Elena Architect', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ElenaArchitect&backgroundColor=c0aede' },
      { id: 'char-4', name: 'Kenji Coder', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiCoder&backgroundColor=d1d4f9' },
      { id: 'char-5', name: 'Karthik Leader', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=KarthikLeader&backgroundColor=ffdfbf' },
    ],
  },
  // Realistic Professional Portraits
  {
    category: 'Professional',
    items: [
      { id: 'prof-1', name: 'Professional Blue', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
      { id: 'prof-2', name: 'Executive Modern', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
      { id: 'prof-3', name: 'Creative Tech', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
      { id: 'prof-4', name: 'Product Lead', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' },
      { id: 'prof-5', name: 'Global Analyst', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  // Minimalist Avatars
  {
    category: 'Minimalist & Fun',
    items: [
      { id: 'fun-1', name: 'Cosmic Star', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=CosmicStar&backgroundColor=6366f1' },
      { id: 'fun-2', name: 'Solar Smile', url: 'https://api.dicebear.com/7.x/personas/svg?seed=SolarSmile&backgroundColor=f59e0b' },
      { id: 'fun-3', name: 'Aqua Nova', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AquaNova&backgroundColor=06b6d4' },
      { id: 'fun-4', name: 'Ruby Glow', url: 'https://api.dicebear.com/7.x/micah/svg?seed=RubyGlow&backgroundColor=f43f5e' },
      { id: 'fun-5', name: 'Emerald Wave', url: 'https://api.dicebear.com/7.x/personas/svg?seed=EmeraldWave&backgroundColor=10b981' },
    ],
  },
];

const DICEBEAR_STYLES = [
  { id: 'bottts', label: 'Robots & Tech (Bottts)' },
  { id: 'adventurer', label: 'Adventurer Characters' },
  { id: 'lorelei', label: 'Lorelei Artistic' },
  { id: 'avataaars', label: 'Avataaars Modern' },
  { id: 'personas', label: 'Personas Minimalist' },
  { id: 'micah', label: 'Micah Stylized' },
  { id: 'thumbs', label: 'Thumbs & Emotes' },
];

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatar,
  onAvatarSelect,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'generator' | 'upload' | 'url'>('presets');
  const [selectedCategory, setSelectedCategory] = useState<string>('3D & Tech');
  const [generatorStyle, setGeneratorStyle] = useState<string>('bottts');
  const [generatorSeed, setGeneratorSeed] = useState<string>('linguachat_' + Math.floor(Math.random() * 1000));
  const [customUrl, setCustomUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate dynamic DiceBear avatar URL
  const currentGeneratedUrl = `https://api.dicebear.com/7.x/${generatorStyle}/svg?seed=${encodeURIComponent(
    generatorSeed || 'linguachat'
  )}`;

  const handleRandomizeSeed = () => {
    setIsGenerating(true);
    const words = ['cyber', 'titan', 'echo', 'nova', 'zenith', 'pulse', 'orbit', 'helix', 'vortex', 'aura'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomNum = Math.floor(Math.random() * 9000 + 1000);
    const newSeed = `${randomWord}_${randomNum}`;
    setGeneratorSeed(newSeed);
    const newUrl = `https://api.dicebear.com/7.x/${generatorStyle}/svg?seed=${encodeURIComponent(newSeed)}`;
    onAvatarSelect(newUrl);
    setTimeout(() => setIsGenerating(false), 300);
  };

  const handleStyleChange = (style: string) => {
    setGeneratorStyle(style);
    const newUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(
      generatorSeed || 'linguachat'
    )}`;
    onAvatarSelect(newUrl);
  };

  const { addNotification } = useAppState();

  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addNotification({
        title: '⚠️ Invalid File',
        message: 'Please upload a valid image file (PNG, JPG, WebP, SVG).',
        type: 'warning',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addNotification({
        title: '⚠️ File Too Large',
        message: 'Image file size must be under 5MB.',
        type: 'warning',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onAvatarSelect(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    try {
      new URL(customUrl);
      onAvatarSelect(customUrl.trim());
      setUrlError(null);
    } catch {
      setUrlError('Please enter a valid HTTP/HTTPS image URL');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Header Banner */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
        <div className="relative group shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-indigo-500/30 bg-slate-900 shadow-xl flex items-center justify-center relative">
            <img
              src={currentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt="Current Avatar"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity rounded-2xl"
              title="Click to upload image"
            >
              <Camera className="w-5 h-5 text-indigo-300" />
              <span className="text-[9px] font-semibold mt-0.5">Upload</span>
            </button>
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-950 flex items-center justify-center text-[8px] text-white font-bold">
            ✓
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h4 className="text-sm font-bold text-white">Profile Avatar & Visual Identity</h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              Live Synced
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Choose a preset avatar, generate unique customized styles, or upload your own photo.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRandomizeSeed}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:scale-102"
            title="Generate Random Avatar"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Randomize</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'presets'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Smile className="w-3.5 h-3.5" />
          <span>Preset Library</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('generator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'generator'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Avatar Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Image</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'url'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Image URL</span>
        </button>
      </div>

      {/* TAB 1: Preset Library */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_AVATARS.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.category
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* Avatars Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            {PRESET_AVATARS.find((c) => c.category === selectedCategory)?.items.map((avatar) => {
              const isSelected = currentAvatar === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => onAvatarSelect(avatar.url)}
                  className={`relative group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 ring-2 ring-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'hover:bg-slate-900/80'
                  }`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-900 ring-1 ring-slate-800 relative">
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium truncate max-w-[70px] text-center">
                    {avatar.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Interactive Avatar Studio */}
      {activeTab === 'generator' && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Style Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Avatar Style</label>
              <select
                value={generatorStyle}
                onChange={(e) => handleStyleChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {DICEBEAR_STYLES.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Seed Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Custom Character Seed / Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatorSeed}
                  onChange={(e) => {
                    setGeneratorSeed(e.target.value);
                    const newUrl = `https://api.dicebear.com/7.x/${generatorStyle}/svg?seed=${encodeURIComponent(
                      e.target.value || 'linguachat'
                    )}`;
                    onAvatarSelect(newUrl);
                  }}
                  placeholder="e.g. Alex, CyberBot, Ninja"
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleRandomizeSeed}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Randomize Seed"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Live Studio Preview Row */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <img
                src={currentGeneratedUrl}
                alt="Generated Avatar"
                className="w-12 h-12 rounded-xl bg-slate-800 ring-2 ring-indigo-500/40 p-0.5"
              />
              <div>
                <div className="text-xs font-bold text-white">Generated: {generatorSeed}</div>
                <div className="text-[11px] text-indigo-400 capitalize">{generatorStyle} style</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAvatarSelect(currentGeneratedUrl)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply This Avatar</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Upload Custom Image */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              dragOver
                ? 'border-indigo-500 bg-indigo-950/40'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Click to browse or drag & drop user photo
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports PNG, JPG, WebP, SVG, or GIF (max 5MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Image URL Direct Loader */}
      {activeTab === 'url' && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Paste Direct Web Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setUrlError(null);
              }}
              placeholder="https://example.com/my-photo.jpg"
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shrink-0"
            >
              Load Avatar
            </button>
          </div>
          {urlError && <p className="text-xs text-rose-400">{urlError}</p>}
        </div>
      )}
    </div>
  );
};
