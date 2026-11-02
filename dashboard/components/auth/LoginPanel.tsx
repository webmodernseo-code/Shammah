"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import styles from "./LoginPanel.module.css";

export default function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCallback = searchParams.get("callbackUrl");
  const callbackUrl = requestedCallback?.startsWith("/") && !requestedCallback.startsWith("//")
    ? requestedCallback
    : "/";

  const [locale, setLocale] = useState<"fr" | "en">("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const isFr = locale === "fr";

  const toggleLanguage = () => {
    setLocale((prev) => (prev === "fr" ? "en" : "fr"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      const msg = isFr
        ? "Veuillez renseigner tous les champs obligatoires."
        : "Please fill in all required fields.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg =
          data.error ||
          (isFr
            ? "Identifiants administrateur invalides."
            : "Invalid administrator credentials.");
        setError(errMsg);
        toast.error(errMsg);
        setPending(false);
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("divinexpress_admin_active_tab", "1");
        sessionStorage.setItem("divinexpress_last_activity", Date.now().toString());
      }

      toast.success(
        isFr
          ? "Connexion réussie. Bienvenue sur le tableau de bord !"
          : "Signed in successfully. Welcome to your dashboard!"
      );

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Service de connexion indisponible. Réessayez dans quelques instants.");
      toast.error("Service de connexion indisponible.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      {/* Editorial Left Panel */}
      <section className={styles.heroPanel}>
        <Image
          src="/images/auth/login-bg.jpg"
          alt="Espace Administration DivinExpress"
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
            <p className={styles.heroPretitle}>DIVINEXPRESS BACK OFFICE</p>
            <h1 className={styles.heroHeading}>
              Pilotez votre
              <br />
              boutique
              <br />
              avec précision.
            </h1>
            <p className={styles.heroDescription}>
              Produits, commandes, retours et conversations clients réunis dans un seul espace sécurisé.
            </p>
            <div className={styles.heroSecurityBadge}>
              <ShieldCheck className={styles.heroSecurityIcon} size={20} />
              <span>Accès réservé aux membres autorisés.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Login Form Panel */}
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
              {isFr ? "Connexion" : "Sign in"}
            </h2>
            <p className={styles.formSubtitle}>
              {isFr
                ? "Accédez à votre espace d’administration."
                : "Access your administration space."}
            </p>
          </div>

          {error && (
            <div className={styles.alertError} role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.formBody} noValidate>
            <div className={styles.fieldGroup}>
              <label htmlFor="admin-email" className={styles.fieldLabel}>
                {isFr ? "IDENTIFIANT" : "USERNAME"}
              </label>
              <div className={styles.inputWrapper}>
                <UserRound size={19} className={styles.fieldIcon} />
                <input
                  id="admin-email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.inputElement}
                  placeholder={
                    isFr ? "Email ou nom d’utilisateur" : "Email or username"
                  }
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="admin-password" className={styles.fieldLabel}>
                {isFr ? "MOT DE PASSE" : "PASSWORD"}
              </label>
              <div className={styles.inputWrapper}>
                <LockKeyhole size={19} className={styles.fieldIcon} />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputElement}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? isFr
                        ? "Masquer le mot de passe"
                        : "Hide password"
                      : isFr
                      ? "Afficher le mot de passe"
                      : "Show password"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeBtn}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <span>{isFr ? "Se souvenir de moi" : "Remember me"}</span>
              </label>
              <Link href="/forgot-password" className={styles.forgotLink}>
                {isFr ? "Mot de passe oublié ?" : "Forgot password?"}
              </Link>
            </div>

            <button
              type="submit"
              disabled={pending}
              className={styles.submitBtn}
            >
              {pending ? (
                <>
                  <div className={styles.spinner} />
                  <span>{isFr ? "CONNEXION..." : "SIGNING IN..."}</span>
                </>
              ) : (
                <>
                  <span>{isFr ? "SE CONNECTER" : "SIGN IN"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className={styles.securityNote}>
            <LockKeyhole size={14} className={styles.securityNoteIcon} />
            <span>
              {isFr
                ? "Connexion sécurisée et chiffrée."
                : "Secure encrypted connection."}
            </span>
          </p>

          <div className={styles.supportSection}>
            <p className={styles.supportText}>
              <strong>{isFr ? "Besoin d’aide ?" : "Need help?"}</strong>
              <a
                href="mailto:support@divinexpress.com"
                className={styles.supportLink}
              >
                {isFr ? "Contacter l’administrateur" : "Contact administrator"}
              </a>
            </p>
            <div className={styles.badge2FA}>
              <ShieldCheck size={20} className={styles.badge2FAIcon} />
              <p>
                {isFr
                  ? "L’authentification à deux facteurs (2FA) peut être requise après la saisie de vos identifiants."
                  : "Two-factor authentication (2FA) may be required after sign in."}
              </p>
            </div>
          </div>

          <footer className={styles.formFooter}>
            <span>© 2026 DivinExpress</span>
            <div className={styles.footerLinks}>
              <a href={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/privacy-policy`} className={styles.footerLink}>
                Confidentialité
              </a>
              <a href={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/term-and-condition`} className={styles.footerLink}>
                Sécurité
              </a>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
