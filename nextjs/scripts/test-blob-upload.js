require("dotenv").config();
const { put, del } = require("@vercel/blob");

(async () => {
  let ok = true;
  const log = (label, cond) => {
    console.log((cond ? "PASS" : "FAIL") + " - " + label);
    if (!cond) ok = false;
  };

  const testContent = Buffer.from("test image content " + Date.now());
  const blob = await put("test-upload.txt", testContent, { access: "public", addRandomSuffix: true });
  log("le fichier de test est uploadé avec une URL", !!blob.url && blob.url.startsWith("https://"));

  const response = await fetch(blob.url);
  const fetchedContent = await response.text();
  log("le contenu uploadé est bien celui attendu une fois re-téléchargé", fetchedContent === testContent.toString());

  await del(blob.url);
  const afterDelete = await fetch(blob.url);
  log("le fichier de test est bien supprimé après del()", afterDelete.status === 404);

  process.exit(ok ? 0 : 1);
})();
