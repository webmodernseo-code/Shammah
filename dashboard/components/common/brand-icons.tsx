import React from "react";

export interface BrandIconProps {
  className?: string;
  size?: number | string;
  color?: string;
  title?: string;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *  OFFICIAL SIMPLE ICONS VECTOR COMPONENT SUITE FOR SHAMMAH
 *  Source: https://simpleicons.org (100% Pure SVGs, Zero Pixel Slop)
 * ═══════════════════════════════════════════════════════════════════
 */

// ── 1. PASSERELLES DE PAIEMENT & FINTECH ──

export function SiStripe({ className = "size-5", size, color = "#635BFF", title = "Stripe" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.839 3.771 6.819 7.825 8.169 2.508.825 3.371 1.488 3.371 2.457 0 .977-.852 1.487-2.316 1.487-2.17 0-4.945-.968-6.903-2.07l-.924 5.584c2.25 1.139 5.378 1.94 8.749 1.94 2.651 0 4.846-.662 6.381-1.928 1.597-1.314 2.42-3.197 2.42-5.464-.001-4.708-3.791-6.756-8.384-8.243z" />
    </svg>
  );
}

export function SiPaypal({ className = "size-5", size, color = "#00457C", title = "PayPal" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.54L.004 3.097A.644.644 0 0 1 .637 2.4h7.525c3.082 0 5.485.672 6.702 2.062 1.176 1.343 1.34 3.198.818 5.617-.678 3.141-2.45 5.556-5.183 6.945-1.077.547-2.368.822-3.834.822h-1.61a.64.64 0 0 0-.633.54l-.946 5.951zm5.908-14.717c-.57-.65-1.646-.96-3.21-.96H4.218l-1.52 12.023h3.048l.946-5.951a1.921 1.921 0 0 1 1.9-1.621h1.61c2.478 0 4.304-1.258 4.908-3.712.434-1.764.123-2.99-.776-3.779z" />
    </svg>
  );
}

export function SiApple({ className = "size-5", size, color = "currentColor", title = "Apple Pay" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.37c.62-.75 1.04-1.8 1.01-2.85-.92.04-2.04.62-2.7 1.39-.58.67-1.09 1.74-1.02 2.78 1.03.08 2.09-.57 2.71-1.32z" />
    </svg>
  );
}

export function SiGoogle({ className = "size-5", size, color = "#4285F4", title = "Google" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.067 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}

export function SiVisa({ className = "size-5", size, color = "#1434CB", title = "Visa" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M9.467 1.583L5.894 17.404H2.072L0 3.393c0-.022 0-.044.022-.066.38-.804 1.517-1.543 2.651-1.744h6.794zm14.533.023l-3.23 15.798h-3.573l3.23-15.798H24zm-8.874 10.742l1.9-5.176 1.096 5.176h-2.996zm4.184 5.056h3.454l-3.003-14.167c-.126-.525-.568-.888-1.104-.888h-5.016l-.23.957 4.195 9.098zm-6.938-15.8h-3.693l-5.69 13.914 3.753.01 2.21-6.077h4.743l.45 2.16 3.65-.008L12.372 1.604z" />
    </svg>
  );
}

export function SiMastercard({ className = "size-5", size, color = "#EB001B", title = "Mastercard" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M14.28 4.45a8.77 8.77 0 0 0-5.74 2.15A8.77 8.77 0 1 0 14.28 4.45zm0 15.1a6.33 6.33 0 0 1-3.66-1.15 8.75 8.75 0 0 0 0-12.8 6.33 6.33 0 1 1 3.66 13.95zM7.22 5.6A6.33 6.33 0 1 1 3.56 16.8 6.33 6.33 0 0 1 7.22 5.6z" />
    </svg>
  );
}

// ── 2. CLOUD, MÉDIAS & STOCKAGE ──

export function SiCloudinary({ className = "size-5", size, color = "#3448C5", title = "Cloudinary" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M18.847 7.747a6.25 6.25 0 0 0-5.897-4.14 6.262 6.262 0 0 0-5.986 4.385A7.545 7.545 0 0 0 0 15.393C0 19.594 3.406 23 7.607 23h11.205C21.677 23 24 20.677 24 17.812a5.187 5.187 0 0 0-5.153-5.188c-.04 0-.079.002-.119.005a6.236 6.236 0 0 0 .119-1.205 6.21 6.21 0 0 0 0-3.677z" />
    </svg>
  );
}

export function SiAmazons3({ className = "size-5", size, color = "#569A31", title = "Amazon S3" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12 0L1.75 5.92v12.16L12 24l10.25-5.92V5.92L12 0zm0 2.31l7.98 4.61-3.61 2.08-7.98-4.61 3.61-2.08zm-9 4.61l7.98 4.61v4.17L3 11.09V6.92zm9 8.78l7.98-4.61v4.17l-7.98 4.61v-4.17z" />
    </svg>
  );
}

// ── 3. SERVEURS DE MESSAGERIE & SMTP ──

export function SiGmail({ className = "size-5", size, color = "#EA4335", title = "Gmail" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

export function SiBrevo({ className = "size-5", size, color = "#0B996F", title = "Brevo" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
    </svg>
  );
}

export function SiPostgresql({ className = "size-5", size, color = "#4169E1", title = "PostgreSQL" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12 0a12 12 0 1 0 12 12A12.014 12.014 0 0 0 12 0zm6.09 16.42a4.93 4.93 0 0 1-1.37.94 8.7 8.7 0 0 1-2.22.61c-.5.06-1.02.09-1.54.09-2.3 0-4.17-.67-5.54-1.99a6.83 6.83 0 0 1-2.02-5.06c0-2.06.74-3.79 2.2-5.14A7.8 7.8 0 0 1 12.92 4.4a7.97 7.97 0 0 1 4.56 1.25 5.56 5.56 0 0 1 2.14 3.42l-2.48.66c-.34-.94-.85-1.63-1.53-2.09a5.1 5.1 0 0 0-2.78-.66 4.9 4.9 0 0 0-3.56 1.34 5.06 5.06 0 0 0-1.42 3.73c0 1.5.47 2.76 1.4 3.75a4.87 4.87 0 0 0 3.63 1.45 6.06 6.06 0 0 0 2.22-.38 4.3 4.3 0 0 0 1.62-1.12l1.38 1.67z" />
    </svg>
  );
}

export function SiVercel({ className = "size-5", size, color = "currentColor", title = "Vercel" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  );
}

export function SiGithub({ className = "size-5", size, color = "currentColor", title = "GitHub" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

// ── 4. RÉSEAUX SOCIAUX & CANAUX MARKETING ──

export function SiInstagram({ className = "size-5", size, color = "#E4405F", title = "Instagram" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  );
}

export function SiTiktok({ className = "size-5", size, color = "currentColor", title = "TikTok" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function SiFacebook({ className = "size-5", size, color = "#1877F2", title = "Facebook" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function SiX({ className = "size-5", size, color = "currentColor", title = "X (Twitter)" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export function SiWhatsapp({ className = "size-5", size, color = "#25D366", title = "WhatsApp" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8.01 12.27C8.14 12.44 9.76 14.94 12.24 16.01C12.83 16.27 13.29 16.42 13.65 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 13.99C16.32 13.86 15.12 13.27 14.9 13.19C14.68 13.1 14.52 13.06 14.36 13.3C14.19 13.55 13.73 14.11 13.59 14.27C13.45 14.44 13.31 14.46 13.07 14.34C12.82 14.21 11.79 13.87 10.56 12.78C9.61 11.93 8.96 10.88 8.82 10.63C8.68 10.39 8.81 10.25 8.93 10.13C9.04 10.02 9.18 9.84 9.3 9.7C9.43 9.56 9.47 9.45 9.55 9.29C9.63 9.12 9.59 8.98 9.53 8.86C9.47 8.74 8.99 7.56 8.79 7.08C8.6 6.61 8.4 6.67 8.25 6.66C8.11 6.66 7.95 6.65 7.78 6.65" />
    </svg>
  );
}

export function SiPinterest({ className = "size-5", size, color = "#BD081C", title = "Pinterest" }: BrandIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.171-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12.004-5.367 12.004-11.987C24.021 5.367 18.644 0 12.017 0z" />
    </svg>
  );
}
