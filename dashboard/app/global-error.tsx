"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="fr"><body><main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,fontFamily:"Arial, sans-serif",background:"#f9fafb"}}><section style={{maxWidth:440,padding:32,border:"1px solid #e5e7eb",borderRadius:18,background:"white",textAlign:"center"}}><h1 style={{fontSize:20,color:"#111827"}}>Chargement interrompu</h1><p style={{fontSize:14,color:"#6b7280",lineHeight:1.6}}>Le dashboard a rencontré une erreur temporaire. Réessayez sans perdre vos données.</p><button onClick={reset} style={{marginTop:12,border:0,borderRadius:12,padding:"11px 18px",background:"#047857",color:"white",fontWeight:700,cursor:"pointer"}}>Recharger le dashboard</button></section></main></body></html>;
}
