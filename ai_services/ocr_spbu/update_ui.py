import re

with open('static/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Colors
html = re.sub(r'--bg-base:\s*#[0-9a-fA-F]+;', '--bg-base:    #f8fafc;', html)
html = re.sub(r'--bg-surface:\s*#[0-9a-fA-F]+;', '--bg-surface: #ffffff;', html)
html = re.sub(r'--bg-card:\s*#[0-9a-fA-F]+;', '--bg-card:    #ffffff;', html)
html = re.sub(r'--bg-hover:\s*#[0-9a-fA-F]+;', '--bg-hover:   #f1f5f9;', html)

html = re.sub(r'--border:\s*rgba[^;]+;', '--border:     #e2e8f0;', html)
html = re.sub(r'--border-glow:\s*rgba[^;]+;', '--border-glow:rgba(152, 15, 18, 0.35);', html)

html = re.sub(r'--accent:\s*#[0-9a-fA-F]+;', '--accent:     #980f12;', html)
html = re.sub(r'--accent-2:\s*#[0-9a-fA-F]+;', '--accent-2:   #dc2626;', html)

html = re.sub(r'--text-primary:\s*#[0-9a-fA-F]+;', '--text-primary:   #0f172a;', html)
html = re.sub(r'--text-secondary:\s*#[0-9a-fA-F]+;', '--text-secondary: #334155;', html)
html = re.sub(r'--text-muted:\s*#[0-9a-fA-F]+;', '--text-muted:     #64748b;', html)

html = html.replace('rgba(56,189,248,0.12)', 'rgba(152, 15, 18, 0.12)')
html = html.replace('rgba(0,0,0,0.4)', 'rgba(0,0,0,0.05)')
html = html.replace('rgba(56,189,248,0.07)', 'rgba(152, 15, 18, 0.04)')
html = html.replace('rgba(129,140,248,0.07)', 'rgba(152, 15, 18, 0.04)')
html = html.replace('rgba(56,189,248,0.35)', 'rgba(152, 15, 18, 0.35)')
html = html.replace('rgba(56,189,248,0.03)', 'rgba(152, 15, 18, 0.03)')
html = html.replace('rgba(129,140,248,0.03)', 'rgba(152, 15, 18, 0.03)')
html = html.replace('rgba(56,189,248,0.08)', 'rgba(152, 15, 18, 0.08)')
html = html.replace('rgba(56,189,248,0.4)', 'rgba(152, 15, 18, 0.4)')
html = html.replace('rgba(56,189,248,0.3)', 'rgba(152, 15, 18, 0.3)')
html = html.replace('rgba(56,189,248,0.45)', 'rgba(152, 15, 18, 0.45)')
html = html.replace('rgba(56,189,248,0.1)', 'rgba(152, 15, 18, 0.1)')
html = html.replace('rgba(52,211,153,0.15)', 'rgba(16, 185, 129, 0.15)')

# Button text color
html = html.replace('color: #000;', 'color: #fff;')
html = html.replace('border-top-color: #000;', 'border-top-color: #fff;')
html = html.replace('background: linear-gradient(135deg, var(--accent), #0ea5e9);', 'background: linear-gradient(135deg, var(--accent), var(--accent-2));')

# 2. Emojis
html = html.replace('<div class="logo-icon">🔍</div>', '<div class="logo-icon"></div>')
html = html.replace('<span>📤</span> ', '')
html = html.replace('<span class="upload-icon">🚗</span>', '')
html = html.replace('<span>🔍 Deteksi Plat</span>', '<span>Deteksi Plat</span>')
html = html.replace('<span>✅</span> ', '')
html = html.replace('<span>🎯</span>', '')
html = html.replace('<span>📋</span> ', '')
html = html.replace('<button class="btn-search" id="search-btn" title="Cari">🔍</button>', '<button class="btn-search" id="search-btn" title="Cari">Cari</button>')
html = html.replace('<button class="btn-search" id="refresh-btn" title="Refresh">🔄</button>', '<button class="btn-search" id="refresh-btn" title="Refresh">Refresh</button>')
html = html.replace("const icons = { car: '🚗', motorcycle: '🏍️', truck: '🚛', bus: '🚌' };", "const icons = { car: '', motorcycle: '', truck: '', bus: '' };")
html = html.replace("`${icons[topEntry[0]] || '🚙'} ${topEntry[0]}`", "`${topEntry[0]}`")

with open('static/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
