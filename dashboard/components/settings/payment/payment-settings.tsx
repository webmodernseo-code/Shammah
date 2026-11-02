"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Switch from "@/components/ui/switch";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Lock } from "lucide-react";
import {
  StripeLogo,
  PaypalLogo,
  ApplePayLogo,
  GooglePayLogo,
  VisaLogo,
  MastercardLogo,
} from "@/components/common/payment-icons";

interface GatewayState {
  isEnabled: boolean;
  isLiveMode: boolean;
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  hasSecretKey: boolean;
}

interface PayPalState {
  isEnabled: boolean;
  isLiveMode: boolean;
  clientId: string;
  secretKey: string;
  hasSecretKey: boolean;
}

export default function PaymentApiSettings() {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Stripe state & test
  const [testingStripe, setTestingStripe] = useState(false);
  const [stripeStatusMessage, setStripeStatusMessage] = useState<string | null>(null);
  const [stripeStatusSuccess, setStripeStatusSuccess] = useState<boolean | null>(null);

  // PayPal state & test
  const [testingPaypal, setTestingPaypal] = useState(false);
  const [paypalStatusMessage, setPaypalStatusMessage] = useState<string | null>(null);
  const [paypalStatusSuccess, setPaypalStatusSuccess] = useState<boolean | null>(null);

  // Password visibility
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripeWebhook, setShowStripeWebhook] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);

  // Stripe State
  const [stripe, setStripe] = useState<GatewayState>({
    isEnabled: true,
    isLiveMode: true,
    publishableKey: "",
    secretKey: "",
    webhookSecret: "",
    hasSecretKey: false,
  });

  // PayPal State
  const [paypal, setPaypal] = useState<PayPalState>({
    isEnabled: true,
    isLiveMode: true,
    clientId: "",
    secretKey: "",
    hasSecretKey: false,
  });

  // Fetch initial configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/settings/payment-gateways");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (json.data.stripe) {
              setStripe({
                isEnabled: json.data.stripe.isEnabled,
                isLiveMode: json.data.stripe.isLiveMode,
                publishableKey: json.data.stripe.publishableKey || "",
                secretKey: json.data.stripe.secretKey || "",
                webhookSecret: json.data.stripe.webhookSecret || "",
                hasSecretKey: json.data.stripe.hasSecretKey,
              });
            }
            if (json.data.paypal) {
              setPaypal({
                isEnabled: json.data.paypal.isEnabled,
                isLiveMode: json.data.paypal.isLiveMode,
                clientId: json.data.paypal.clientId || "",
                secretKey: json.data.paypal.secretKey || "",
                hasSecretKey: json.data.paypal.hasSecretKey,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Utilisation de la configuration locale.", err);
      }
    };

    fetchConfig();
  }, []);

  // Test Stripe Connection
  const handleTestStripe = async () => {
    setTestingStripe(true);
    setStripeStatusMessage(null);
    setStripeStatusSuccess(null);

    try {
      const res = await fetch("/api/settings/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          gateway: "stripe",
          secretKey: stripe.secretKey,
          isLiveMode: stripe.isLiveMode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStripeStatusSuccess(true);
        setStripeStatusMessage(data.message || "Connexion Stripe validée avec succès !");
        toast.success("Connexion Stripe opérationnelle !");
      } else {
        setStripeStatusSuccess(false);
        setStripeStatusMessage(data.error || "Impossible de joindre Stripe avec ces identifiants.");
        toast.error(data.error || "Échec du test de connexion Stripe.");
      }
    } catch {
      setStripeStatusSuccess(false);
      setStripeStatusMessage("Erreur réseau lors de la communication avec l'API Stripe.");
      toast.error("Erreur de connexion.");
    } finally {
      setTestingStripe(false);
    }
  };

  // Test PayPal Connection
  const handleTestPaypal = async () => {
    setTestingPaypal(true);
    setPaypalStatusMessage(null);
    setPaypalStatusSuccess(null);

    try {
      const res = await fetch("/api/settings/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          gateway: "paypal",
          clientId: paypal.clientId,
          secretKey: paypal.secretKey,
          isLiveMode: paypal.isLiveMode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaypalStatusSuccess(true);
        setPaypalStatusMessage(data.message || "Connexion PayPal validée avec succès !");
        toast.success("Connexion PayPal opérationnelle !");
      } else {
        setPaypalStatusSuccess(false);
        setPaypalStatusMessage(data.error || "Impossible de joindre PayPal avec ces identifiants.");
        toast.error(data.error || "Échec du test PayPal.");
      }
    } catch {
      setPaypalStatusSuccess(false);
      setPaypalStatusMessage("Erreur réseau lors de la communication avec l'API PayPal.");
      toast.error("Erreur de connexion PayPal.");
    } finally {
      setTestingPaypal(false);
    }
  };

  // Save Settings
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const resStripe = await fetch("/api/settings/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateway: "stripe",
          isEnabled: stripe.isEnabled,
          isLiveMode: stripe.isLiveMode,
          publishableKey: stripe.publishableKey,
          secretKey: stripe.secretKey,
          webhookSecret: stripe.webhookSecret,
        }),
      });

      const dataStripe = await resStripe.json().catch(() => ({}));

      let resPaypalOk = true;
      let paypalError = "";
      if (paypal.clientId || paypal.secretKey) {
        const resPaypal = await fetch("/api/settings/payment-gateways", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gateway: "paypal",
            isEnabled: paypal.isEnabled,
            isLiveMode: paypal.isLiveMode,
            clientId: paypal.clientId,
            secretKey: paypal.secretKey,
          }),
        });
        const dataPaypal = await resPaypal.json().catch(() => ({}));
        resPaypalOk = resPaypal.ok;
        if (!resPaypal.ok) {
          paypalError = dataPaypal.error;
        }
      }

      if (resStripe.ok && resPaypalOk) {
        setSaveSuccess(true);
        toast.success("Vos identifiants de paiement ont été enregistrés avec succès !", {
          description: "Les passerelles Stripe et PayPal sont maintenant actives et enregistrées.",
          icon: <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />,
          className: "bg-emerald-50 border-emerald-300 text-emerald-950 font-medium shadow-md",
          duration: 5000,
        });
      } else {
        setSaveSuccess(false);
        const errMsg = dataStripe.error || paypalError || "Une erreur est survenue lors de l'enregistrement.";
        toast.error(errMsg);
      }
    } catch {
      setSaveSuccess(false);
      toast.error("Erreur de communication avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Success Notification Banner with Green Validation Badge */}
      {saveSuccess && (
        <div className="bg-emerald-50/95 border border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="size-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-emerald-950">
                  Vos identifiants de paiement ont été enregistrés avec succès !
                </p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap shrink-0">
                  <span className="size-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>Validé & Actif</span>
                </span>
              </div>
              <p className="text-xs text-emerald-800/85 mt-0.5">
                Les clés API et les passerelles sont prêtes pour encaisser les paiements de votre boutique en toute sécurité.
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
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Passerelles de Paiement & Encaissement
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Les fonds des commandes sont reversés directement sur vos comptes Stripe et PayPal professionnels.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 whitespace-nowrap shrink-0">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          <span>Sécurité PCI-DSS & Chiffrement SSL 256-bit</span>
        </div>
      </div>

      {/* ── CARD 1: STRIPE (CB / VISA / MASTERCARD / APPLE PAY) ── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
              <StripeLogo className="h-4.5 w-auto" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Stripe (Cartes Bancaires, Apple Pay & Google Pay)
                </h3>
                {stripe.isEnabled ? (
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
                    Actif
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    Désactivé
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Paiement direct par Carte Bancaire, Apple Pay et Google Pay.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <span className="text-xs font-semibold text-gray-600">Activer Stripe :</span>
            <Switch
              checked={stripe.isEnabled}
              onChange={(val) => setStripe((prev) => ({ ...prev, isEnabled: val }))}
            />
          </div>
        </div>

        {/* Environment Toggle */}
        <div className="bg-gray-50/70 rounded-xl p-3.5 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-gray-900">
              Environnement Stripe
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {stripe.isLiveMode
                ? "Mode Réel (Production) : Encaissements effectifs sur votre compte Stripe."
                : "Mode Test (Sandbox) : Commandes de test sans débit bancaire réel."}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shrink-0">
            <button
              type="button"
              onClick={() => setStripe((prev) => ({ ...prev, isLiveMode: false }))}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                !stripe.isLiveMode
                  ? "bg-amber-100 text-amber-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Mode Test
            </button>
            <button
              type="button"
              onClick={() => setStripe((prev) => ({ ...prev, isLiveMode: true }))}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                stripe.isLiveMode
                  ? "bg-primary text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Mode Réel (Production)
            </button>
          </div>
        </div>

        {/* Stripe Keys Form */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Clé Publique Stripe (Publishable Key)
            </label>
            <input
              type="text"
              placeholder={stripe.isLiveMode ? "pk_live_..." : "pk_test_..."}
              value={stripe.publishableKey}
              onChange={(e) => setStripe((prev) => ({ ...prev, publishableKey: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 font-mono focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Clé Secrète Stripe (Secret Key)
            </label>
            <div className="relative">
              <input
                type={showStripeSecret ? "text" : "password"}
                placeholder={stripe.isLiveMode ? "sk_live_..." : "sk_test_..."}
                value={stripe.secretKey}
                onChange={(e) => setStripe((prev) => ({ ...prev, secretKey: e.target.value }))}
                className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 font-mono focus:outline-none focus:border-primary shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowStripeSecret(!showStripeSecret)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showStripeSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Secret Webhook Stripe (Optionnel)
            </label>
            <div className="relative">
              <input
                type={showStripeWebhook ? "text" : "password"}
                placeholder="whsec_..."
                value={stripe.webhookSecret}
                onChange={(e) => setStripe((prev) => ({ ...prev, webhookSecret: e.target.value }))}
                className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 font-mono focus:outline-none focus:border-primary shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showStripeWebhook ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stripe Test Status Banner */}
        {stripeStatusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              stripeStatusSuccess
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            {stripeStatusSuccess ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-red-600 shrink-0" />
            )}
            <span>{stripeStatusMessage}</span>
          </div>
        )}

        {/* Stripe Card Footer */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <VisaLogo className="h-6 w-auto shadow-2xs hover:scale-105 transition-transform" />
            <MastercardLogo className="h-6 w-auto shadow-2xs hover:scale-105 transition-transform" />
            <ApplePayLogo className="h-6 w-auto shadow-2xs hover:scale-105 transition-transform" />
            <GooglePayLogo className="h-6 w-auto shadow-2xs hover:scale-105 transition-transform" />
          </div>
          <button
            type="button"
            disabled={testingStripe || !stripe.secretKey}
            onClick={handleTestStripe}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {testingStripe ? (
              <>
                <RefreshCw className="size-3.5 animate-spin text-primary" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <RefreshCw className="size-3.5 text-gray-600" />
                <span>Tester la connexion Stripe</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── CARD 2: PAYPAL & PAIEMENT EXPRESS ── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
              <PaypalLogo className="h-4.5 w-auto" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  PayPal (Compte PayPal & Paiement en 4X)
                </h3>
                {paypal.isEnabled ? (
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
                    Actif
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    Désactivé
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Encaissement direct avec solde PayPal, cartes et paiement fractionné.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <span className="text-xs font-semibold text-gray-600">Activer PayPal :</span>
            <Switch
              checked={paypal.isEnabled}
              onChange={(val) => setPaypal((prev) => ({ ...prev, isEnabled: val }))}
            />
          </div>
        </div>

        {/* Environment Toggle */}
        <div className="bg-gray-50/70 rounded-xl p-3.5 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-gray-900">
              Environnement PayPal
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {paypal.isLiveMode
                ? "Mode Réel (Production) : Les clients règlent directement sur votre compte PayPal Pro."
                : "Mode Sandbox : Environnement de test développeur."}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shrink-0">
            <button
              type="button"
              onClick={() => setPaypal((prev) => ({ ...prev, isLiveMode: false }))}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                !paypal.isLiveMode
                  ? "bg-amber-100 text-amber-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Sandbox (Test)
            </button>
            <button
              type="button"
              onClick={() => setPaypal((prev) => ({ ...prev, isLiveMode: true }))}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                paypal.isLiveMode
                  ? "bg-primary text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Mode Réel (Production)
            </button>
          </div>
        </div>

        {/* PayPal Keys Form */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Client ID PayPal
            </label>
            <input
              type="text"
              placeholder="Ex: A21AAK..."
              value={paypal.clientId}
              onChange={(e) => setPaypal((prev) => ({ ...prev, clientId: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 font-mono focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Secret Key PayPal
            </label>
            <div className="relative">
              <input
                type={showPaypalSecret ? "text" : "password"}
                placeholder="Ex: EK..."
                value={paypal.secretKey}
                onChange={(e) => setPaypal((prev) => ({ ...prev, secretKey: e.target.value }))}
                className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 font-mono focus:outline-none focus:border-primary shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPaypalSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* PayPal Test Status Banner */}
        {paypalStatusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              paypalStatusSuccess
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            {paypalStatusSuccess ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-red-600 shrink-0" />
            )}
            <span>{paypalStatusMessage}</span>
          </div>
        )}

        {/* PayPal Card Footer */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            disabled={testingPaypal || !paypal.clientId || !paypal.secretKey}
            onClick={handleTestPaypal}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {testingPaypal ? (
              <>
                <RefreshCw className="size-3.5 animate-spin text-primary" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <RefreshCw className="size-3.5 text-gray-600" />
                <span>Tester la connexion PayPal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          {saveSuccess && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold shadow-2xs animate-in fade-in duration-200">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>Vos identifiants de paiement ont été enregistrés avec succès !</span>
            </div>
          )}
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={loading}
          className="btn-primary text-white px-8 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xs cursor-pointer self-end"
        >
          {loading ? "Enregistrement en cours..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
}
