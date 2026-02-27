const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function extractText(node) {
  if (!node) return '';
  let t = '';
  if (node.text) t += node.text;
  if (Array.isArray(node.content)) {
    for (const c of node.content) t += extractText(c) + ' ';
  }
  return t.trim();
}

async function main() {
  const posts = await prisma.post.findMany({ where: { searchableText: null }, select: { id: true, content: true } });
  console.log('Backfilling', posts.length, 'posts...');
  for (const p of posts) {
    const txt = extractText(p.content);
    await prisma.post.update({ where: { id: p.id }, data: { searchableText: txt || null } });
  }
  console.log('Done!');
  await prisma.$disconnect();
}
main();
