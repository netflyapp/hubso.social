import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

const HASH_ROUNDS = 10

async function hash(password: string) {
  return bcryptjs.hash(password, HASH_ROUNDS)
}

async function main() {
  console.log('🌱 Rozpoczynam seedowanie bazy danych...')

  // ─── Cleanup ──────────────────────────────────────────────────
  await prisma.eventAttendee.deleteMany()
  await prisma.event.deleteMany()
  await prisma.groupMember.deleteMany()
  await prisma.group.deleteMany()
  await prisma.reaction.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.spaceMember.deleteMany()
  await prisma.space.deleteMany()
  await prisma.spaceGroup.deleteMany()
  await prisma.communityMember.deleteMany()
  await prisma.community.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.user.deleteMany()

  // ─── Users ────────────────────────────────────────────────────
  console.log('👤 Tworzenie użytkowników...')

  const passwordHash = await hash('Test1234!')

  const [admin, anna, tomek, zofia, marek] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'test@hubso.pl',
        username: 'testhubso',
        displayName: 'Test Admin',
        passwordHash,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testhubso',
        bio: 'Administrator platformy Hubso.social. Tutaj testujemy funkcje.',
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
        bio: 'Pasjonatka zdrowia, jogi i zdrowego gotowania. Prowadzę warsztaty online.',
        socialLinks: { instagram: 'https://instagram.com/anna.zdrowie', youtube: 'https://youtube.com/@annakowalska' },
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

  // ─── Follow relationships ──────────────────────────────────────
  const followPairs = [
    [anna.id, tomek.id],
    [anna.id, zofia.id],
    [tomek.id, anna.id],
    [tomek.id, marek.id],
    [zofia.id, anna.id],
    [marek.id, tomek.id],
    [marek.id, admin.id],
    [admin.id, anna.id],
  ]

  for (const [followerId, followingId] of followPairs) {
    await prisma.follow.create({ data: { followerId, followingId } })
  }

  // ─── Communities ──────────────────────────────────────────────
  console.log('🏘 Tworzenie społeczności...')

  const communities = await Promise.all([
    prisma.community.create({
      data: {
        name: 'Hubso Demo',
        slug: 'hubso-demo',
        description: 'Oficjalna społeczność demonstracyjna platformy Hubso.social.',
        brandColor: '#6366f1',
        brandFont: 'Inter',
        plan: 'GROWTH',
        ownerId: admin.id,
      },
    }),
    prisma.community.create({
      data: {
        name: 'Fit & Zdrowie',
        slug: 'fit-zdrowie',
        description: 'Społeczność dla miłośników zdrowego stylu życia, diety i aktywności fizycznej.',
        brandColor: '#22c55e',
        brandFont: 'Plus Jakarta Sans',
        plan: 'STARTER',
        ownerId: anna.id,
      },
    }),
    prisma.community.create({
      data: {
        name: 'Polscy Przedsiębiorcy',
        slug: 'polscy-przedsiebiorcy',
        description: 'Miejsce dla polskich founderów, freelancerów i przedsiębiorców.',
        brandColor: '#f59e0b',
        brandFont: 'Inter',
        plan: 'GROWTH',
        ownerId: tomek.id,
      },
    }),
    prisma.community.create({
      data: {
        name: 'Fotografia Polska',
        slug: 'fotografia-polska',
        description: 'Pasjonaci fotografii z całej Polski. Dzielimy się pracami i technikami.',
        brandColor: '#ec4899',
        brandFont: 'Plus Jakarta Sans',
        plan: 'STARTER',
        ownerId: zofia.id,
      },
    }),
    prisma.community.create({
      data: {
        name: 'Dev Community PL',
        slug: 'dev-community-pl',
        description: 'Polska społeczność programistów. Dyskusje o kodzie, karierze i technologiach.',
        brandColor: '#0ea5e9',
        brandFont: 'Inter',
        plan: 'SCALE',
        ownerId: marek.id,
      },
    }),
  ])

  const [demo, fit, biz, foto, dev] = communities

  // ─── Community Members ─────────────────────────────────────────
  const memberships = [
    // Demo community — everyone joins
    ...communities.slice(0, 1).flatMap(() => [
      { communityId: demo.id, userId: admin.id, role: 'OWNER' as const },
      { communityId: demo.id, userId: anna.id, role: 'MEMBER' as const },
      { communityId: demo.id, userId: tomek.id, role: 'MEMBER' as const },
      { communityId: demo.id, userId: zofia.id, role: 'MEMBER' as const },
      { communityId: demo.id, userId: marek.id, role: 'ADMIN' as const },
    ]),
    // Fit & Zdrowie
    { communityId: fit.id, userId: anna.id, role: 'OWNER' as const },
    { communityId: fit.id, userId: admin.id, role: 'MEMBER' as const },
    { communityId: fit.id, userId: zofia.id, role: 'MEMBER' as const },
    // Biznes
    { communityId: biz.id, userId: tomek.id, role: 'OWNER' as const },
    { communityId: biz.id, userId: admin.id, role: 'MEMBER' as const },
    { communityId: biz.id, userId: marek.id, role: 'MEMBER' as const },
    // Foto
    { communityId: foto.id, userId: zofia.id, role: 'OWNER' as const },
    { communityId: foto.id, userId: anna.id, role: 'MEMBER' as const },
    // Dev
    { communityId: dev.id, userId: marek.id, role: 'OWNER' as const },
    { communityId: dev.id, userId: admin.id, role: 'MEMBER' as const },
    { communityId: dev.id, userId: tomek.id, role: 'MEMBER' as const },
  ]

  for (const m of memberships) {
    await prisma.communityMember.upsert({
      where: { communityId_userId: { communityId: m.communityId, userId: m.userId } },
      update: {},
      create: m,
    })
  }

  // ─── Spaces ───────────────────────────────────────────────────
  console.log('📂 Tworzenie przestrzeni...')

  const demoGroup = await prisma.spaceGroup.create({
    data: { communityId: demo.id, name: 'Ogólne', position: 0 },
  })
  const fitGroup = await prisma.spaceGroup.create({
    data: { communityId: fit.id, name: 'Główne', position: 0 },
  })
  const bizGroup = await prisma.spaceGroup.create({
    data: { communityId: biz.id, name: 'Ogólne', position: 0 },
  })
  const devGroup = await prisma.spaceGroup.create({
    data: { communityId: dev.id, name: 'Ogólne', position: 0 },
  })

  const [demoFeed, fitPosts, fitEvents, bizPosts, devPosts] = await Promise.all([
    prisma.space.create({
      data: { communityId: demo.id, spaceGroupId: demoGroup.id, name: 'Feed', type: 'POSTS', visibility: 'PUBLIC' },
    }),
    prisma.space.create({
      data: { communityId: fit.id, spaceGroupId: fitGroup.id, name: 'Posty', type: 'POSTS', visibility: 'PUBLIC' },
    }),
    prisma.space.create({
      data: { communityId: fit.id, spaceGroupId: fitGroup.id, name: 'Wydarzenia', type: 'EVENTS', visibility: 'PUBLIC' },
    }),
    prisma.space.create({
      data: { communityId: biz.id, spaceGroupId: bizGroup.id, name: 'Dyskusje', type: 'POSTS', visibility: 'PUBLIC' },
    }),
    prisma.space.create({
      data: { communityId: dev.id, spaceGroupId: devGroup.id, name: 'Tech Talk', type: 'POSTS', visibility: 'PUBLIC' },
    }),
  ])

  // ─── Posts ────────────────────────────────────────────────────
  console.log('📝 Tworzenie postów...')

  const makeDoc = (text: string) => ({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  })

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        spaceId: demoFeed.id,
        authorId: admin.id,
        content: makeDoc('Witajcie w Hubso.social! To jest oficjalna platforma demonstracyjna. Możesz tutaj sprawdzić wszystkie funkcje: posty, komentarze, grupy, wydarzenia i wiadomości prywatne.'),
        type: 'TEXT',
        status: 'PUBLISHED',
        pinned: true,
        featured: true,
        reactionsCount: { LIKE: 12, FIRE: 5, LOVE: 3 },
      },
    }),
    prisma.post.create({
      data: {
        spaceId: fitPosts.id,
        authorId: anna.id,
        content: makeDoc('Dzisiaj skończyłam 30-dniowe wyzwanie jogi! 🧘‍♀️ Nigdy nie sądziłam, że wytrwam tak długo. Klucz to regularne małe kroki, a nie rewolucja. Kto chce dołączyć do kolejnej edycji?'),
        type: 'TEXT',
        status: 'PUBLISHED',
        reactionsCount: { LIKE: 8, LOVE: 14, FIRE: 2 },
      },
    }),
    prisma.post.create({
      data: {
        spaceId: fitPosts.id,
        authorId: anna.id,
        content: makeDoc('Mój przepis na smoothie po treningu: szpinak, banan, mleko migdałowe, łyżka masła orzechowego i odrobina cynamonu. Dostarcza białka, potasu i dobrego nastroju!'),
        type: 'TEXT',
        status: 'PUBLISHED',
        reactionsCount: { LIKE: 6, LOVE: 4 },
      },
    }),
    prisma.post.create({
      data: {
        spaceId: bizPosts.id,
        authorId: tomek.id,
        content: makeDoc('Największy błąd jaki popełniłem startując swój pierwszy biznes: skupiałem się na produkcie, a nie na kliencie. Dopiero po 6 miesiącach przestałem budować to, co mi się podoba, i zacząłem budować to, czego ludzie faktycznie potrzebują.'),
        type: 'TEXT',
        status: 'PUBLISHED',
        pinned: true,
        reactionsCount: { LIKE: 23, FIRE: 11, LOVE: 7 },
      },
    }),
    prisma.post.create({
      data: {
        spaceId: devPosts.id,
        authorId: marek.id,
        content: makeDoc('Właśnie wdrożyłem Turborepo w naszym monorepo i jestem pod wrażeniem. Czas builda z 8 minut spadł do 45 sekund dzięki cachowaniu. Ktoś z was używa remote cache? Warto konfigurować?'),
        type: 'TEXT',
        status: 'PUBLISHED',
        reactionsCount: { LIKE: 15, FIRE: 9, WOW: 6 },
      },
    }),
    prisma.post.create({
      data: {
        spaceId: devPosts.id,
        authorId: marek.id,
        content: makeDoc('TypeScript 5.4 jest naprawdę świetny. Preserved Narrowing in Closures to game-changer jeśli piszesz dużo kodu asynchronicznego. Polecam przeczytać release notes.'),
        type: 'TEXT',
        status: 'PUBLISHED',
        reactionsCount: { LIKE: 10, WOW: 4 },
      },
    }),
  ])

  // ─── Comments ─────────────────────────────────────────────────
  console.log('💬 Tworzenie komentarzy...')

  await Promise.all([
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        authorId: anna.id,
        content: makeDoc('Super platforma! Interfejs jest bardzo intuicyjny. Czekam na więcej funkcji 🚀'),
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        authorId: marek.id,
        content: makeDoc('Szczególnie podoba mi się system przestrzeni. Bardzo dobrze przemyślana architektura.'),
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[1].id,
        authorId: zofia.id,
        content: makeDoc('Brawo Ania! Motywujesz mnie do powrotu na matę. Jaką aplikację polecasz do śledzenia treningów?'),
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[3].id,
        authorId: admin.id,
        content: makeDoc('Złota zasada: fall in love with the problem, not the solution. Większość startupów upada przez brak product-market fit.'),
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[4].id,
        authorId: tomek.id,
        content: makeDoc('Remote cache na Vercel jest wygodny ale płatny. My używamy własnego serwera S3 — działa świetnie i jest darmowy.'),
      },
    }),
  ])

  // ─── Events ───────────────────────────────────────────────────
  console.log('📅 Tworzenie wydarzeń...')

  const now = new Date()
  await Promise.all([
    prisma.event.create({
      data: {
        spaceId: fitEvents.id,
        creatorId: anna.id,
        title: 'Warsztaty Jogi Online — poziom podstawowy',
        description: 'Godzinne warsztaty jogi dla początkujących. Potrzebujesz tylko maty i wygodnych ubrań.',
        startsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        locationType: 'VIRTUAL',
        location: 'Zoom — link po zapisaniu',
        maxAttendees: 30,
      },
    }),
    prisma.event.create({
      data: {
        spaceId: fitEvents.id,
        creatorId: anna.id,
        title: 'Bieg Poranny — Warszawa Łazienki',
        description: 'Wspólny poranek z biegiem w parku Łazienkowskim. Każde tempo mile widziane!',
        startsAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endsAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        locationType: 'IN_PERSON',
        location: 'Park Łazienkowski, Warszawa — wejście od Al. Ujazdowskich',
      },
    }),
  ])

  // ─── Groups ───────────────────────────────────────────────────
  console.log('👥 Tworzenie grup...')

  const fitGroup2 = await prisma.group.create({
    data: {
      communityId: fit.id,
      name: 'Weganie i Wegetarianie',
      description: 'Przestrzeń dla osób na diecie roślinnej. Przepisy, porady, wsparcie.',
      visibility: 'PUBLIC',
      memberCount: 2,
    },
  })

  await Promise.all([
    prisma.groupMember.create({ data: { groupId: fitGroup2.id, userId: anna.id, role: 'OWNER' } }),
    prisma.groupMember.create({ data: { groupId: fitGroup2.id, userId: zofia.id, role: 'MEMBER' } }),
  ])

  // ─── Summary ──────────────────────────────────────────────────
  console.log('')
  console.log('✅ Seedowanie zakończone pomyślnie!')
  console.log('')
  console.log('📋 Dane testowe:')
  console.log('   Email: test@hubso.pl')
  console.log('   Hasło: Test1234!')
  console.log('')
  console.log(`   👤 Użytkownicy: 5`)
  console.log(`   🏘  Społeczności: ${communities.length}`)
  console.log(`   📝 Posty: ${posts.length}`)
  console.log(`   📅 Wydarzenia: 2`)
  console.log(`   👥 Grupy: 1`)
}

main()
  .catch((e) => {
    console.error('❌ Błąd seedowania:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
