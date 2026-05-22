/**
 * SHAMMAH - INTERACTIVE JAVASCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Sticky Header on Scroll
    const header = document.getElementById('main-header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on load in case page is already scrolled

    // 3. Mobile Navigation Menu Toggle
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mainNav = document.getElementById('main-nav');
    const menuIcon = document.getElementById('menu-icon');

    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', () => {
            const isActive = mainNav.classList.toggle('active');
            
            // Toggle icon between 'menu' and 'x'
            if (isActive) {
                menuIcon.setAttribute('data-lucide', 'x');
                mobileNavToggle.setAttribute('aria-label', 'Fermer le menu');
            } else {
                menuIcon.setAttribute('data-lucide', 'menu');
                mobileNavToggle.setAttribute('aria-label', 'Ouvrir le menu');
            }
            
            // Re-render lucide icons to update the icon visual
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });

        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuIcon.setAttribute('data-lucide', 'menu');
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }
            });
        });
    }

    // 4. Interactive Link Estimator & Modal Dialog
    const productLinkInput = document.getElementById('product-link-input');
    const estimateBtn = document.getElementById('estimate-btn');
    const exampleLink1 = document.getElementById('example-link-1');
    
    const estimateModal = document.getElementById('estimate-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalProductUrl = document.getElementById('modal-product-url');
    
    const estimationForm = document.getElementById('estimation-form');
    const successAlert = document.getElementById('success-alert');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');

    // Copy example link to input on click
    if (exampleLink1 && productLinkInput) {
        exampleLink1.addEventListener('click', () => {
            productLinkInput.value = exampleLink1.textContent;
            productLinkInput.focus();
        });
    }

    // =========================================================================
    // REAL PRODUCT DATA EXTRACTOR (via CORS proxy)
    // =========================================================================

    /**
     * Cleans up raw text extracted from HTML (trim, collapse spaces, etc.)
     */
    const cleanText = (text) => (text || '').replace(/\s+/g, ' ').trim();

    /**
     * Attempts to extract product name, price, and weight from a product page URL.
     * Strategy:
     *   1. Open Graph meta tags (og:title, product:price:amount)
     *   2. JSON-LD structured data (schema.org/Product)
     *   3. Site-specific CSS selectors (Amazon, Zara, Shein, eBay...)
     */
    const extractProductData = async (url) => {
        const PROXY = 'https://api.allorigins.win/get?url=';
        const fetchUrl = PROXY + encodeURIComponent(url);

        const response = await fetch(fetchUrl, { signal: AbortSignal.timeout(12000) });
        if (!response.ok) throw new Error(`Proxy HTTP error: ${response.status}`);

        const json = await response.json();
        const html = json.contents;
        if (!html) throw new Error('Empty page content from proxy');

        // Parse HTML into a document
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const getMeta = (attr, value) =>
            doc.querySelector(`meta[${attr}="${value}"]`)?.getAttribute('content') || '';

        // --- 1. Open Graph & standard meta tags ---
        let name  = cleanText(getMeta('property', 'og:title') || getMeta('name', 'twitter:title'));
        let price = cleanText(
            getMeta('property', 'product:price:amount') ||
            getMeta('property', 'og:price:amount') ||
            getMeta('property', 'og:price') ||
            getMeta('itemprop', 'price')
        );
        let currency = getMeta('property', 'product:price:currency') || getMeta('property', 'og:price:currency') || '';
        let weight = '';

        // --- 2. JSON-LD structured data (schema.org/Product) ---
        doc.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
            try {
                const raw = script.textContent;
                const data = JSON.parse(raw);
                const items = Array.isArray(data) ? data : [data, ...(data['@graph'] || [])];
                items.forEach(item => {
                    if (!item) return;
                    const type = (item['@type'] || '').toLowerCase();
                    if (type.includes('product')) {
                        if (!name && item.name) name = cleanText(item.name);
                        if (!price) {
                            const offers = item.offers;
                            if (offers) {
                                const offer = Array.isArray(offers) ? offers[0] : offers;
                                price = cleanText(String(offer.price || ''));
                                currency = currency || offer.priceCurrency || '';
                            }
                        }
                        if (!weight && item.weight) {
                            weight = cleanText(typeof item.weight === 'object'
                                ? `${item.weight.value} ${item.weight.unitCode || 'kg'}`
                                : String(item.weight));
                        }
                    }
                });
            } catch (_) { /* ignore malformed JSON */ }
        });

        // --- 3. Site-specific DOM selectors as final fallback ---
        const lower = url.toLowerCase();

        if (lower.includes('amazon')) {
            // Amazon product title & price selectors
            if (!name) {
                name = cleanText(
                    doc.querySelector('#productTitle')?.textContent ||
                    doc.querySelector('.product-title-word-break')?.textContent ||
                    doc.querySelector('h1.a-size-large')?.textContent
                );
            }
            if (!price) {
                price = cleanText(
                    doc.querySelector('.a-price .a-offscreen')?.textContent ||
                    doc.querySelector('#priceblock_ourprice')?.textContent ||
                    doc.querySelector('#priceblock_dealprice')?.textContent ||
                    doc.querySelector('.a-price-whole')?.textContent
                );
            }
            if (!weight) {
                // Try to find weight in product details table
                const rows = doc.querySelectorAll('#prodDetails tr, #detailBullets_feature_div li');
                rows.forEach(row => {
                    const txt = row.textContent.toLowerCase();
                    if (txt.includes('poids') || txt.includes('weight') || txt.includes('kg') || txt.includes('gramme')) {
                        const val = row.querySelector('td:last-child, span.a-list-item');
                        if (val) weight = cleanText(val.textContent);
                    }
                });
            }
        } else if (lower.includes('zara')) {
            if (!name) name = cleanText(doc.querySelector('.product-detail-info__name')?.textContent || doc.querySelector('h1')?.textContent);
            if (!price) price = cleanText(doc.querySelector('.money-amount__main')?.textContent || doc.querySelector('[class*="price"]')?.textContent);
        } else if (lower.includes('shein')) {
            if (!name) name = cleanText(doc.querySelector('.product-intro__head-name')?.textContent || doc.querySelector('h1')?.textContent);
            if (!price) price = cleanText(doc.querySelector('.product-intro__head-price')?.textContent || doc.querySelector('[class*="price"]')?.textContent);
        } else if (lower.includes('ebay')) {
            if (!name) name = cleanText(doc.querySelector('#itemTitle')?.textContent?.replace('Détails du produit sur', '') || doc.querySelector('h1')?.textContent);
            if (!price) price = cleanText(doc.querySelector('#prcIsum')?.textContent || doc.querySelector('.x-price-primary')?.textContent);
        } else if (lower.includes('asos')) {
            if (!name) name = cleanText(doc.querySelector('[data-id="product-title"]')?.textContent || doc.querySelector('h1')?.textContent);
            if (!price) price = cleanText(doc.querySelector('[data-id="current-price"]')?.textContent || doc.querySelector('[class*="price"]')?.textContent);
        }

        // --- 4. Generic title fallback ---
        if (!name) {
            name = cleanText(doc.querySelector('title')?.textContent?.split(/[|\-–]/)[0]);
        }

        // --- Format price with currency ---
        if (price && currency && !price.includes(currency) && !price.includes('€') && !price.includes('$') && !price.includes('£')) {
            price = `${price} ${currency}`;
        }

        return { name, price, weight };
    };

    // =========================================================================
    // BUTTON HANDLER — triggers real extraction on click
    // =========================================================================
    if (estimateBtn && productLinkInput && estimateModal) {
        estimateBtn.addEventListener('click', async () => {
            const urlValue = productLinkInput.value.trim();

            if (!urlValue) {
                productLinkInput.placeholder = "⚠️ Veuillez coller un lien valide d'abord...";
                productLinkInput.focus();
                const inputBox = document.getElementById('interactive-input-box');
                inputBox.style.animation = 'shake 0.5s ease';
                setTimeout(() => { inputBox.style.animation = ''; }, 500);
                return;
            }

            // Show analysis overlay
            const analysisOverlay  = document.getElementById('analysis-overlay');
            const progressFill     = document.getElementById('analysis-progress-fill');
            const statusTitle      = document.getElementById('analysis-status-title');
            const statusDesc       = document.getElementById('analysis-status-desc');

            if (!analysisOverlay) return;
            analysisOverlay.removeAttribute('hidden');
            document.body.style.overflow = 'hidden';

            // Animated progress steps
            const setStep = (pct, title, desc) => {
                progressFill.style.width = pct + '%';
                statusTitle.textContent = title;
                statusDesc.textContent  = desc;
            };

            setStep(10, 'Connexion à la boutique...', 'Sécurisation du tunnel et identification du site marchand.');
            await new Promise(r => setTimeout(r, 400));
            setStep(30, 'Chargement de la page produit...', 'Récupération du contenu HTML via notre passerelle sécurisée...');
            await new Promise(r => setTimeout(r, 300));
            setStep(55, 'Analyse des métadonnées...', 'Lecture des balises Open Graph, JSON-LD et données structurées...');

            let extracted = { name: '', price: '', weight: '' };
            let extractionOk = false;

            try {
                extracted = await extractProductData(urlValue);
                extractionOk = !!(extracted.name || extracted.price);
                setStep(85, 'Extraction des données produit...', 'Nom, prix et poids détectés depuis la page de la boutique.');
                await new Promise(r => setTimeout(r, 400));
                setStep(100, extractionOk ? 'Extraction réussie !' : 'Extraction partielle.', 
                    extractionOk
                        ? 'Les données ont été récupérées depuis la page produit.'
                        : 'Certaines données n\'ont pas pu être extraites. Complétez manuellement.');
            } catch (err) {
                console.warn('[Shammah Extractor] Erreur:', err.message);
                setStep(100, 'Accès restreint par la boutique.', 'Le site marchand a bloqué l\'extraction automatique. Complétez manuellement.');
            }

            await new Promise(r => setTimeout(r, 700));
            analysisOverlay.setAttribute('hidden', 'true');

            // Detect store name
            const detectedStore = storeFromUrl(urlValue);

            // Populate form fields
            if (modalProductUrl) modalProductUrl.value = urlValue;

            const nameField   = document.getElementById('modal-product-name');
            const priceField  = document.getElementById('modal-product-price');
            const weightField = document.getElementById('modal-product-weight');

            nameField.value   = extracted.name  || '';
            nameField.placeholder = extracted.name  ? '' : `Nom du produit sur ${detectedStore}`;

            priceField.value  = extracted.price || '';
            priceField.placeholder = extracted.price ? '' : `Prix affiché sur ${detectedStore} (ex: 49,99 €)`;

            weightField.value = extracted.weight || '';
            weightField.placeholder = 'Poids estimé (ex: 0.8 kg) — optionnel';

            // Update store hint block
            const modalHint = document.getElementById('modal-store-hint');
            if (modalHint) {
                if (extractionOk) {
                    modalHint.style.background = '#F0FDF4';
                    modalHint.style.borderLeftColor = '#22C55E';
                    modalHint.style.borderColor = '#BBF7D0';
                    modalHint.style.color = '#166534';
                    modalHint.innerHTML = `<i data-lucide="check-circle-2" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;"></i>
                        <span>Données extraites depuis <strong>${detectedStore}</strong>. Vérifiez et complétez si nécessaire avant d'envoyer.</span>`;
                } else {
                    modalHint.innerHTML = `<i data-lucide="alert-circle" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;"></i>
                        <span>Boutique détectée : <strong>${detectedStore}</strong>. L'extraction automatique a été limitée. Complétez les champs manuellement.</span>`;
                }
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }

            // Reset custom inputs
            document.getElementById('modal-product-qty').value = 1;
            document.getElementById('modal-product-size').value = '';
            document.getElementById('modal-product-color').value = '';

            // Open modal
            estimateModal.removeAttribute('hidden');
            if (estimationForm) estimationForm.style.display = 'block';
            if (successAlert)   successAlert.setAttribute('hidden', 'true');
        });
    }

    // CSS shake keyframe styling (added programmatically to keep it contained)
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
        }
    `;
    document.head.appendChild(styleSheet);

    // Close modal function
    const closeModal = () => {
        if (estimateModal) {
            estimateModal.setAttribute('hidden', 'true');
            document.body.style.overflow = ''; // Restore scrolling
        }
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Form Submission Simulation & WhatsApp integration
    if (estimationForm) {
        estimationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Extract form inputs
            const pUrl = modalProductUrl.value.trim();
            const pName = document.getElementById('modal-product-name').value.trim();
            const pPrice = document.getElementById('modal-product-price').value.trim();
            const pWeight = document.getElementById('modal-product-weight').value.trim();
            const pQty = document.getElementById('modal-product-qty').value.trim();
            const pSize = document.getElementById('modal-product-size').value.trim() || "Non spécifié";
            const pColor = document.getElementById('modal-product-color').value.trim() || "Non spécifié";
            const cName = document.getElementById('client-name').value.trim();
            const cPhone = document.getElementById('client-phone').value.trim();
            const cCountryCode = document.getElementById('client-country').value;
            
            // Get country routing details
            const route = countryMapping[cCountryCode] || countryMapping.CI;

            // Formulate WhatsApp message text
            const textMessage = `Bonjour Shammah ! Je souhaite commander cet article :\n\n` + 
                                `🔗 Lien : ${pUrl}\n` +
                                `📦 Produit : ${pName}\n` +
                                `💰 Prix d'origine : ${pPrice}\n` +
                                `⚖️ Poids estimé : ${pWeight}\n` +
                                `🔢 Quantité : ${pQty}\n` +
                                `📏 Taille : ${pSize}\n` +
                                `🎨 Couleur : ${pColor}\n\n` +
                                `👤 Client : ${cName} (${cPhone})\n` +
                                `📍 Pays de livraison : ${route.label}`;
            
            // Disable button during WhatsApp redirect animation
            if (modalSubmitBtn) {
                modalSubmitBtn.disabled = true;
                modalSubmitBtn.innerHTML = "<i data-lucide='loader-2' class='spinner-icon animate-spin' style='width:18px;height:18px;margin-right:8px;'></i> Redirection...";
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }

            // Simulate slight delay before WhatsApp redirect
            setTimeout(() => {
                // Hide form, show success message
                estimationForm.style.display = 'none';
                if (successAlert) {
                    successAlert.removeAttribute('hidden');
                }
                
                // Clear inputs
                if (productLinkInput) productLinkInput.value = '';
                
                // Trigger redirection
                const whatsappUrl = `https://wa.me/${route.phone}?text=${encodeURIComponent(textMessage)}`;
                window.open(whatsappUrl, '_blank');
                
                // Restore submit button label
                if (modalSubmitBtn) {
                    modalSubmitBtn.disabled = false;
                    modalSubmitBtn.innerHTML = "<i data-lucide='message-square'></i> Envoyer ma commande sur WhatsApp";
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }

                // Close modal dialog automatically
                setTimeout(() => {
                    closeModal();
                }, 3000);

            }, 1200);
        });
    }

    // 5. FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isExpanded = question.getAttribute('aria-expanded') === 'true';

            // Toggle current item
            faqItem.classList.toggle('active');
            question.setAttribute('aria-expanded', !isExpanded);
            
            if (!isExpanded) {
                answer.removeAttribute('hidden');
            } else {
                answer.setAttribute('hidden', 'true');
            }

            // Close other items (optional: accordion behavior)
            const allItems = document.querySelectorAll('.faq-item');
            allItems.forEach(item => {
                if (item !== faqItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                    const itemQuestion = item.querySelector('.faq-question');
                    const itemAnswer = item.querySelector('.faq-answer');
                    itemQuestion.setAttribute('aria-expanded', 'false');
                    itemAnswer.setAttribute('hidden', 'true');
                }
            });
        });
    });

    // 6. Scroll Reveal Animations (using Intersection Observer)
    const revealElements = [
        '.step-card',
        '.benefit-card',
        '.benefits-intro',
        '.pricing-card',
        '.testimonial-card',
        '.faq-item',
        '.cta-card'
    ];

    // Add '.reveal' class to target elements programmatically
    revealElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('reveal');
        });
    });

    // Initialize IntersectionObserver
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            threshold: 0.1, // Trigger when 10% of the element is visible
            rootMargin: '0px 0px -50px 0px' // Slightly offset trigger
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Stop observing after animation triggers
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        // Fallback for older browsers
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('active');
        });
    }

    // 7. Active Nav Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    });
});
