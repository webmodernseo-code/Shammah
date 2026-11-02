"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import styles from "./SetNewPasswordPanel.module.css";

export default function SetNewPasswordPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isFr = locale === "fr";

  const toggleLanguage = () => {
    setLocale((prev) => (prev === "fr" ? "en" : "fr"));
  };

  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      const msg = isFr
        ? "Lien de réinitialisation invalide ou manquant."
        : "Invalid or missing reset link.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber) {
      const msg = isFr
        ? "Le mot de passe doit respecter tous les critères de sécurité (12 caractères, majuscule, chiffre)."
        : "The password must satisfy all security requirements (12 chars, uppercase, number).";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = isFr
        ? "Les deux mots de passe ne correspondent pas."
        : "Passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg =
          data.error ||
          (isFr
            ? "Ce lien de réinitialisation est invalide ou a expiré."
            : "This reset link is invalid or has expired.");
        setError(errMsg);
        toast.error(errMsg);
        setPending(false);
        return;
      }

      setSuccess(true);
      toast.success(
        isFr
          ? "Mot de passe mis à jour avec succès !"
          : "Password updated successfully!"
      );

      setTimeout(() => {
        router.push("/signin");
        router.refresh();
      }, 2500);
    } catch {
      setError(
        isFr
          ? "Impossible de réinitialiser le mot de passe. Vérifiez votre connexion."
          : "Unable to reset password. Please check your connection."
      );
      toast.error(
        isFr ? "Erreur serveur de réinitialisation." : "Reset server error."
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
          src="/image/divinexpress-admin-hero.jpg"
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
              Sécurisez votre
              <br />
              espace de
              <br />
              gestion.
            </h1>
            <p className={styles.heroDescription}>
              Choisissez un mot de passe robuste pour protéger vos commandes, données clients et paramètres financiers.
            </p>
            <div className={styles.heroSecurityBadge}>
              <ShieldCheck className={styles.heroSecurityIcon} size={20} />
              <span>Chiffrement Scrypt & Hachage cryptographique fort.</span>
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
              {isFr ? "Nouveau mot de passe" : "New password"}
            </h2>
            <p className={styles.formSubtitle}>
              {isFr
                ? "Définissez un nouveau mot de passe pour sécuriser votre compte."
                : "Set a new password to secure your administrator account."}
            </p>
          </div>

          {!token && (
            <div className={styles.alertError} role="alert">
              <AlertCircle size={18} />
              <span>
                {isFr
                  ? "Aucun jeton de réinitialisation détecté. Veuillez utiliser le lien reçu par email."
                  : "No reset token detected. Please use the link received by email."}
              </span>
            </div>
          )}

          {error && (
            <div className={styles.alertError} role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className={styles.successCard}>
              <div className={styles.successIconWrapper}>
                <CheckCircle2 size={32} />
              </div>
              <h3 className={styles.successTitle}>
                {isFr ? "Mot de passe mis à jour !" : "Password updated!"}
              </h3>
              <p className={styles.successDescription}>
                {isFr
                  ? "Votre mot de passe administrateur a été réinitialisé avec succès. Redirection vers la page de connexion..."
                  : "Your administrator password has been updated. Redirecting to sign in..."}
              </p>
              <Link href="/signin" className={styles.submitButton}>
                <span>{isFr ? "Se connecter maintenant" : "Sign in now"}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.formBody} noValidate>
              <div className={styles.fieldGroup}>
                <label htmlFor="new-password" className={styles.fieldLabel}>
                  {isFr ? "NOUVEAU MOT DE PASSE" : "NEW PASSWORD"}
                </label>
                <div className={styles.inputWrapper}>
                  <LockKeyhole size={19} className={styles.fieldIcon} />
                  <input
                    id="new-password"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={styles.inputElement}
                    disabled={pending || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.togglePasswordBtn}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="confirm-password" className={styles.fieldLabel}>
                  {isFr ? "CONFIRMER LE MOT DE PASSE" : "CONFIRM PASSWORD"}
                </label>
                <div className={styles.inputWrapper}>
                  <LockKeyhole size={19} className={styles.fieldIcon} />
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={styles.inputElement}
                    disabled={pending || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.togglePasswordBtn}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist */}
              <div className={styles.strengthBox}>
                <p className={styles.strengthTitle}>
                  {isFr ? "Exigences de sécurité :" : "Security requirements:"}
                </p>
                <div className={styles.strengthGrid}>
                  <div
                    className={`${styles.strengthItem} ${
                      hasMinLength ? styles.strengthItemActive : ""
                    }`}
                  >
                    <Check size={14} />
                    <span>12 caractères min.</span>
                  </div>
                  <div
                    className={`${styles.strengthItem} ${
                      hasUppercase ? styles.strengthItemActive : ""
                    }`}
                  >
                    <Check size={14} />
                    <span>Une majuscule</span>
                  </div>
                  <div
                    className={`${styles.strengthItem} ${
                      hasNumber ? styles.strengthItemActive : ""
                    }`}
                  >
                    <Check size={14} />
                    <span>Un chiffre</span>
                  </div>
                  <div
                    className={`${styles.strengthItem} ${
                      passwordsMatch ? styles.strengthItemActive : ""
                    }`}
                  >
                    <Check size={14} />
                    <span>Mots de passe identiques</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={pending || !token}
                className={styles.submitButton}
              >
                {pending ? (
                  <div className={styles.spinner} />
                ) : (
                  <>
                    <span>
                      {isFr
                        ? "Valider le nouveau mot de passe"
                        : "Confirm new password"}
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
