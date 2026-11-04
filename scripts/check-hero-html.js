async function run() {
  const res = await fetch('http://localhost:3002/');
  const html = await res.text();
  const start = html.indexOf('<header id="header"');
  const end = html.indexOf('</section>', start);
  console.log('--- EXTRACTED HTML ---');
  console.log(html.substring(start, end + 10));
}
run().catch(console.error);
