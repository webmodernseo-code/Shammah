"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PaymentMethods from "@/components/common/PaymentMethods";

export default function Footer1({
  paddingBottom = false,
  cloud = false,
  fullWidth = false,
  parentClass = "footer-default",
}) {
  useEffect(() => {
    const headings = document.querySelectorAll(".footer-heading-mobile");

    const toggleOpen = (event) => {
      const parent = event.target.closest(".footer-col-block");
      const content = parent.querySelector(".tf-collapse-content");

      if (parent.classList.contains("open")) {
        parent.classList.remove("open");
        content.style.height = "0px";
      } else {
        parent.classList.add("open");
        content.style.height = content.scrollHeight + 10 + "px";
      }
    };

    headings.forEach((heading) => {
      heading.addEventListener("click", toggleOpen);
    });

    // Clean up event listeners when the component unmounts
    return () => {
      headings.forEach((heading) => {
        heading.removeEventListener("click", toggleOpen);
      });
    };
  }, []); // Empty dependency array means this will run only once on mount

  return (
    <footer
      id="footer"
      className={` ${parentClass} ${paddingBottom ? "footer-pb-2" : "xl-pb-70"
        } ${cloud ? "footer-cloud" : ""}`}
    >
      <div className="footer-top">
        <div className={` ${fullWidth ? "container-full" : "container"}  `}>
          <div className="footer-top-wrap">
            <div className="footer-logo">
              <Link href={`/`}>
                <Image
                  className="logo"
                  alt="logo"
                  src="/images/logo/shammah-logo-black.png"
                  width={2134}
                  height={737}
                  sizes="200px"
                  style={{ width: "200px", height: "auto" }}
                  unoptimized
                />
              </Link>
            </div>
            <ul className="tf-social-icon style-large">
              <li>
                <a
                  href="https://www.facebook.com/"
                  className="social-item social-facebook"
                >
                  <i className="icon icon-fb" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/"
                  className="social-item social-instagram"
                >
                  <i className="icon icon-instagram" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.snapchat.com/"
                  className="social-item social-linkedin"
                >
                  <i className="icon icon-linkedin" />
                </a>
              </li>
              <li>
                <a href="https://x.com/" className="social-item social-x">
                  <i className="icon icon-x" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-body">
        <div className={` ${fullWidth ? "container-full" : "container"}  `}>
          <div className="row-footer no-newsletter">
            <div className="footer-col-block s1">
              <div className="footer-heading footer-heading-mobile text-xl fw-medium">
                Contact &amp; Atelier
              </div>
              <div className="tf-collapse-content">
                <div className="footer-contact">
                  <ul className="footer-info">
                    <li className="item">
                      <span className="box-icon">
                        <svg
                          width={12}
                          height={14}
                          viewBox="0 0 12 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.1869 1.73431C9.06854 0.61592 7.58155 0 5.99993 0C4.4183 0 2.93129 0.61592 1.81292 1.73431C0.694534 2.85273 0.0786133 4.33969 0.0786133 5.92129C0.0786133 9.12084 3.10388 11.7821 4.72917 13.2118C4.95504 13.4105 5.15008 13.582 5.30547 13.7272C5.50016 13.9091 5.75006 14 5.9999 14C6.24979 14 6.49964 13.9091 6.69435 13.7272C6.84975 13.582 7.04479 13.4105 7.27065 13.2118C8.89594 11.7821 11.9212 9.12084 11.9212 5.92129C11.9212 4.33969 11.3053 2.85273 10.1869 1.73431ZM6.72897 12.5961C6.49816 12.7991 6.29885 12.9744 6.13451 13.1279C6.05902 13.1984 5.94078 13.1984 5.86526 13.1279C5.70095 12.9744 5.50161 12.7991 5.2708 12.596C3.74283 11.2519 0.898656 8.75001 0.898656 5.92131C0.898656 3.1085 3.18704 0.820124 5.99987 0.820124C8.81268 0.820124 11.1011 3.1085 11.1011 5.92131C11.1011 8.75001 8.25694 11.2519 6.72897 12.5961Z"
                            fill="#0D0D0D"
                          />
                        </svg>
                      </span>
                      <span>Atelier d'impression Print On Demand Shammah</span>
                    </li>
                    <li className="item">
                      <span className="box-icon">
                        <svg
                          width={14}
                          height={14}
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.8125 2.625H2.1875C1.8394 2.625 1.50556 2.76328 1.25942 3.00942C1.01328 3.25556 0.875 3.5894 0.875 3.9375V10.0625C0.875 10.4106 1.01328 10.7444 1.25942 10.9906C1.50556 11.2367 1.8394 11.375 2.1875 11.375H11.8125C12.1606 11.375 12.4944 11.2367 12.7406 10.9906C12.9867 10.7444 13.125 10.4106 13.125 10.0625V3.9375C13.125 3.5894 12.9867 3.25556 12.7406 3.00942C12.4944 2.76328 12.1606 2.625 11.8125 2.625ZM11.5675 3.5L7.28 7.07438C7.20139 7.13985 7.10231 7.17571 7 7.17571C6.89769 7.17571 6.79861 7.13985 6.72 7.07438L2.4325 3.5H11.5675ZM11.8125 10.5H2.1875C2.07147 10.5 1.96019 10.4539 1.87814 10.3719C1.79609 10.2898 1.75 10.1785 1.75 10.0625V4.06875L6.16 7.74375C6.39584 7.94019 6.69307 8.04776 7 8.04776C7.30693 8.04776 7.60416 7.94019 7.84 7.74375L12.25 4.06875V10.0625C12.25 10.1785 12.2039 10.2898 12.1219 10.3719C12.0398 10.4539 11.9285 10.5 11.8125 10.5Z"
                            fill="#0D0D0D"
                          />
                        </svg>
                      </span>
                      <a href="mailto:contact@shammah.eu">contact@shammah.eu</a>
                    </li>
                  </ul>
                  <Link
                    href="/contact-us"
                    className="tf-btn btn-line-dark fw-normal"
                  >
                    <span className="text-sm"> Nous contacter </span>
                    <i className="icon-arrow-top-left fs-8" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="footer-inner-wrap s3">
              <div className="footer-col-block inner-col">
                <div className="footer-heading footer-heading-mobile text-xl fw-medium">
                  Boutique &amp; Marque
                </div>
                <div className="tf-collapse-content">
                  <ul className="footer-menu-list">
                    <li>
                      <Link href={`/about-us`}>Notre Histoire</Link>
                    </li>
                    <li>
                      <Link href={`/shop-default`}>Tous les produits</Link>
                    </li>
                    <li>
                      <Link href={`/shop-collection-list`}>Nos Collections</Link>
                    </li>
                    <li>
                      <Link href="/zones-livraison">Zones de livraison</Link>
                    </li>
                    <li>
                      <Link href={`/contact-us`}>Contact &amp; Support</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="footer-col-block inner-col">
                <div className="footer-heading footer-heading-mobile text-xl fw-medium">
                  Service Client
                </div>
                <div className="tf-collapse-content">
                  <ul className="footer-menu-list">
                    <li>
                      <Link href={`/shipping`}>Livraison &amp; Délais</Link>
                    </li>
                    <li>
                      <Link href={`/return`}>Retours &amp; Échanges</Link>
                    </li>
                    <li>
                      <Link href={`/faq`}>Foire aux Questions (FAQ)</Link>
                    </li>
                    <li>
                      <Link href={`/privacy-policy`}>Confidentialité</Link>
                    </li>
                    <li>
                      <Link href={`/term-and-condition`}>Conditions Générales</Link>
                    </li>
                    <li>
                      <a href={process.env.NEXT_PUBLIC_DASHBOARD_URL || (process.env.NODE_ENV === "production" ? "https://admin.shammah.eu" : "http://localhost:3001")} target="_blank" rel="noopener noreferrer">
                        Espace Administration
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-wrap">
            <p className="text-dark">
              Copyright © 2026 <span className="fw-medium">Shammah.</span> Tous droits réservés.
              {" • "}
              <a href={process.env.NEXT_PUBLIC_DASHBOARD_URL || (process.env.NODE_ENV === "production" ? "https://admin.shammah.eu" : "http://localhost:3001")} target="_blank" rel="noopener noreferrer" className="text-decoration-underline ms-1" title="Tableau de bord Shammah">
                Tableau de bord (Admin)
              </a>
            </p>
            <PaymentMethods className="tf-payment" />
          </div>
        </div>
      </div>
    </footer>
  );
}
