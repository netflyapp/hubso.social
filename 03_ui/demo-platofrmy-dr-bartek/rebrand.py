#!/usr/bin/env python3
"""Rebranding script for Dr Bartek platform - FAZA 1"""
import os, re, glob

DIR = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(DIR, '*.html')))

# New header nav (will be inserted in each file with correct active state)
NEW_HEADER_NAV_ITEMS = [
    ('home-full.html', 'solar:feed-linear'),
    ('profile.html', 'solar:user-circle-linear'),
    ('groups.html', 'solar:users-group-rounded-linear'),
    ('messages.html', 'solar:chat-round-dots-linear'),
    ('members.html', 'solar:user-plus-linear'),
    ('forums.html', 'solar:chat-line-linear'),
    ('courses.html', 'solar:square-academic-cap-linear'),
    ('events.html', 'solar:calendar-linear'),
    ('shop.html', 'solar:bag-4-linear'),
    ('documents.html', 'solar:document-text-linear'),
    ('recipes.html', 'solar:chef-hat-linear'),
    ('video.html', 'solar:videocamera-linear'),
    ('apps.html', 'solar:calculator-linear'),
    ('health-journal.html', 'solar:heart-pulse-linear'),
]

# Map filenames to their active header link
# home.html also activates home-full.html
ACTIVE_MAP = {
    'home.html': 'home-full.html',
    'home-full.html': 'home-full.html',
    'profile.html': 'profile.html',
    'groups.html': 'groups.html',
    'group-detail.html': 'groups.html',
    'messages.html': 'messages.html',
    'members.html': 'members.html',
    'forums.html': 'forums.html',
    'courses.html': 'courses.html',
    'course-detail.html': 'courses.html',
    'events.html': 'events.html',
    'shop.html': 'shop.html',
    'documents.html': 'documents.html',
    'photos.html': 'home-full.html',
    'notifications.html': 'home-full.html',
    'recipes.html': 'recipes.html',
    'video.html': 'video.html',
    'apps.html': 'apps.html',
    'health-journal.html': 'health-journal.html',
}

def build_header_nav(active_href):
    lines = []
    for href, icon in NEW_HEADER_NAV_ITEMS:
        if href == active_href:
            cls = 'h-full flex items-center border-b-[2px] border-emerald-600 px-3 text-emerald-600 dark:text-emerald-400'
        else:
            cls = 'h-full flex items-center border-b-[2px] border-transparent px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'
        lines.append(f'            <a href="{href}" class="{cls}"><iconify-icon icon="{icon}" width="24" height="24"></iconify-icon></a>')
    return '\n'.join(lines)

# Sidebar link helper
SB_NORMAL = 'flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
SB_ACTIVE = 'flex items-center gap-3 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-md'

SIDEBAR_LINKS = [
    # (section_title, [(href, icon, label), ...])
    ('Osobisty', [
        ('profile.html', 'solar:user-circle-linear', 'Mój profil'),
        ('home.html', 'solar:graph-up-linear', 'Moja oś czasu'),
        ('messages.html', 'solar:inbox-linear', 'Moja skrzynka'),
        ('health-journal.html', 'solar:heart-pulse-linear', 'Dziennik Zdrowia'),
    ]),
    ('Wspólnota', [
        ('groups.html', 'solar:users-group-rounded-linear', 'Moje grupy'),
        ('members.html', 'solar:user-plus-linear', 'Moje połączenia'),
        ('forums.html', 'solar:chat-line-linear', 'Moje dyskusje'),
        ('courses.html', 'solar:diploma-linear', 'Moje kursy'),
        ('events.html', 'solar:calendar-linear', 'Wydarzenia'),
    ]),
    ('Zdrowie & Wiedza', [
        ('recipes.html', 'solar:chef-hat-linear', 'Przepisy'),
        ('video.html', 'solar:videocamera-linear', 'Video & Wiedza'),
        ('apps.html', 'solar:calculator-linear', 'Narzędzia'),
    ]),
    ('Multimedia', [
        ('photos.html', 'solar:gallery-linear', 'Moje zdjęcia'),
        ('documents.html', 'solar:folder-linear', 'Moje dokumenty'),
    ]),
    ('Sklep', [
        ('shop.html', 'solar:bag-4-linear', 'Sklep'),
    ]),
]

# Map filename to active sidebar link
SIDEBAR_ACTIVE_MAP = {
    'home.html': 'home.html',
    'home-full.html': 'home.html',
    'profile.html': 'profile.html',
    'groups.html': 'groups.html',
    'group-detail.html': 'groups.html',
    'messages.html': 'messages.html',
    'members.html': 'members.html',
    'forums.html': 'forums.html',
    'courses.html': 'courses.html',
    'course-detail.html': 'courses.html',
    'events.html': 'events.html',
    'shop.html': 'shop.html',
    'documents.html': 'documents.html',
    'photos.html': 'photos.html',
    'notifications.html': 'messages.html',
    'recipes.html': 'recipes.html',
    'video.html': 'video.html',
    'apps.html': 'apps.html',
    'health-journal.html': 'health-journal.html',
}

def build_sidebar(active_href):
    sections = []
    for title, links in SIDEBAR_LINKS:
        items = []
        items.append(f'                    <div class="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</div>')
        for href, icon, label in links:
            cls = SB_ACTIVE if href == active_href else SB_NORMAL
            if href == 'messages.html' and active_href != 'messages.html':
                # Special: messages has badge
                items.append(f'                    <a href="{href}" class="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"><div class="flex items-center gap-3"><iconify-icon icon="{icon}" width="20" height="20"></iconify-icon>{label}</div><span class="bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold px-1.5 py-0.5 rounded">3</span></a>')
            elif href == 'messages.html' and active_href == 'messages.html':
                items.append(f'                    <a href="{href}" class="flex items-center justify-between px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-md"><div class="flex items-center gap-3"><iconify-icon icon="{icon}" width="20" height="20"></iconify-icon>{label}</div><span class="bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-1.5 py-0.5 rounded">3</span></a>')
            else:
                items.append(f'                    <a href="{href}" class="{cls}"><iconify-icon icon="{icon}" width="20" height="20"></iconify-icon>{label}</a>')
        sections.append('                <div class="space-y-1">\n' + '\n'.join(items) + '\n                </div>')
    return '\n'.join(sections)

# New logo HTML
NEW_LOGO = '''<a href="home-full.html" class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-[#2D8F4E] flex items-center justify-center text-white"><iconify-icon icon="solar:heart-pulse-bold" width="20" height="20"></iconify-icon></div>
                <div class="flex flex-col"><span class="font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none text-sm">Dr Bartek</span><span class="font-medium text-slate-500 text-xs tracking-tight">Społeczność Zdrowia</span></div>
            </a>'''

for fpath in files:
    fname = os.path.basename(fpath)
    print(f'Processing: {fname}')
    
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace brand color #F05837 → #2D8F4E
    content = content.replace('#F05837', '#2D8F4E')
    
    # 2. Replace tailwind config brand color
    content = content.replace("brand: { orange: '#2D8F4E'", "brand: { green: '#2D8F4E'")
    
    # 3. Replace indigo active states to emerald in header nav (will be rebuilt anyway)
    # But also keep indigo for other non-nav elements
    
    # 4. Replace title
    content = re.sub(r'<title>(.*?) — Online Communities</title>', 
                     lambda m: f'<title>{m.group(1)} — Dr Bartek | Społeczność Zdrowia</title>', content)
    
    # 5. Replace logo block
    logo_pattern = r'<a href="home-full\.html" class="flex items-center gap-2\.5">\s*<div class="w-8 h-8 rounded-full bg-\[#2D8F4E\] flex items-center justify-center text-white">.*?</div>\s*<div class="flex flex-col">.*?</div>\s*</a>'
    content = re.sub(logo_pattern, NEW_LOGO, content, flags=re.DOTALL)
    
    # 6. Replace header nav
    active_header = ACTIVE_MAP.get(fname, 'home-full.html')
    new_nav = build_header_nav(active_header)
    nav_pattern = r'<nav class="hidden md:flex items-center h-full gap-1">\s*(?:<a href=".*?".*?</a>\s*)+</nav>'
    content = re.sub(nav_pattern, f'<nav class="hidden md:flex items-center h-full gap-1">\n{new_nav}\n        </nav>', content, flags=re.DOTALL)
    
    # 7. Replace sidebar nav
    active_sidebar = SIDEBAR_ACTIVE_MAP.get(fname, 'home.html')
    new_sidebar = build_sidebar(active_sidebar)
    sidebar_pattern = r'(<nav class="flex-1 px-4 space-y-8">)\s*(?:<div class="space-y-1">.*?</div>\s*)+\s*(</nav>)'
    new_sidebar_full = f'\\1\n{new_sidebar}\n            \\2'
    content = re.sub(sidebar_pattern, new_sidebar_full, content, flags=re.DOTALL)
    
    # 8. Replace any remaining indigo references in sidebar (already handled by rebuild)
    # But replace indigo in header active states
    # Already done via build_header_nav with emerald
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'  ✓ Done: {fname}')

print('\n✅ Rebranding complete for all files!')
