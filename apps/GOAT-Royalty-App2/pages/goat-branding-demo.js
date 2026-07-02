// GOAT Branding Demo Page — GOAT Force Entertainment
import { useState } from 'react'
import { Crown, Music, Zap, Star, Shield, Globe, Download, Copy, Check, Palette, Layout, Type } from 'lucide-react'

const brandColors = {
  purple: { primary: '#8b5cf6', secondary: '#6d28d9', name: 'Royal Purple' },
  gold: { primary: '#f59e0b', secondary: '#d97706', name: 'GOAT Gold' },
  pink: { primary: '#ec4899', secondary: '#db2777', name: 'Neon Pink' },
  cyan: { primary: '#06b6d4', secondary: '#0891b2', name: 'Cyber Cyan' },
  green: { primary: '#10b981', secondary: '#059669', name: 'Money Green' },
  red: { primary: '#ef4444', secondary: '#dc2626', name: 'Flame Red' }
}

const logos = [
  { id: 'main', label: 'Main Logo', emoji: '🐐', tagline: 'GOAT FORCE ENTERTAINMENT' },
  { id: 'royalty', label: 'Royalty App', emoji: '💰', tagline: 'GOAT ROYALTY APP' },
  { id: 'music', label: 'Music Label', emoji: '🎵', tagline: 'FASTASSMAN PUBLISHING' },
  { id: 'studio', label: 'Sono Studio', emoji: '🎹', tagline: 'SONO PRODUCTION LAB' },
  { id: 'security', label: 'CyberWarrior', emoji: '🛡️', tagline: 'CYBERWARRIOR DIVISION' },
  { id: 'booking', label: 'Booking', emoji: '🎤', tagline: 'GOAT CONCERT BOOKING' }
]

const teamMembers = [
  { name: 'DJ Speedy', role: 'CEO / GOAT Force', aka: 'Harvey L. Miller Jr.', color: '#8b5cf6', emoji: '👑' },
  { name: 'Waka Flocka Flame', role: 'President / BrickSquad', aka: 'Juaquin Malphurs', color: '#f59e0b', emoji: '🔥' },
  { name: 'The GOAT', role: 'Core Team', aka: 'Kevin W. Hallingquest', color: '#10b981', emoji: '🐐' },
  { name: 'Baby GOAT', role: 'Core Team', aka: 'GOAT Force', color: '#06b6d4', emoji: '⭐' },
  { name: 'Ms. Moneypenny', role: 'AI Assistant', aka: 'Codex Sentinel AI', color: '#ec4899', emoji: '🤖' },
  { name: 'Codex', role: 'Sentinel AI', aka: 'Security Division', color: '#ef4444', emoji: '🛡️' }
]

const fontStyles = [
  { name: 'Impact', style: { fontFamily: 'Impact, sans-serif', letterSpacing: '0.1em' } },
  { name: 'Georgia', style: { fontFamily: 'Georgia, serif', letterSpacing: '0.05em' } },
  { name: 'Courier', style: { fontFamily: 'Courier New, monospace', letterSpacing: '0.15em' } },
  { name: 'Arial Black', style: { fontFamily: 'Arial Black, sans-serif', letterSpacing: '0.08em' } }
]

export default function GOATBrandingDemo() {
  const [activeColor, setActiveColor] = useState('purple')
  const [activeLogo, setActiveLogo] = useState('main')
  const [activeFont, setActiveFont] = useState(0)
  const [activeTab, setActiveTab] = useState('logos')
  const [copied, setCopied] = useState('')
  const [glowEffect, setGlowEffect] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  const color = brandColors[activeColor]
  const logo = logos.find(l => l.id === activeLogo)
  const font = fontStyles[activeFont]

  const copyColor = (hex) => {
    navigator.clipboard?.writeText(hex)
    setCopied(hex)
    setTimeout(() => setCopied(''), 2000)
  }

  const tabs = [
    { id: 'logos', label: 'Logos', icon: Crown },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'team', label: 'Team Cards', icon: Star },
    { id: 'banners', label: 'Banners', icon: Layout },
    { id: 'assets', label: 'Brand Assets', icon: Download }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#0a0a0a' : '#f8f8f8',
      color: darkMode ? '#fff' : '#111',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${color.secondary}22, #0a0a0a, ${color.primary}22)`,
        borderBottom: `1px solid ${color.primary}33`,
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🐐</div>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 900, margin: 0,
          background: `linear-gradient(135deg, ${color.primary}, #fff, ${color.secondary})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          GOAT FORCE BRANDING
        </h1>
        <p style={{ color: '#888', marginTop: '0.5rem' }}>Brand Identity & Design System</p>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setGlowEffect(!glowEffect)} style={{
            background: glowEffect ? `${color.primary}33` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${glowEffect ? color.primary : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#fff', cursor: 'pointer', fontSize: '0.8rem'
          }}>
            {glowEffect ? '✨ Glow ON' : '✨ Glow OFF'}
          </button>
          <button onClick={() => setDarkMode(!darkMode)} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#fff', cursor: 'pointer', fontSize: '0.8rem'
          }}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem', padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: activeTab === tab.id ? `${color.primary}22` : 'transparent',
            border: `1px solid ${activeTab === tab.id ? color.primary : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '0.5rem', padding: '0.5rem 1rem', color: activeTab === tab.id ? color.primary : '#888',
            cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* LOGOS TAB */}
        {activeTab === 'logos' && (
          <div>
            <h2 style={{ color: color.primary, marginBottom: '1.5rem' }}>🐐 Logo Variants</h2>

            {/* Color Picker */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {Object.entries(brandColors).map(([key, val]) => (
                <button key={key} onClick={() => setActiveColor(key)} style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${val.primary}, ${val.secondary})`,
                  border: activeColor === key ? '3px solid #fff' : '3px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s'
                }} title={val.name} />
              ))}
            </div>

            {/* Logo Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {logos.map(l => (
                <div key={l.id} onClick={() => setActiveLogo(l.id)} style={{
                  background: activeLogo === l.id ? `${color.primary}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeLogo === l.id ? color.primary : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '1rem', padding: '2rem', cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.2s',
                  boxShadow: glowEffect && activeLogo === l.id ? `0 0 30px ${color.primary}44` : 'none'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{l.emoji}</div>
                  <div style={{
                    fontSize: '1.4rem', fontWeight: 900,
                    background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    ...font.style
                  }}>
                    {l.tagline}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.5rem' }}>{l.label}</div>
                </div>
              ))}
            </div>

            {/* Main Logo Preview */}
            <div style={{
              marginTop: '2rem',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${color.primary}44`,
              borderRadius: '1.5rem', padding: '3rem', textAlign: 'center',
              boxShadow: glowEffect ? `0 0 60px ${color.primary}22` : 'none'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{logo.emoji}</div>
              <div style={{
                fontSize: '3rem', fontWeight: 900, letterSpacing: '0.1em',
                background: `linear-gradient(135deg, ${color.primary}, #fff, ${color.secondary})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                ...font.style
              }}>
                {logo.tagline}
              </div>
              <div style={{ color: '#555', marginTop: '0.5rem', fontSize: '0.9rem', letterSpacing: '0.3em' }}>
                EST. 2024 • LIFE IMITATES ART INC
              </div>
            </div>
          </div>
        )}

        {/* COLORS TAB */}
        {activeTab === 'colors' && (
          <div>
            <h2 style={{ color: color.primary, marginBottom: '1.5rem' }}>🎨 Brand Color Palette</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {Object.entries(brandColors).map(([key, val]) => (
                <div key={key} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '120px',
                    background: `linear-gradient(135deg, ${val.primary}, ${val.secondary})`,
                    boxShadow: glowEffect ? `inset 0 0 30px rgba(0,0,0,0.3)` : 'none'
                  }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{val.name}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                      {[val.primary, val.secondary].map(hex => (
                        <button key={hex} onClick={() => copyColor(hex)} style={{
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '0.5rem', padding: '0.4rem 0.75rem', color: '#ccc',
                          cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: hex }} />
                          {hex}
                          {copied === hex ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gradient Combos */}
            <h3 style={{ color: '#ccc', marginTop: '2rem', marginBottom: '1rem' }}>Gradient Combinations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {[
                { name: 'Royal Sunset', from: '#8b5cf6', to: '#ec4899' },
                { name: 'Money Moves', from: '#10b981', to: '#f59e0b' },
                { name: 'Cyber Storm', from: '#06b6d4', to: '#8b5cf6' },
                { name: 'Fire & Ice', from: '#ef4444', to: '#06b6d4' },
                { name: 'GOAT Gold', from: '#f59e0b', to: '#fbbf24' },
                { name: 'Midnight', from: '#1e1b4b', to: '#312e81' }
              ].map(g => (
                <div key={g.name} style={{
                  height: '80px', borderRadius: '0.75rem',
                  background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.9rem', color: '#fff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  cursor: 'pointer'
                }}>
                  {g.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TYPOGRAPHY TAB */}
        {activeTab === 'typography' && (
          <div>
            <h2 style={{ color: color.primary, marginBottom: '1.5rem' }}>✍️ Typography</h2>

            {/* Font Selector */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {fontStyles.map((f, i) => (
                <button key={f.name} onClick={() => setActiveFont(i)} style={{
                  background: activeFont === i ? `${color.primary}22` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeFont === i ? color.primary : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '0.5rem', padding: '0.5rem 1rem', color: activeFont === i ? color.primary : '#888',
                  cursor: 'pointer', ...f.style, fontSize: '0.9rem'
                }}>
                  {f.name}
                </button>
              ))}
            </div>

            {/* Type Scale */}
            {[
              { size: '4rem', weight: 900, label: 'Display / Hero', text: 'GOAT FORCE' },
              { size: '2.5rem', weight: 800, label: 'Heading 1', text: 'Music Royalty Platform' },
              { size: '1.75rem', weight: 700, label: 'Heading 2', text: 'FASTASSMAN Publishing Inc' },
              { size: '1.25rem', weight: 600, label: 'Heading 3', text: 'Royalty Management System' },
              { size: '1rem', weight: 400, label: 'Body Text', text: 'Manage your music royalties, track streams, and maximize earnings across all platforms.' },
              { size: '0.875rem', weight: 400, label: 'Small / Caption', text: 'Copyright © 2025 Harvey L. Miller Jr. / FASTASSMAN Publishing Inc. All rights reserved.' }
            ].map(t => (
              <div key={t.label} style={{
                padding: '1.5rem', marginBottom: '1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem'
              }}>
                <div style={{ color: '#555', fontSize: '0.75rem', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                  {t.label} — {t.size} / {t.weight}
                </div>
                <div style={{ fontSize: t.size, fontWeight: t.weight, color: '#fff', ...font.style, lineHeight: 1.2 }}>
                  {t.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TEAM CARDS TAB */}
        {activeTab === 'team' && (
          <div>
            <h2 style={{ color: color.primary, marginBottom: '1.5rem' }}>👑 GOAT Force Team</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {teamMembers.map(member => (
                <div key={member.name} style={{
                  background: `linear-gradient(135deg, ${member.color}15, rgba(0,0,0,0.8))`,
                  border: `1px solid ${member.color}44`,
                  borderRadius: '1.25rem', padding: '2rem', textAlign: 'center',
                  boxShadow: glowEffect ? `0 0 30px ${member.color}22` : 'none',
                  transition: 'all 0.3s'
                }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${member.color}, ${member.color}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', margin: '0 auto 1rem',
                    boxShadow: glowEffect ? `0 0 20px ${member.color}66` : 'none'
                  }}>
                    {member.emoji}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                    {member.name}
                  </div>
                  <div style={{ color: member.color, fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {member.role}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.8rem' }}>{member.aka}</div>
                  <div style={{
                    marginTop: '1rem', padding: '0.4rem 1rem',
                    background: `${member.color}22`, borderRadius: '2rem',
                    display: 'inline-block', color: member.color, fontSize: '0.75rem', fontWeight: 600
                  }}>
                    GOAT FORCE
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BANNERS TAB */}
        {activeTab === 'banners' && (
          <div>
            <h2 style={{ color: color.primary, marginBottom: '1.5rem' }}>🖼️ Banner Templates</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Wide Banner */}
              <div style={{
                background: `linear-gradient(135deg, #0a0a0a, ${color.primary}33, #0a0a0a)`,
                border: `1px solid ${color.primary}44`,
                borderRadius: '1rem', padding: '3rem 2rem', textAlign: 'center',
                boxShadow: glowEffect ? `0 0 40px ${color.primary}22` : 'none'
              }}>
                <div style={{ fontSize: '1rem', color: color.primary, letterSpacing: '0.3em', marginBottom: '0.5rem' }}>
                  LIFE IMITATES ART INC PRESENTS
                </div>
                <div style={{
                  fontSize: '3rem', fontWeight: 900, letterSpacing: '0.1em',
                  background: `linear-gradient(135deg, ${color.primary}, #fff, ${color.secondary})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                  🐐 GOAT ROYALTY APP
                </div>
                <div style={{ color: '#888', marginTop: '0.5rem' }}>
                  Music Royalty Management • AI-Powered • Enterprise Grade
                </div>
              </div>

              {/* Social Banner */}
              <div style={{
                background: `linear-gradient(135deg, ${color.secondary}, ${color.primary})`,
                borderRadius: '1rem', padding: '2rem', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>🐐 GOAT FORCE</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                    DJ Speedy • Waka Flocka Flame • BrickSquad
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>346 Works Registered</div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>$865K+ Royalties Tracked</div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>1.2B+ Streams</div>
                </div>
              </div>

              {/* Artist Card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { name: 'DJ Speedy', role: 'CEO', stats: '$285K/yr', emoji: '🎧' },
                  { name: 'Waka Flocka', role: 'President', stats: '$320K/yr', emoji: '🔥' }
                ].map(a => (
                  <div key={a.name} style={{
                    background: `linear-gradient(135deg, ${color.primary}22, rgba(0,0,0,0.8))`,
                    border: `1px solid ${color.primary}44`,
                    borderRadius: '1rem', padding: '2rem', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{a.emoji}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{a.name}</div>
                    <div style={{ color: color.primary, fontSize: '0.85rem', marginBottom: '0.5rem' }}>{a.role}</div>
                    <div style={{
                      background: `${color.primary}22`, borderRadius: '0.5rem',
                      padding: '0.5rem', color: '#10b981', fontWeight: 700
                    }}>
                      {a.stats}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BRAND ASSETS TAB */}
        {activeTab === 'assets' && (
          <div>
            <h2 style={{ color: color.primary, marginBottom: '1.5rem' }}>📦 Brand Assets</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'Primary Logo (SVG)', size: '12 KB', type: 'Vector', icon: '🐐', color: '#8b5cf6' },
                { name: 'Logo Dark BG (PNG)', size: '48 KB', type: 'Raster', icon: '🖼️', color: '#ec4899' },
                { name: 'Logo Light BG (PNG)', size: '52 KB', type: 'Raster', icon: '🖼️', color: '#f59e0b' },
                { name: 'Brand Guidelines (PDF)', size: '2.4 MB', type: 'Document', icon: '📄', color: '#10b981' },
                { name: 'Color Palette (ASE)', size: '4 KB', type: 'Swatch', icon: '🎨', color: '#06b6d4' },
                { name: 'Font Pack (ZIP)', size: '8.2 MB', type: 'Fonts', icon: '✍️', color: '#ef4444' },
                { name: 'Social Media Kit', size: '24 MB', type: 'Bundle', icon: '📱', color: '#8b5cf6' },
                { name: 'Press Kit (ZIP)', size: '18 MB', type: 'Bundle', icon: '📰', color: '#f59e0b' }
              ].map(asset => (
                <div key={asset.name} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem', padding: '1.5rem',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem'
                }}>
                  <div style={{ fontSize: '2rem' }}>{asset.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{asset.name}</div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>{asset.type} • {asset.size}</div>
                  </div>
                  <button style={{
                    background: `${asset.color}22`, border: `1px solid ${asset.color}44`,
                    borderRadius: '0.5rem', padding: '0.5rem', color: asset.color,
                    cursor: 'pointer', fontSize: '0.8rem', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                  }}>
                    <Download size={14} /> Download
                  </button>
                </div>
              ))}
            </div>

            {/* Brand Guidelines Summary */}
            <div style={{
              marginTop: '2rem',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${color.primary}44`,
              borderRadius: '1rem', padding: '2rem'
            }}>
              <h3 style={{ color: color.primary, marginBottom: '1rem' }}>📋 Brand Guidelines Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Primary Font', value: 'Inter / Impact' },
                  { label: 'Primary Color', value: '#8b5cf6 (Royal Purple)' },
                  { label: 'Secondary Color', value: '#f59e0b (GOAT Gold)' },
                  { label: 'Background', value: '#0a0a0a (Deep Black)' },
                  { label: 'Logo Clearspace', value: '2x logo height' },
                  { label: 'Min Logo Size', value: '32px height' },
                  { label: 'Brand Voice', value: 'Bold, Authentic, Elite' },
                  { label: 'Tagline', value: '"Life Imitates Art"' }
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '0.5rem', padding: '0.75rem'
                  }}>
                    <div style={{ color: '#666', fontSize: '0.75rem' }}>{item.label}</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}