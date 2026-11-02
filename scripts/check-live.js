const https = require('https');

https.get('https://admin.divinexpress.fr/signin', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const scripts = [...data.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => m[1]);
    console.log('Scripts found:', scripts.length);
    scripts.forEach(s => {
      https.get('https://admin.divinexpress.fr' + s, r => {
        let chunkData = '';
        r.on('data', c => chunkData += c);
        r.on('end', () => {
          const hasReign = chunkData.toLowerCase().includes('reign');
          const hasHero = chunkData.includes('divinexpress-admin-hero');
          if (hasReign || hasHero) {
            console.log(s, '-> hasReign:', hasReign, 'hasHero:', hasHero);
          }
        });
      });
    });
  });
});
