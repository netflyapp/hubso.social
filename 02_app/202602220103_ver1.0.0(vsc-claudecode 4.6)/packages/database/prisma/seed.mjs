import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seedowanie bazy danych...')

  // ─── Cleanup ────────────────────────────
  const models = [
    'eventAttendee', 'event', 'groupMember', 'group',
    'reaction', 'comment', 'post', 'spaceMember', 'space',
    'spaceGroup', 'communityMember', 'community', 'follow',
    'notification', 'user',
  ]
  for (const m of models) {
    await prisma[m].deleteMany()
  }

  // ─── Password hash ──────────────────────
  const passwordHash = await bcryptjs.hash('Test1234!', 10)

  // ─── Users ──────────────────────────────
  console.log('👤 Tworzenie użytkowników...')

  const [admin, anna, tomek, zofia, marek] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'test@hubso.pl',
        username: 'testhubso',
        displayName: 'Test Admin',
        passwordHash,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testhubso',
        bio: 'Administrator platformy Hubso.social.',
        role: 'ADMIN',
        socialLinks: { twitter: 'https://twitter.com/hubso', linkedin: 'https://linkedin.com/in/hubso' },
      },
    }),
    prisma.user.create({
      data: {
        email: 'anna.kowalska@example.pl',
        username: 'annakowalska',
        displayName: 'Anna Kowalska',
        passwordHash,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=annakowalska',
        bio: 'Pasjonatka zdrowia, jogi i zdrowego gotowania.',
        socialLinks: { instagram: 'https://instagram.com/anna.zdrowie' },
      },
    }),
    prisma.user.create({
      data: {
        email: 'tomek.nowak@example.pl',
        username: 'tomeknowak',
        displayName: 'Tomasz Nowak',
        passwordHash,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tomeknowak',
        bio: 'Przedsiębiorca, podcaster. Buduję społeczność wokół przedsiębiorczości.',
        socialLinks: { twitter: 'https://twitter.com/tomeknowak', linkedin: 'https://linkedin.com/in/tomeknowak' },
      },
    }),
    prisma.user.create({
      data: {
        email: 'zofia.wisniewska@example.pl',
        username: 'zofiawisniewska',
        displayName: 'Zofia Wiśniewska',
        passwordHash,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zofiawisniewska',
        bio: 'Fotografka, artystka. Dokumentuję piękno codzienności przez obiektyw.',
        socialLinks: { instagram: 'https://instagram.com/zofia.foto' },
      },
    }),
    prisma.user.create({
      data: {
        email: 'marek.zielinski@example.pl',
        username: 'marekzielinski',
        displayName: 'Marek Zieliński',
        passwordHash,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marekzielinski',
        bio: 'Programista, entuzjasta open-source i nowych technologii.',
        socialLinks: { github: 'https://github.com/marekzielinski', twitter: 'https://twitter.com/marekz_tech' },
      },
    }),
  ])

  // ─── Follows ────────────────────────────
  const followPairs = [
    [anna.id, tomek.id], [anna.id, zofia.id], [tomek.id, anna.id],
    [tomek.id, marek.id], [zofia.id, anna.id], [marek.id, tomek.id],
    [marek.id, admin.id], [admin.id, anna.id],
  ]
  for (const [followerId, followingId] of followPairs) {
    await prisma.follow.create({ data: { followerId, followingId } })
  }

  // ─── Communities ────────────────────────
  console.log('🏘  Tworzenie społeczności...')

  const [demo, fit, biz, foto, dev] = await Promise.all([
    prisma.community.create({ data: { name: 'Hubso Demo', slug: 'hubso-demo', description: 'Oficjalna społeczność demonstracyjna platformy Hubso.social.', brandColor: '#6366f1', brandFont: 'Inter', plan: 'GROWTH', ownerId: admin.id } }),
    prisma.community.create({ data: { name: 'Fit & Zdrowie', slug: 'fit-zdrowie', description: 'Zdrowy styl życia, dieta i aktywność fizyczna.', brandColor: '#22c55e', brandFont: 'Plus Jakarta Sans', plan: 'STARTER', ownerId: anna.id } }),
    prisma.community.create({ data: { name: 'Polscy Przedsiębiorcy', slug: 'polscy-przedsiebiorcy', description: 'Founderzy, freelancerzy i przedsiębiorcy z Polski.', brandColor: '#f59e0b', brandFont: 'Inter', plan: 'GROWTH', ownerId: tomek.id } }),
    prisma.community.create({ data: { name: 'Fotografia Polska', slug: 'fotografia-polska', description: 'Pasjonaci fotografii. Dzielimy się pracami i technikami.', brandColor: '#ec4899', brandFont: 'Plus Jakarta Sans', plan: 'STARTER', ownerId: zofia.id } }),
    prisma.community.create({ data: { name: 'Dev Community PL', slug: 'dev-community-pl', description: 'Polska społeczność programistów.', brandColor: '#0ea5e9', brandFont: 'Inter', plan: 'SCALE', ownerId: marek.id } }),
  ])

  // ─── Memberships ────────────────────────
  const memberships = [
    { communityId: demo.id, userId: admin.id, role: 'OWNER' },
    { communityId: demo.id, userId: anna.id, role: 'MEMBER' },
    { communityId: demo.id, userId: tomek.id, role: 'MEMBER' },
    { communityId: demo.id, userId: zofia.id, role: 'MEMBER' },
    { communityId: demo.id, userId: marek.id, role: 'ADMIN' },
    { communityId: fit.id, userId: anna.id, role: 'OWNER' },
    { communityId: fit.id, userId: admin.id, role: 'MEMBER' },
    { communityId: fit.id, userId: zofia.id, role: 'MEMBER' },
    { communityId: biz.id, userId: tomek.id, role: 'OWNER' },
    { communityId: biz.id, userId: admin.id, role: 'MEMBER' },
    { communityId: biz.id, userId: marek.id, role: 'MEMBER' },
    { communityId: foto.id, userId: zofia.id, role: 'OWNER' },
    { communityId: foto.id, userId: anna.id, role: 'MEMBER' },
    { communityId: dev.id, userId: marek.id, role: 'OWNER' },
    { communityId: dev.id, userId: admin.id, role: 'MEMBER' },
    { communityId: dev.id, userId: tomek.id, role: 'MEMBER' },
  ]
  for (const m of memberships) {
    await prisma.communityMember.upsert({
      where: { communityId_userId: { communityId: m.communityId, userId: m.userId } },
      update: {},
      create: m,
    })
  }

  // ─── Spaces ─────────────────────────────
  console.log('📂 Tworzenie przestrzeni...')

  const [demoGrp, fitGrp, bizGrp, devGrp] = await Promise.all([
    prisma.spaceGroup.create({ data: { communityId: demo.id, name: 'Ogólne', position: 0 } }),
    prisma.spaceGroup.create({ data: { communityId: fit.id, name: 'Główne', position: 0 } }),
    prisma.spaceGroup.create({ data: { communityId: biz.id, name: 'Ogólne', position: 0 } }),
    prisma.spaceGroup.create({ data: { communityId: dev.id, name: 'Ogólne', position: 0 } }),
  ])

  const [demoFeed, fitPosts, fitEventsSpace, bizPosts, devPosts] = await Promise.all([
    prisma.space.create({ data: { communityId: demo.id, spaceGroupId: demoGrp.id, name: 'Feed', type: 'POSTS', visibility: 'PUBLIC' } }),
    prisma.space.create({ data: { communityId: fit.id, spaceGroupId: fitGrp.id, name: 'Posty', type: 'POSTS', visibility: 'PUBLIC' } }),
    prisma.space.create({ data: { communityId: fit.id, spaceGroupId: fitGrp.id, name: 'Wydarzenia', type: 'EVENTS', visibility: 'PUBLIC' } }),
    prisma.space.create({ data: { communityId: biz.id, spaceGroupId: bizGrp.id, name: 'Dyskusje', type: 'POSTS', visibility: 'PUBLIC' } }),
    prisma.space.create({ data: { communityId: dev.id, spaceGroupId: devGrp.id, name: 'Tech Talk', type: 'POSTS', visibility: 'PUBLIC' } }),
  ])

  // ─── Posts ──────────────────────────────
  console.log('📝 Tworzenie postów...')

  const doc = (text) => ({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  })

  const posts = await Promise.all([
    prisma.post.create({ data: { spaceId: demoFeed.id, authorId: admin.id, content: doc('Witajcie w Hubso.social! To oficjalna platforma demonstracyjna. Sprawdź posty, komentarze, grupy, wydarzenia i wiadomości prywatne.'), type: 'TEXT', status: 'PUBLISHED', pinned: true, featured: true, reactionsCount: { LIKE: 12, FIRE: 5, LOVE: 3 } } }),
    prisma.post.create({ data: { spaceId: fitPosts.id, authorId: anna.id, content: doc('Właśnie skończyłam 30-dniowe wyzwanie jogi! Klucz to regularne małe kroki. Kto chce dołączyć do kolejnej edycji?'), type: 'TEXT', status: 'PUBLISHED', reactionsCount: { LIKE: 8, LOVE: 14, FIRE: 2 } } }),
    prisma.post.create({ data: { spaceId: fitPosts.id, authorId: anna.id, content: doc('Smoothie po treningu: szpinak, banan, mleko migdałowe, masło orzechowe i cynamon. Polecam!'), type: 'TEXT', status: 'PUBLISHED', reactionsCount: { LIKE: 6, LOVE: 4 } } }),
    prisma.post.create({ data: { spaceId: bizPosts.id, authorId: tomek.id, content: doc('Największy błąd w pierwszym biznesie: skupiałem się na produkcie, nie na kliencie. Po 6 miesiącach zacząłem budować to, czego ludzie potrzebują.'), type: 'TEXT', status: 'PUBLISHED', pinned: true, reactionsCount: { LIKE: 23, FIRE: 11, LOVE: 7 } } }),
    prisma.post.create({ data: { spaceId: devPosts.id, authorId: marek.id, content: doc('Wdrożyłem Turborepo w monorepo — czas builda z 8 minut spadł do 45 sekund dzięki cachowaniu. Ktoś używa remote cache?'), type: 'TEXT', status: 'PUBLISHED', reactionsCount: { LIKE: 15, FIRE: 9, WOW: 6 } } }),
    prisma.post.create({ data: { spaceId: devPosts.id, authorId: marek.id, content: doc('TypeScript 5.4 Preserved Narrowing in Closures to game-changer dla kodu asynchronicznego. Polecam release notes.'), type: 'TEXT', status: 'PUBLISHED', reactionsCount: { LIKE: 10, WOW: 4 } } }),
  ])

  // ─── Comments ───────────────────────────
  console.log('💬 Tworzenie komentarzy...')

  await Promise.all([
    prisma.comment.create({ data: { postId: posts[0].id, authorId: anna.id, content: doc('Super platforma! Interfejs bardzo intuicyjny. Czekam na więcej funkcji') } }),
    prisma.comment.create({ data: { postId: posts[0].id, authorId: marek.id, content: doc('Bardzo podoba mi się system przestrzeni. Dobrze przemyślana architektura.') } }),
    prisma.comment.create({ data: { postId: posts[1].id, authorId: zofia.id, content: doc('Brawo Ania! Motywujesz mnie. Jakiej aplikacji używasz do śledzenia treningów?') } }),
    prisma.comment.create({ data: { postId: posts[3].id, authorId: admin.id, content: doc('Złota zasada: fall in love with the problem, not the solution.') } }),
    prisma.comment.create({ data: { postId: posts[4].id, authorId: tomek.id, content: doc('Remote cache na własnym S3 — darmowy i działa świetnie.') } }),
  ])

  // ─── Events ─────────────────────────────
  console.log('📅 Tworzenie wydarzeń...')

  const now = new Date()
  await Promise.all([
    prisma.event.create({ data: { spaceId: fitEventsSpace.id, creatorId: anna.id, title: 'Warsztaty Jogi Online — poziom podstawowy', description: 'Godzinne warsztaty jogi dla poczatkujacych.', startsAt: new Date(now.getTime() + 7 * 86400000), endsAt: new Date(now.getTime() + 7 * 86400000 + 3600000), locationType: 'VIRTUAL', location: 'Zoom — link po zapisaniu', maxAttendees: 30 } }),
    prisma.event.create({ data: { spaceId: fitEventsSpace.id, creatorId: anna.id, title: 'Bieg Poranny — Warszawa Lazienki', description: 'Wspolny poranek z biegiem w parku Lazienkowskim.', startsAt: new Date(now.getTime() + 3 * 86400000), endsAt: new Date(now.getTime() + 3 * 86400000 + 5400000), locationType: 'IN_PERSON', location: 'Park Lazienkowski, Warszawa' } }),
  ])

  // ─── Group ──────────────────────────────
  console.log('👥 Tworzenie grup...')

  const veganGroup = await prisma.group.create({
    data: { communityId: fit.id, name: 'Weganie i Wegetarianie', description: 'Przepisy, porady, wsparcie dla diety roslinnej.', visibility: 'PUBLIC', memberCount: 2 },
  })
  await prisma.groupMember.create({ data: { groupId: veganGroup.id, userId: anna.id, role: 'OWNER' } })
  await prisma.groupMember.create({ data: { groupId: veganGroup.id, userId: zofia.id, role: 'MEMBER' } })

  // ─── Done ───────────────────────────────
  console.log('\n✅ Seedowanie zakonczone pomyslnie!')
  console.log('\n📋 Dane testowe:')
  console.log('   Email:  test@hubso.pl')
  console.log('   Haslo:  Test1234!')
  console.log('   Uzytkownicy: 5 | Spolecznosci: 5 | Posty: 6 | Komentarze: 5 | Wydarzenia: 2 | Grupy: 1')
}

main()
  .catch((e) => { console.error('Blad seedowania:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
