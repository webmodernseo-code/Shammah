// SHAMMAH - Dashboard Administration Operations

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// App State
let activeVariants = []; // Stores currently added color variants for new product: { name, color, images: [img1, img2, img3], sizesStock }
let editingProductId = null; // Stores the ID of the product currently being edited

function initApp() {
  setupNavigation();
  loadOverviewMetrics();
  loadInventoryList();
  populateCategoryDropdowns();
  populatePromoDropdown();
  renderQuickPromoList();
  setupVariantCreator();
  setupProductPublishForm();
  setupSettingsForms();
  loadCategoryTree();
  loadPromoCodes();
  setupPromoCodesForm();
  setupChartToggle();
}

// 1. SPA Tab switching
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const panels = document.querySelectorAll(".workspace-panel");
  
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");
      
      const targetPanel = item.getAttribute("data-target");
      panels.forEach(p => {
        if (p.id === targetPanel) {
          p.classList.add("active");
        } else {
          p.classList.remove("active");
        }
      });
    });
  });
}

// Helper to detect category sizes
function getSelectedProductSizes() {
  const cat = document.getElementById("prod-category").value;
  if (cat === "gadget") return ["Taille Unique"];
  if (cat === "enfant") return ["2 ans", "4 ans", "6 ans", "8 ans"];
  return ["S", "M", "L", "XL"];
}

// 2. Load Overview metrics
function loadOverviewMetrics() {
  const products = window.db.getProducts();
  const categories = window.db.getCategories();
  
  // Total catalogue models
  const totalModelsEl = document.getElementById("val-stock");
  if (totalModelsEl) totalModelsEl.textContent = `${products.length} Modèles`;

  // Total stock inventory warning levels
  let lowStockCount = 0;
  products.forEach(p => {
    if (p.stock < 3) lowStockCount++;
  });
  
  // Simulate active orders
  const orders = [
    { id: "SH-09312", total: 18500, payType: "MTN MoMo", status: "success", statusText: "Payé" },
    { id: "SH-09311", total: 52.00, payType: "Orange MoMo", status: "info", statusText: "En cours" },
    { id: "SH-09310", total: 8000, payType: "Wave", status: "success", statusText: "Payé" },
    { id: "SH-09309", total: 110.00, payType: "Carte Bancaire", status: "warning", statusText: "Attente" }
  ];
  
  const ordersEl = document.getElementById("val-orders");
  if (ordersEl) ordersEl.textContent = `${orders.length} Commandes`;

  // Calculate revenue
  let totalRevenue = 0;
  orders.forEach(o => {
    if (o.status === "success") {
      // Simple normalized sum in FCFA for display (convert $ to FCFA for calculation)
      const value = o.total < 1000 ? o.total * 600 : o.total;
      totalRevenue += value;
    }
  });
  
  const revenueEl = document.getElementById("val-revenue");
  if (revenueEl) revenueEl.textContent = formatPrice(totalRevenue);

  // Average basket
  const basketEl = document.getElementById("val-basket");
  if (basketEl && orders.length > 0) {
    const avg = totalRevenue / orders.filter(o => o.status === "success").length;
    basketEl.textContent = formatPrice(avg);
  }

  // Load orders table
  const tbody = document.getElementById("dashboard-recent-orders");
  if (tbody) {
    tbody.innerHTML = "";
    orders.forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="padding:10px 14px; font-weight:700;">${o.id}</td>
        <td style="padding:10px 14px;">${formatPrice(o.total)}</td>
        <td style="padding:10px 14px;">${o.payType}</td>
        <td style="padding:10px 14px; text-align:right;">
          <span class="badge-status ${o.status}"><span class="bullet-dot"></span> ${o.statusText}</span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// 3. Load products inventory list on right panel of Products manager
function loadInventoryList() {
  const tbody = document.getElementById("inventory-list-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const products = window.db.getProducts();
  
  products.forEach(p => {
    // Migration fallback for missing sizesStock
    p.sizes = p.sizes || ["S", "M", "L", "XL"];
    p.variants.forEach(v => {
      if (!v.sizesStock) {
        v.sizesStock = {};
        const defaultStock = v.stock !== undefined ? v.stock : (p.stock !== undefined ? p.stock : 10);
        const share = Math.max(0, Math.floor(defaultStock / p.sizes.length));
        p.sizes.forEach((sz, idx) => {
          if (idx === p.sizes.length - 1) {
            v.sizesStock[sz] = defaultStock - share * (p.sizes.length - 1);
          } else {
            v.sizesStock[sz] = share;
          }
        });
      }
    });

    const tr = document.createElement("tr");
    
    // Calculate total stock
    let totalStock = 0;
    p.variants.forEach(v => {
      if (v.sizesStock) {
        Object.keys(v.sizesStock).forEach(sz => {
          totalStock += parseInt(v.sizesStock[sz]) || 0;
        });
      }
    });
    p.stock = totalStock;

    // Low stock warning status
    let stockStatus = `<span class="badge-status success"><span class="bullet-dot"></span> OK</span>`;
    if (p.stock < 3) {
      stockStatus = `<span class="badge-status danger"><span class="bullet-dot"></span> Stock Faible</span>`;
    }
    
    // Inline stock editor inputs per variant color & size combination
    let inlineStocksHTML = `<div style="display:flex; flex-direction:column; gap:6px; font-size:0.7rem; min-width:210px;">`;
    p.variants.forEach(v => {
      p.sizes.forEach(sz => {
        const qty = (v.sizesStock && v.sizesStock[sz] !== undefined) ? v.sizesStock[sz] : 0;
        inlineStocksHTML += `
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <span style="display:flex; align-items:center; gap:4px; font-weight:500;">
              <span style="width:8px; height:8px; border-radius:50%; display:inline-block; background-color:${v.color}; border:1px solid rgba(0,0,0,0.1);"></span>
              ${v.name} (${sz})
            </span>
            <input type="number" value="${qty}" style="width:45px; height:20px; text-align:center; border:1px solid var(--border-medium); border-radius:4px; font-family:inherit; font-size:0.7rem;" onchange="updateVariantSizeStock('${p.id}', '${v.name.replace(/'/g, "\\'")}', '${sz}', this.value)" min="0">
          </div>
        `;
      });
    });
    inlineStocksHTML += `</div>`;

    let promoBadgeHTML = "";
    if (p.promoCode) {
      promoBadgeHTML = `<span class="badge-status info" style="font-size:0.6rem; padding:1px 6px; margin-top:2px; display:inline-block; max-width:fit-content; border-radius:4px; font-weight:700; text-transform:uppercase;">Promo: ${p.promoCode}</span>`;
    }

    tr.innerHTML = `
      <td style="padding:12px 16px; font-weight:700; text-align:left; vertical-align:top;">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="../${p.image}" alt="${p.title}" style="width:32px; height:32px; border-radius:6px; object-fit:cover; border:1px solid var(--border-light);">
          <div>
            <span style="display:block;">${p.title}</span>
            <span style="font-size:0.65rem; color:var(--text-secondary); font-weight:500;">Prix : ${formatPrice(p.price)}</span>
            ${promoBadgeHTML}
          </div>
        </div>
      </td>
      <td style="padding:12px 16px; text-transform:capitalize; vertical-align:top;">${p.categories[0]}</td>
      <td style="padding:12px 16px; text-align:right; font-weight:800; vertical-align:top;">
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
          ${inlineStocksHTML}
          <div style="display:flex; gap:6px; align-items:center; margin-top:4px;">
            <span style="font-size:0.75rem; color:var(--text-secondary);">Total: ${p.stock}</span>
            ${stockStatus}
          </div>
        </div>
      </td>
      <td style="padding:12px 16px; text-align:center; vertical-align:top;">
        <div style="display:flex; justify-content:center; gap:6px; flex-direction:column;">
          <button class="btn-secondary" style="padding:2px 8px; font-size:0.7rem; height:24px; width:80px; justify-content:center;" onclick="editProduct('${p.id}')">Modifier</button>
          <button class="btn-secondary" style="padding:2px 8px; font-size:0.7rem; height:24px; width:80px; justify-content:center; color:var(--color-danger); border-color:var(--color-danger);" onclick="deleteProduct('${p.id}')">Supprimer</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Inline stock updater helper
window.updateVariantSizeStock = function(productId, colorName, size, newQty) {
  const products = window.db.getProducts();
  const p = products.find(prod => prod.id === productId);
  if (p) {
    const v = p.variants.find(varObj => varObj.name === colorName);
    if (v) {
      v.sizesStock = v.sizesStock || {};
      v.sizesStock[size] = Math.max(0, parseInt(newQty) || 0);
      
      // Update variant overall stock
      let vStock = 0;
      Object.keys(v.sizesStock).forEach(sz => {
        vStock += parseInt(v.sizesStock[sz]) || 0;
      });
      v.stock = vStock;

      // Update product overall stock
      let pStock = 0;
      p.variants.forEach(varObj => {
        if (varObj.sizesStock) {
          Object.keys(varObj.sizesStock).forEach(sz => {
            pStock += parseInt(varObj.sizesStock[sz]) || 0;
          });
        }
      });
      p.stock = pStock;

      window.db.saveProduct(p);
      loadOverviewMetrics();
      loadInventoryList();
    }
  }
};

// Edit product action handler
window.editProduct = function(id) {
  const products = window.db.getProducts();
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  editingProductId = p.id;

  // Set card title
  const header = document.getElementById("form-product-title-header");
  if (header) header.textContent = `Modifier : ${p.title}`;

  // Set submit button text
  const btnPublish = document.getElementById("btn-publish-product");
  if (btnPublish) btnPublish.textContent = "Enregistrer les modifications";

  // Display Cancel button
  const btnCancel = document.getElementById("btn-cancel-edit-product");
  if (btnCancel) btnCancel.style.display = "inline-flex";

  // Populate basic inputs
  document.getElementById("prod-title").value = p.title;
  document.getElementById("prod-price").value = p.price;
  document.getElementById("prod-desc").value = p.desc || "";
  document.getElementById("prod-category").value = p.categories[0] || "";
  document.getElementById("prod-promo").value = p.promoCode || "";

  // Populate subcategory options and set value
  loadSubcategoryOptions();
  document.getElementById("prod-subcategory").value = p.subcategory || "";

  // Convert product variants to activeVariants structure
  const sizes = p.sizes || ["S", "M", "L", "XL"];
  activeVariants = p.variants.map((v, idx) => {
    const sizesStock = {};
    if (v.sizesStock) {
      Object.assign(sizesStock, v.sizesStock);
    } else {
      const defaultStock = v.stock !== undefined ? v.stock : (p.stock !== undefined ? p.stock : 10);
      const share = Math.max(0, Math.floor(defaultStock / sizes.length));
      sizes.forEach((sz, sIdx) => {
        if (sIdx === sizes.length - 1) {
          sizesStock[sz] = defaultStock - share * (sizes.length - 1);
        } else {
          sizesStock[sz] = share;
        }
      });
    }

    const images = [null, null, null];
    if (v.images) {
      v.images.forEach((img, i) => {
        if (i < 3) images[i] = img;
      });
    } else if (v.img) {
      images[0] = v.img;
    }

    return {
      id: "var-edit-" + idx + "-" + Date.now(),
      name: v.name,
      color: v.color,
      images: images,
      sizesStock: sizesStock
    };
  });

  renderActiveVariants();

  // Scroll to edit form card
  const formCard = document.getElementById("form-add-product");
  if (formCard) formCard.scrollIntoView({ behavior: "smooth" });
};

// Delete product action handler
window.deleteProduct = function(id) {
  if (confirm("Voulez-vous vraiment supprimer cet article de la boutique ?")) {
    const products = window.db.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem("shammah_db_products", JSON.stringify(filtered));
    
    if (editingProductId === id) {
      cancelProductEdit();
    }
    
    loadOverviewMetrics();
    loadInventoryList();
    alert("L'article a été supprimé avec succès.");
  }
};

// Cancel edit mode helper
function cancelProductEdit() {
  editingProductId = null;

  const header = document.getElementById("form-product-title-header");
  if (header) header.textContent = "Nouveau Produit";

  const btnPublish = document.getElementById("btn-publish-product");
  if (btnPublish) btnPublish.textContent = "Publier sur la boutique";

  const btnCancel = document.getElementById("btn-cancel-edit-product");
  if (btnCancel) btnCancel.style.display = "none";

  // Reset form inputs
  document.getElementById("form-add-product").reset();
  document.getElementById("list-creation-variants").innerHTML = "";
  activeVariants = [];
  
  loadSubcategoryOptions();
}

// 4. Populate category and subcategory selectors
function populateCategoryDropdowns() {
  const prodCatSelect = document.getElementById("prod-category");
  const subcatParentSelect = document.getElementById("subcat-parent");
  if (!prodCatSelect || !subcatParentSelect) return;
  
  const categories = window.db.getCategories();
  
  // Fill category selectors
  prodCatSelect.innerHTML = "";
  subcatParentSelect.innerHTML = "";
  
  categories.forEach(cat => {
    const opt1 = document.createElement("option");
    opt1.value = cat.slug;
    opt1.textContent = cat.name;
    prodCatSelect.appendChild(opt1);
    
    const opt2 = document.createElement("option");
    opt2.value = cat.slug;
    opt2.textContent = cat.name;
    subcatParentSelect.appendChild(opt2);
  });
  
  // Load initial subcategories
  loadSubcategoryOptions();
  
  // Listen to parent selection change
  prodCatSelect.addEventListener("change", () => {
    loadSubcategoryOptions();
    renderActiveVariants();
  });
}

function loadSubcategoryOptions() {
  const prodCatSelect = document.getElementById("prod-category");
  const prodSubcatSelect = document.getElementById("prod-subcategory");
  if (!prodCatSelect || !prodSubcatSelect) return;
  
  const catSlug = prodCatSelect.value;
  const subcategories = window.db.getSubcategoriesForCategory(catSlug);
  
  prodSubcatSelect.innerHTML = "";
  subcategories.forEach(sub => {
    const opt = document.createElement("option");
    opt.value = sub.slug;
    opt.textContent = sub.name;
    prodSubcatSelect.appendChild(opt);
  });
}

// Render creation variants panel
function renderActiveVariants() {
  const container = document.getElementById("list-creation-variants");
  if (!container) return;
  container.innerHTML = "";
  
  const sizes = getSelectedProductSizes();
  
  activeVariants.forEach(v => {
    const item = document.createElement("div");
    item.className = "variant-creation-card";
    item.id = v.id;
    item.style.cssText = "background:#f8fafc; border:1px solid var(--border-light); padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px;";
    
    // Generate inputs for stocks by size
    let sizesStockHTML = `<div style="display:grid; grid-template-columns:repeat(${Math.min(4, sizes.length)}, 1fr); gap:8px; margin-top:6px;">`;
    sizes.forEach(sz => {
      const val = (v.sizesStock && v.sizesStock[sz] !== undefined) ? v.sizesStock[sz] : 5;
      sizesStockHTML += `
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-size:0.6rem; color:var(--text-secondary); margin-bottom:2px; display:block;">Stock ${sz}</label>
          <input type="number" class="var-size-stock-input" data-size="${sz}" value="${val}" style="width:100%; height:26px; font-size:0.75rem; text-align:center; border:1px solid var(--border-medium); border-radius:4px; outline:none;" min="0">
        </div>
      `;
    });
    sizesStockHTML += `</div>`;

    // 3 Photo slots
    let slotsHTML = `<div class="photo-slots-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-top:8px;">`;
    for (let i = 0; i < 3; i++) {
      const img = v.images[i];
      if (img) {
        let imgSrc = img;
        if (imgSrc && !imgSrc.startsWith("data:") && !imgSrc.startsWith("../") && !imgSrc.startsWith("http")) {
          imgSrc = "../" + imgSrc;
        }
        slotsHTML += `
          <div class="photo-slot-box" id="${v.id}-slot-${i}" onclick="uploadVariantImage('${v.id}', ${i})" style="height:55px; border:1.5px dashed var(--border-medium); border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; overflow:hidden;">
            <img src="${imgSrc}" alt="Photo ${i + 1}" style="width:100%; height:100%; object-fit:cover;">
          </div>
        `;
      } else {
        slotsHTML += `
          <div class="photo-slot-box" id="${v.id}-slot-${i}" onclick="uploadVariantImage('${v.id}', ${i})" style="height:55px; border:1.5px dashed var(--border-medium); border-radius:6px; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-secondary); gap:2px;">
            <svg style="width:14px; height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span style="font-size:0.55rem;">Photo ${i + 1}</span>
          </div>
        `;
      }
    }
    slotsHTML += `</div>`;

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.75rem; font-weight:700; display:flex; align-items:center; gap:6px;">
          <span style="width:12px; height:12px; border-radius:50%; border:1px solid var(--border-medium); background-color:${v.color};"></span>
          ${v.name}
        </span>
        <button class="btn-secondary" style="padding:2px 8px; font-size:0.6rem; color:var(--color-danger); border-color:transparent; background:none;" onclick="removeVariantColor('${v.id}')">Supprimer</button>
      </div>
      ${sizesStockHTML}
      ${slotsHTML}
    `;
    
    container.appendChild(item);
  });
}

// 5. Variant creator (colors & photos gallery up to 3 slots)
function setupVariantCreator() {
  const btnAdd = document.getElementById("btn-add-color-variant");
  const colorNameInput = document.getElementById("variant-color-name");
  const colorHexInput = document.getElementById("variant-color-hex");
  const container = document.getElementById("list-creation-variants");
  
  if (!btnAdd || !colorNameInput || !colorHexInput || !container) return;
  
  btnAdd.addEventListener("click", () => {
    const name = colorNameInput.value.trim();
    const color = colorHexInput.value;
    
    if (name === "") {
      alert("Veuillez renseigner le nom de la couleur.");
      return;
    }
    
    const sizes = getSelectedProductSizes();
    const defaultSizesStock = {};
    sizes.forEach(s => defaultSizesStock[s] = 5);

    // Create new variant
    const variantId = "var-" + Date.now();
    const newVar = {
      id: variantId,
      name: name,
      color: color,
      images: [null, null, null],
      sizesStock: defaultSizesStock
    };
    
    activeVariants.push(newVar);
    renderActiveVariants();
    
    // Clear inputs
    colorNameInput.value = "";
  });
}

// Remove color variant handler
window.removeVariantColor = function(id) {
  activeVariants = activeVariants.filter(v => v.id !== id);
  const card = document.getElementById(id);
  if (card) card.remove();
};

// Upload variant photo handler
window.uploadVariantImage = function(variantId, slotIndex) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        
        const variant = activeVariants.find(v => v.id === variantId);
        if (variant) {
          variant.images[slotIndex] = dataUrl;
        }
        
        // Show image preview in slot
        const slotBox = document.getElementById(`${variantId}-slot-${slotIndex}`);
        if (slotBox) {
          slotBox.innerHTML = `<img src="${dataUrl}" alt="Photo ${slotIndex + 1}" style="width:100%; height:100%; object-fit:cover;">`;
        }
      };
      reader.readAsDataURL(file);
    }
  });
  
  fileInput.click();
};

// 6. Product Publish Handler
function setupProductPublishForm() {
  const btnPublish = document.getElementById("btn-publish-product");
  const btnCancel = document.getElementById("btn-cancel-edit-product");
  
  if (btnCancel) {
    btnCancel.addEventListener("click", cancelProductEdit);
  }

  if (!btnPublish) return;
  
  btnPublish.addEventListener("click", () => {
    const title = document.getElementById("prod-title").value.trim();
    const price = parseFloat(document.getElementById("prod-price").value);
    const desc = document.getElementById("prod-desc").value.trim();
    const category = document.getElementById("prod-category").value;
    const subcategory = document.getElementById("prod-subcategory").value;
    const promoCode = document.getElementById("prod-promo").value;
    
    if (title === "" || isNaN(price)) {
      alert("Veuillez renseigner un titre et un prix corrects.");
      return;
    }
    
    if (activeVariants.length === 0) {
      alert("Veuillez ajouter au moins une variante de couleur.");
      return;
    }
    
    // Check that at least one photo is uploaded for the first variant
    if (!activeVariants[0].images[0]) {
      alert("Veuillez téléverser la Photo 1 (Face) pour la première couleur.");
      return;
    }
    
    // Gather stock values from sizes stock inputs
    const sizes = getSelectedProductSizes();
    activeVariants.forEach(v => {
      const card = document.getElementById(v.id);
      v.sizesStock = v.sizesStock || {};
      let varStockSum = 0;
      sizes.forEach(sz => {
        let val = 5;
        if (card) {
          const input = card.querySelector(`input[data-size="${sz}"]`);
          if (input) {
            val = Math.max(0, parseInt(input.value) || 0);
          }
        } else if (v.sizesStock[sz] !== undefined) {
          val = v.sizesStock[sz];
        }
        v.sizesStock[sz] = val;
        varStockSum += val;
      });
      v.stock = varStockSum;
    });

    // Map variants to match storefront format
    const formattedVariants = activeVariants.map(v => {
      const activeImg = v.images.find(img => img !== null) || "images/product_male.png";
      const validImagesList = v.images.filter(img => img !== null);
      
      return {
        name: v.name,
        color: v.color,
        img: activeImg,
        images: validImagesList,
        sizesStock: v.sizesStock,
        stock: v.stock
      };
    });
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = editingProductId ? editingProductId : (slug + "-" + Date.now());
    const productStock = formattedVariants.reduce((sum, v) => sum + v.stock, 0);
    
    const newProduct = {
      id: id,
      title: title,
      categories: [category],
      subcategory: subcategory,
      price: price,
      oldPrice: price * 1.2, // automatic 20% discount reference
      desc: desc || "Aucune description fournie.",
      image: formattedVariants[0].img, // main thumbnail
      variants: formattedVariants,
      sizes: sizes,
      stock: productStock, // total stock
      promoCode: promoCode || ""
    };
    
    window.db.saveProduct(newProduct);
    
    if (editingProductId) {
      alert(`L'article "${title}" a été mis à jour avec succès !`);
      cancelProductEdit();
    } else {
      alert(`L'article "${title}" a été publié avec succès !`);
      cancelProductEdit();
    }
    
    // Reload items lists
    loadOverviewMetrics();
    loadInventoryList();
  });
}

// 7. Dynamic Category and Subcategory Settings Forms
function setupSettingsForms() {
  const categoryFileInput = document.getElementById("cat-image-file");
  const catUploaderBox = document.getElementById("cat-uploader-box");
  const catUploadLabel = document.getElementById("cat-upload-label");
  const btnSaveCategory = document.getElementById("btn-save-category");
  const btnSaveSubcategory = document.getElementById("btn-save-subcategory");
  
  let categoryImageBase64 = "images/category_kid.png"; // default
  
  if (categoryFileInput && catUploaderBox && catUploadLabel) {
    categoryFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          categoryImageBase64 = evt.target.result;
          catUploadLabel.textContent = `Image sélectionnée : ${file.name}`;
          catUploaderBox.style.borderColor = "var(--accent-green)";
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Save Category Action
  if (btnSaveCategory) {
    btnSaveCategory.addEventListener("click", () => {
      const name = document.getElementById("cat-name").value.trim();
      if (name === "") {
        alert("Veuillez entrer le nom de la catégorie.");
        return;
      }
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      const newCat = {
        slug: slug,
        name: name,
        image_url: categoryImageBase64
      };
      
      window.db.saveCategory(newCat);
      alert(`Catégorie "${name}" créée avec succès !`);
      
      // Reset form
      document.getElementById("form-add-category").reset();
      catUploadLabel.textContent = "Déposer la photo ou cliquer pour choisir";
      catUploaderBox.style.borderColor = "var(--border-medium)";
      categoryImageBase64 = "images/category_kid.png";
      
      // Reload UI
      populateCategoryDropdowns();
      loadCategoryTree();
    });
  }
  
  // Save Subcategory Action
  if (btnSaveSubcategory) {
    btnSaveSubcategory.addEventListener("click", () => {
      const name = document.getElementById("subcat-name").value.trim();
      const parent = document.getElementById("subcat-parent").value;
      
      if (name === "") {
        alert("Veuillez entrer le nom de la sous-catégorie.");
        return;
      }
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      const newSub = {
        category_slug: parent,
        name: name,
        slug: slug
      };
      
      window.db.saveSubcategory(newSub);
      alert(`Sous-catégorie "${name}" créée avec succès !`);
      
      // Reset form
      document.getElementById("form-add-subcategory").reset();
      
      // Reload UI
      populateCategoryDropdowns();
      loadCategoryTree();
    });
  }
}

// 8. Load Category Tree list on right panel of Settings
function loadCategoryTree() {
  const container = document.getElementById("list-settings-categories");
  if (!container) return;
  
  container.innerHTML = "";
  
  const categories = window.db.getCategories();
  const subcategories = window.db.getSubcategories();
  
  categories.forEach(cat => {
    const listSubs = subcategories.filter(s => s.category_slug === cat.slug).map(s => s.name).join(", ");
    
    const div = document.createElement("div");
    div.style.cssText = "border: 1px solid var(--border-light); border-radius:8px; padding:10px 14px; display:flex; gap:12px; align-items:center; background:#ffffff; box-shadow:var(--shadow-sm); text-align:left;";
    div.innerHTML = `
      <div style="width:36px; height:36px; border-radius:50%; overflow:hidden; border:1px solid var(--border-light); flex-shrink:0;">
        <img src="../${cat.image_url}" alt="${cat.name}" style="width:100%; height:100%; object-fit:cover;">
      </div>
      <div>
        <span style="font-size:0.75rem; font-weight:800; color:var(--text-primary); display:block;">${cat.name}</span>
        <span style="font-size:0.65rem; color:var(--text-secondary); display:block; margin-top:2px;">Sous-catégories : ${listSubs || "Aucune"}</span>
      </div>
    `;
    
    container.appendChild(div);
  });
}

// 9. Promo Codes Management
function loadPromoCodes() {
  const tbody = document.getElementById("promo-list-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const promos = window.db.getPromoCodes();
  
  promos.forEach(p => {
    const tr = document.createElement("tr");
    
    // Status Badge
    let statusStatus = `<span class="badge-status success"><span class="bullet-dot"></span> Actif</span>`;
    if (!p.active || p.active === "false" || p.active === false) {
      statusStatus = `<span class="badge-status warning" style="color:var(--text-secondary); background:var(--background-light);"><span class="bullet-dot" style="background-color:var(--text-secondary);"></span> Inactif</span>`;
    }
    
    const typeLabel = p.type === "percent" ? "Pourcentage" : "Montant Fixe";
    const valLabel = p.type === "percent" ? `${p.value}%` : formatPrice(p.value);
    
    tr.innerHTML = `
      <td style="padding:12px 16px; font-weight:700; text-align:left;">${p.code}</td>
      <td style="padding:12px 16px;">${typeLabel}</td>
      <td style="padding:12px 16px; font-weight:800;">${valLabel}</td>
      <td style="padding:12px 16px;">${statusStatus}</td>
      <td style="padding:12px 16px; text-align:center;">
        <button class="btn-secondary" style="padding:2px 8px; font-size:0.7rem; height:24px; color:var(--color-danger); border-color:var(--color-danger);" onclick="deletePromoCode('${p.code}')">Supprimer</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function setupPromoCodesForm() {
  const btnSave = document.getElementById("btn-save-promo");
  if (!btnSave) return;
  
  btnSave.addEventListener("click", () => {
    const code = document.getElementById("promo-code").value.trim().toUpperCase();
    const type = document.getElementById("promo-type").value;
    const value = parseFloat(document.getElementById("promo-value").value);
    const active = document.getElementById("promo-active").value === "true";
    
    if (code === "" || isNaN(value) || value < 0) {
      alert("Veuillez remplir correctement les champs.");
      return;
    }
    
    const newPromo = {
      code: code,
      type: type,
      value: value,
      active: active
    };
    
    window.db.savePromoCode(newPromo);
    alert(`Code promo "${code}" enregistré avec succès !`);
    
    // Reset form
    document.getElementById("form-add-promo").reset();
    
    // Reload UI
    loadPromoCodes();
    populatePromoDropdown();
    renderQuickPromoList();
  });
}

window.deletePromoCode = function(code) {
  if (confirm(`Voulez-vous vraiment supprimer le code promo "${code}" ?`)) {
    window.db.deletePromoCode(code);
    loadPromoCodes();
    populatePromoDropdown();
    renderQuickPromoList();
    alert(`Code promo "${code}" supprimé.`);
  }
};

function populatePromoDropdown() {
  const select = document.getElementById("prod-promo");
  if (!select) return;
  
  select.innerHTML = '<option value="">Aucun</option>';
  const promos = window.db.getPromoCodes().filter(p => p.active);
  promos.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.code;
    const valLabel = p.type === "percent" ? `${p.value}%` : formatPrice(p.value);
    opt.textContent = `${p.code} (${valLabel})`;
    select.appendChild(opt);
  });
}

function renderQuickPromoList() {
  const container = document.getElementById("quick-promo-list");
  if (!container) return;
  
  const promos = window.db.getPromoCodes().filter(p => p.active);
  if (promos.length === 0) {
    container.innerHTML = `<span style="color: var(--text-secondary); font-style: italic; font-size: 0.75rem;">Aucun code promo actif.</span>`;
    return;
  }
  
  let html = `<div style="display: flex; flex-wrap: wrap; gap: 8px;">`;
  promos.forEach(p => {
    const valLabel = p.type === "percent" ? `-${p.value}%` : `-${formatPrice(p.value)}`;
    html += `
      <div style="background: var(--bg-primary); border: 1px solid var(--border-light); padding: 4px 8px; border-radius: 6px; display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 500;">
        <strong style="color: var(--text-primary); font-family: monospace; font-size: 0.75rem;">${p.code}</strong>
        <span class="badge-status success" style="font-size: 0.6rem; padding: 1px 4px; border-radius: 4px;">${valLabel}</span>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function setupChartToggle() {
  const btnWeek = document.getElementById("btn-chart-week");
  const btnMonth = document.getElementById("btn-chart-month");
  
  if (!btnWeek || !btnMonth) return;
  
  const curvePath = document.getElementById("chart-curve-path");
  const areaPath = document.getElementById("chart-area-path");
  const cursorLine = document.getElementById("chart-cursor-line");
  const glowDot = document.getElementById("chart-glow-dot");
  const innerDot = document.getElementById("chart-inner-dot");
  const tooltipGroup = document.getElementById("chart-tooltip-group");
  const tooltipText = document.getElementById("chart-tooltip-text");
  const trendBadge = document.getElementById("chart-trend-badge");
  
  const lbl1 = document.getElementById("chart-label-1");
  const lbl2 = document.getElementById("chart-label-2");
  const lbl3 = document.getElementById("chart-label-3");
  const lbl4 = document.getElementById("chart-label-4");
  
  const weeklyData = {
    curve: "M 20 105 C 70 105, 70 85, 120 85 C 180 85, 190 45, 240 45 C 290 45, 290 75, 330 75",
    area: "M 20 105 C 70 105, 70 85, 120 85 C 180 85, 190 45, 240 45 C 290 45, 290 75, 330 75 L 330 110 L 20 110 Z",
    cx: 240,
    cy: 45,
    tooltipTranslate: "translate(200, 7)",
    tooltipValue: "245 000 FCFA",
    trend: "+12.5% vs semaine dernière",
    labels: ["Lun", "Mer", "Ven", "Dim"]
  };
  
  const monthlyData = {
    curve: "M 20 95 C 70 95, 70 105, 120 105 C 180 105, 190 35, 240 35 C 290 35, 290 55, 330 55",
    area: "M 20 95 C 70 95, 70 105, 120 105 C 180 105, 190 35, 240 35 C 290 35, 290 55, 330 55 L 330 110 L 20 110 Z",
    cx: 240,
    cy: 35,
    tooltipTranslate: "translate(200, -3)",
    tooltipValue: "1 050 000 FCFA",
    trend: "+18.3% vs mois dernier",
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"]
  };
  
  function updateChart(data) {
    if (curvePath) curvePath.setAttribute("d", data.curve);
    if (areaPath) areaPath.setAttribute("d", data.area);
    
    if (cursorLine) {
      cursorLine.setAttribute("x1", data.cx);
      cursorLine.setAttribute("x2", data.cx);
    }
    if (glowDot) {
      glowDot.setAttribute("cx", data.cx);
      glowDot.setAttribute("cy", data.cy);
    }
    if (innerDot) {
      innerDot.setAttribute("cx", data.cx);
      innerDot.setAttribute("cy", data.cy);
    }
    
    if (tooltipGroup) tooltipGroup.setAttribute("transform", data.tooltipTranslate);
    if (tooltipText) tooltipText.textContent = data.tooltipValue;
    if (trendBadge) trendBadge.textContent = data.trend;
    
    if (lbl1) lbl1.textContent = data.labels[0];
    if (lbl2) lbl2.textContent = data.labels[1];
    if (lbl3) lbl3.textContent = data.labels[2];
    if (lbl4) lbl4.textContent = data.labels[3];
  }
  
  btnWeek.addEventListener("click", () => {
    btnWeek.classList.add("active");
    btnMonth.classList.remove("active");
    updateChart(weeklyData);
  });
  
  btnMonth.addEventListener("click", () => {
    btnMonth.classList.add("active");
    btnWeek.classList.remove("active");
    updateChart(monthlyData);
  });
}
