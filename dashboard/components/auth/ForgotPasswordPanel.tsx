"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import styles from "./ForgotPasswordPanel.module.css";

export default function ForgotPasswordPanel() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const isFr = locale === "fr";

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const toggleLanguage = () => {
    setLocale((prev) => (prev === "fr" ? "en" : "fr"));
  };

  const maskEmail = (val: string) => {
    if (!val || !val.includes("@")) return val;
    const [name, domain] = val.split("@");
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      const msg = isFr
        ? "Veuillez saisir une adresse email valide."
        : "Please enter a valid email address.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok && data.error) {
        setError(data.error);
        toast.error(data.error);
        setPending(false);
        return;
      }

      setSent(true);
      setCooldown(60); // 60s cooldown before resending
      toast.success(
        isFr
          ? "Demande prise en compte. Vérifiez votre boîte de réception !"
          : "Request received. Please check your inbox!"
      );
    } catch {
      setError(
        isFr
          ? "Service de récupération momentanément indisponible. Réessayez dans un instant."
          : "Password reset service temporarily unavailable. Please try again later."
      );
      toast.error(
        isFr
          ? "Impossible de contacter le serveur."
          : "Unable to reach the server."
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Editorial Left Panel */}
      <section className={styles.heroPanel}>
        <Image
          src="/images/auth/forgot-password-bg.png"
          alt="DivinExpress Administration"
          fill
          priority
          className={styles.heroImage}
        />
        <div className={styles.heroGradientOverlay} />

        <div className={styles.heroContent}>
          <div className={styles.heroBrand}>
            <Image
              src="/images/logo/logo-white.svg"
              alt="DivinExpress"
              width={160}
              height={36}
              priority
              className={styles.heroLogoImage}
            />
            <span className={styles.heroAdminBadge}>ADMIN</span>
          </div>

          <div className={styles.heroTextWrapper}>
            <p className={styles.heroPretitle}>SÉCURITÉ & ACCÈS</p>
            <h1 className={styles.heroHeading}>
              Récupérez vos
              <br />
              accès en toute
              <br />
              sérénité.
            </h1>
            <p className={styles.heroDescription}>
              Un lien d'accès sécurisé à usage unique vous sera envoyé par email pour réinitialiser votre mot de passe administrateur.
            </p>
            <div className={styles.heroSecurityBadge}>
              <ShieldCheck className={styles.heroSecurityIcon} size={20} />
              <span>Lien chiffré HMAC-256 valable 30 minutes.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className={styles.formPanel}>
        <button
          type="button"
          onClick={toggleLanguage}
          className={styles.langToggle}
          title={isFr ? "Switch to English" : "Passer en français"}
        >
          {isFr ? "EN" : "FR"}
        </button>

        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <div className={styles.logoWrapper}>
              <Image
                src="/branding/logo-divinexpress.png"
                alt="DivinExpress"
                width={180}
                height={48}
                priority
                className={styles.logoImage}
              />
            </div>
            <h2 className={styles.formTitle}>
              {isFr ? "Mot de passe oublié ?" : "Forgot password?"}
            </h2>
            <p className={styles.formSubtitle}>
              {isFr
                ? "Saisissez votre email administrateur pour recevoir les instructions de réinitialisation."
                : "Enter your administrator email to receive reset instructions."}
            </p>
          </div>

          {error && (
            <div className={styles.alertError} role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className={styles.successCard}>
              <div className={styles.successIconWrapper}>
                <CheckCircle2 size={32} />
              </div>
              <h3 className={styles.successTitle}>
                {isFr ? "Email envoyé avec succès" : "Email sent successfully"}
              </h3>
              <p className={styles.successDescription}>
                {isFr ? (
                  <>
                    Si l'adresse <span className={styles.emailHighlight}>{maskEmail(email)}</span> est associée à un compte administrateur actif, un lien de réinitialisation vient de vous être envoyé.
                  </>
                ) : (
                  <>
                    If the address <span className={styles.emailHighlight}>{maskEmail(email)}</span> matches an active administrator account, a reset link has been dispatched.
                  </>
                )}
              </p>

              <div className={styles.stepsBox}>
                <p className={styles.stepsHeading}>
                  {isFr ? "Prochaines étapes :" : "Next steps:"}
                </p>
                <ol className={styles.stepsList}>
                  <li>
                    {isFr
                      ? "Consultez votre boîte de réception ainsi que vos courriers indésirables (Spams)."
                      : "Check your inbox and spam folder."}
                  </li>
                  <li>
                    {isFr
                      ? "Cliquez sur le lien sécurisé (valable 30 minutes)."
                      : "Click the secure link (valid for 30 minutes)."}
                  </li>
                  <li>
                    {isFr
                      ? "Définissez votre nouveau mot de passe fort (12+ caractères)."
                      : "Choose your new secure password (12+ characters)."}
                  </li>
                </ol>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={pending || cooldown > 0}
                  className={styles.resendButton}
                >
                  <RotateCcw size={14} />
                  <span>
                    {cooldown > 0
                      ? isFr
                        ? `Renvoyer le lien (${cooldown}s)`
                        : `Resend link (${cooldown}s)`
                      : isFr
                      ? "Renvoyer un nouveau lien"
                      : "Resend a new link"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.formBody} noValidate>
              <div className={styles.fieldGroup}>
                <label htmlFor="reset-email" className={styles.fieldLabel}>
                  {isFr ? "ADRESSE EMAIL ADMINISTRATEUR" : "ADMINISTRATOR EMAIL"}
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={19} className={styles.fieldIcon} />
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@divinexpress.com"
                    className={styles.inputElement}
                    disabled={pending}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className={styles.submitButton}
              >
                {pending ? (
                  <div className={styles.spinner} />
                ) : (
                  <>
                    <span>
                      {isFr
                        ? "Envoyer le lien de réinitialisation"
                        : "Send password reset link"}
                    </span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className={styles.backToLoginWrapper}>
            <Link href="/signin" className={styles.backLink}>
              <ArrowLeft size={16} />
              <span>
                {isFr
                  ? "Retour à la page de connexion"
                  : "Back to sign in page"}
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
