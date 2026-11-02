"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Switch from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Send,
  Server,
  FileText,
  Truck,
  KeyRound,
  HelpCircle,
} from "lucide-react";
import { SiGmail, SiBrevo } from "@/components/common/brand-icons";

interface ProviderPreset {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  tip: string;
}

const PRESETS: ProviderPreset[] = [
  {
    id: "o2switch",
    name: "o2switch (cPanel)",
    host: "mail.shammah.eu",
    port: 465,
    secure: true,
    tip: "Utilisez votre adresse e-mail complète (ex: contact@shammah.eu) et le mot de passe de boîte mail défini dans votre cPanel o2switch.",
  },
  {
    id: "gmail",
    name: "Gmail / Google Workspace",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    tip: "Nécessite un 'Mot de passe d'application' (16 caractères) généré depuis votre compte Google (Sécurité > Validation en deux étapes).",
  },
  {
    id: "hostinger",
    name: "Hostinger",
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    tip: "Utilisez votre adresse e-mail professionnelle Hostinger complète et le mot de passe de boîte mail.",
  },
  {
    id: "brevo",
    name: "Brevo (ex-Sendinblue)",
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    tip: "Utilisez votre identifiant de connexion Brevo et votre clé API SMTP générée dans SMTP & API.",
  },
  {
    id: "ovh",
    name: "OVHcloud",
    host: "ssl0.ovh.net",
    port: 465,
    secure: true,
    tip: "Hôte standard pour les adresses e-mails MX Plan ou Pro hébergées chez OVHcloud.",
  },
  {
    id: "outlook",
    name: "Microsoft 365 / Outlook",
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    tip: "Assurez-vous que l'authentification SMTP AUTH est activée dans le centre d'administration Microsoft 365.",
  },
  {
    id: "custom",
    name: "Serveur Personnalisé",
    host: "",
    port: 465,
    secure: true,
    tip: "Renseignez les paramètres fournis par votre hébergeur ou votre serveur de messagerie dédié.",
  },
];

export default function SmtpSettings() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [selectedPreset, setSelectedPreset] = useState<string>("gmail");
  const [host, setHost] = useState("smtp.gmail.com");
  const [port, setPort] = useState(465);
  const [secure, setSecure] = useState(true);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [fromName, setFromName] = useState("Shammah Mode");
  const [fromEmail, setFromEmail] = useState("contact@shammah.eu");
  const [isEnabled, setIsEnabled] = useState(true);

  // Test state
  const [testRecipient, setTestRecipient] = useState("");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch current config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/settings/smtp");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            setHost(d.host || "smtp.gmail.com");
            setPort(d.port || 465);
            setSecure(typeof d.secure === "boolean" ? d.secure : d.port === 465);
            setUser(d.user || "");
            setPassword(d.password || "");
            setHasStoredPassword(Boolean(d.hasPassword));
            setFromName(d.fromName || "Shammah Mode");
            setFromEmail(d.fromEmail || "contact@shammah.eu");
            setIsEnabled(typeof d.isEnabled === "boolean" ? d.isEnabled : true);
            if (d.user) {
              setTestRecipient(d.user);
            }

            // Identify matching preset
            const matched = PRESETS.find(
              (p) => p.host && p.host.toLowerCase() === (d.host || "").toLowerCase()
            );
            if (matched) {
              setSelectedPreset(matched.id);
            } else if (d.host) {
              setSelectedPreset("custom");
            }
          }
        }
      } catch (err) {
        console.warn("Erreur chargement SMTP:", err);
      }
    };

    fetchConfig();
  }, []);

  // Handle preset change
  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset && preset.id !== "custom") {
      setHost(preset.host);
      setPort(preset.port);
      setSecure(preset.secure);
    }
  };

  // Handle live test
  const handleTestSmtp = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/settings/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          host,
          port,
          secure,
          user,
          password,
          fromName,
          fromEmail,
          testRecipient: testRecipient || user || fromEmail,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || "Test SMTP réussi ! E-mail envoyé avec succès.",
        });
        toast.success("Connexion SMTP validée avec succès !");
      } else {
        setTestResult({
          success: false,
          message: data.error || "Échec de connexion au serveur SMTP.",
        });
        toast.error(data.error || "Échec du test SMTP.");
      }
    } catch {
      setTestResult({
        success: false,
        message: "Erreur de communication avec le serveur lors du test.",
      });
      toast.error("Erreur de connexion.");
    } finally {
      setTesting(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          host,
          port,
          secure,
          user,
          password,
          fromName,
          fromEmail,
          isEnabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setHasStoredPassword(true);
        toast.success("Configuration SMTP enregistrée avec succès !", {
          description: "Tous les e-mails transactionnels utiliseront ce serveur.",
        });
      } else {
        toast.error(data.error || "Erreur lors de l'enregistrement.");
      }
    } catch {
      toast.error("Erreur réseau lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const currentPresetInfo = PRESETS.find((p) => p.id === selectedPreset);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50/95 border border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="size-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-emerald-950">
                  Configuration SMTP enregistrée avec succès !
                </p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap shrink-0">
                  <span className="size-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>Prêt pour l'envoi</span>
                </span>
              </div>
              <p className="text-xs text-emerald-800/85 mt-0.5">
                Vos clients recevront automatiquement leurs factures PDF et suivis Colissimo par e-mail.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors self-end sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Mail className="size-5 text-emerald-600 shrink-0" />
            <span>Serveur SMTP & Messagerie Transactionnelle</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Configurez votre serveur d'envoi d'e-mails pour distribuer les factures PDF acquittées et les numéros de suivi Colissimo.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 whitespace-nowrap shrink-0">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          <span>Authentification TLS/SSL Chiffrée</span>
        </div>
      </div>

      {/* Transactional Scope Badge List */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <FileText className="size-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Factures PDF Clients</p>
            <p className="text-[11px] text-gray-500">Générées & jointes à la commande</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Truck className="size-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Suivi Colissimo</p>
            <p className="text-[11px] text-gray-500">Envoyé dès passage en Expédié</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <KeyRound className="size-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Sécurité & Accès</p>
            <p className="text-[11px] text-gray-500">Réinitialisation mot de passe admin</p>
          </div>
        </div>
      </div>

      {/* ── CARD: SMTP CONFIGURATION ── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-6">
        {/* Enable / Disable Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
              <Server className="size-5 text-gray-700" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Activation de la messagerie SMTP
                </h3>
                {isEnabled ? (
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
                    Actif
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    Désactivé
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Active l'envoi réel des e-mails depuis votre serveur dédié.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-gray-600">Activer l'envoi :</span>
            <Switch checked={isEnabled} onChange={setIsEnabled} />
          </div>
        </div>

        {/* Provider Presets Tabs */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">
            Fournisseur de messagerie (Préréglage rapide)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-primary/5 border-primary text-primary shadow-2xs"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {preset.id === "gmail" && <SiGmail className="size-3.5 shrink-0" />}
                    {preset.id === "brevo" && <SiBrevo className="size-3.5 shrink-0" />}
                    <span className="truncate">{preset.name}</span>
                  </div>
                  {isSelected && <span className="size-2 rounded-full bg-primary shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>

          {currentPresetInfo && (
            <div className="mt-2.5 bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs text-gray-600 flex items-start gap-2">
              <HelpCircle className="size-4 text-gray-400 shrink-0 mt-0.5" />
              <span>{currentPresetInfo.tip}</span>
            </div>
          )}
        </div>

        {/* Server & Port Credentials Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Hôte SMTP (Host)
            </label>
            <input
              type="text"
              placeholder="Ex: smtp.gmail.com ou smtp.hostinger.com"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 font-mono focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Port SMTP
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="465"
                value={port}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setPort(p);
                  if (p === 465) setSecure(true);
                  if (p === 587) setSecure(false);
                }}
                className="w-full h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 font-mono focus:outline-none focus:border-primary shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setSecure(!secure)}
                className={`h-10 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                  secure
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-blue-50 border-blue-300 text-blue-800"
                }`}
                title={secure ? "Connexion SSL directe" : "Connexion STARTTLS"}
              >
                {secure ? "SSL" : "TLS"}
              </button>
            </div>
          </div>
        </div>

        {/* User & Password Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Identifiant / E-mail SMTP (Username)
            </label>
            <input
              type="email"
              placeholder="Ex: contact@shammah.eu"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
              <span>Mot de passe SMTP / Clé d'application</span>
              {hasStoredPassword && (
                <span className="text-[10px] text-emerald-700 font-normal">
                  (Mot de passe enregistré)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={hasStoredPassword ? "••••••••••••••••" : "Mot de passe ou App Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 font-mono focus:outline-none focus:border-primary shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sender Info (From Name & From Email) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Nom affiché de l'expéditeur (From Name)
            </label>
            <input
              type="text"
              placeholder="Shammah Mode"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Adresse e-mail d'expédition (From Email)
            </label>
            <input
              type="email"
              placeholder="contact@shammah.eu"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>
        </div>

        {/* ── TEST SECTION ── */}
        <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Send className="size-3.5 text-primary" />
                <span>Tester l'envoi d'un e-mail en direct</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Envoie un e-mail réel de vérification avec le design de marque Shammah.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Votre adresse email de réception pour le test"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary shadow-2xs"
            />
            <button
              type="button"
              disabled={testing || (!password && !hasStoredPassword)}
              onClick={handleTestSmtp}
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
            >
              {testing ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin text-primary" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5 text-gray-600" />
                  <span>Envoyer un e-mail de test</span>
                </>
              )}
            </button>
          </div>

          {/* Test Status Feedback Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          {saveSuccess && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold shadow-2xs animate-in fade-in duration-200">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>Vos paramètres SMTP ont été enregistrés avec succès !</span>
            </div>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary text-white px-8 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xs cursor-pointer self-end"
        >
          {loading ? "Enregistrement en cours..." : "Enregistrer la configuration SMTP"}
        </Button>
      </div>
    </div>
  );
}
