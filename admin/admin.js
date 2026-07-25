// SHAMMAH - Dashboard Administration Operations

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// App State
let activeVariants = []; // Stores currently added color variants for new product: { name, color, images: [img1, img2, img3] }

function initApp() {
  setupNavigation();
  loadOverviewMetrics();
  loadInventoryList();
  populateCategoryDropdowns();
  setupVariantCreator();
  setupProductPublishForm();
  setupSettingsForms();
  loadCategoryTree();
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

// Helper to format currency
function formatPrice(val) {
  if (val >= 1000) {
    return val.toLocaleString('fr-FR') + " FCFA";
  } else {
    return "$" + val.toFixed(2);
  }
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
    const tr = document.createElement("tr");
    
    // Low stock warning status
    let stockStatus = `<span class="badge-status success"><span class="bullet-dot"></span> OK</span>`;
    if (p.stock < 3) {
      stockStatus = `<span class="badge-status danger"><span class="bullet-dot"></span> Stock Faible</span>`;
    }
    
    tr.innerHTML = `
      <td style="padding:12px 16px; font-weight:700; text-align:left;">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="../${p.image}" alt="${p.title}" style="width:32px; height:32px; border-radius:6px; object-fit:cover; border:1px solid var(--border-light);">
          <div>
            <span style="display:block;">${p.title}</span>
            <span style="font-size:0.65rem; color:var(--text-secondary); font-weight:500;">Prix : ${formatPrice(p.price)}</span>
          </div>
        </div>
      </td>
      <td style="padding:12px 16px; text-transform:capitalize;">${p.categories[0]}</td>
      <td style="padding:12px 16px; text-align:right; font-weight:800;">
        <div style="display:flex; align-items:center; justify-content:flex-end; gap:8px;">
          <input type="number" value="${p.stock}" style="width:50px; height:24px; padding:0 4px; text-align:center; border:1.5px solid var(--border-medium); border-radius:4px; font-family:inherit; font-size:0.75rem;" onchange="updateProductStock('${p.id}', this.value)">
          ${stockStatus}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Helper to update stock directly
window.updateProductStock = function(id, val) {
  const products = window.db.getProducts();
  const p = products.find(prod => prod.id === id);
  if (p) {
    p.stock = parseInt(val);
    window.db.saveProduct(p);
    loadOverviewMetrics();
    loadInventoryList();
  }
};

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
  prodCatSelect.addEventListener("change", loadSubcategoryOptions);
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
    
    // Create new variant
    const variantId = "var-" + Date.now();
    const newVar = {
      id: variantId,
      name: name,
      color: color,
      images: [null, null, null] // 3 empty slots
    };
    
    activeVariants.push(newVar);
    
    // Append UI elements for this color variant
    const item = document.createElement("div");
    item.className = "variant-creation-card";
    item.id = variantId;
    item.style.cssText = "background:#f8fafc; border:1px solid var(--border-light); padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px;";
    
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.75rem; font-weight:700; display:flex; align-items:center; gap:6px;">
          <span style="width:12px; height:12px; border-radius:50%; border:1px solid var(--border-medium); background-color:${color};"></span>
          ${name}
        </span>
        <button class="btn-secondary" style="padding:2px 8px; font-size:0.6rem; color:var(--accent-red); border-color:transparent; background:none;" onclick="removeVariantColor('${variantId}')">Supprimer</button>
      </div>
      
      <!-- 3 Image slots -->
      <div class="photo-slots-grid">
        <div class="photo-slot-box" id="${variantId}-slot-0" onclick="uploadVariantImage('${variantId}', 0)">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          <span>Photo 1 (Face)</span>
        </div>
        <div class="photo-slot-box" id="${variantId}-slot-1" onclick="uploadVariantImage('${variantId}', 1)">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          <span>Photo 2</span>
        </div>
        <div class="photo-slot-box" id="${variantId}-slot-2" onclick="uploadVariantImage('${variantId}', 2)">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          <span>Photo 3</span>
        </div>
      </div>
    `;
    
    container.appendChild(item);
    
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
        
        // Save image to activeVariant
        const variant = activeVariants.find(v => v.id === variantId);
        if (variant) {
          variant.images[slotIndex] = dataUrl;
        }
        
        // Show image preview in slot
        const slotBox = document.getElementById(`${variantId}-slot-${slotIndex}`);
        if (slotBox) {
          slotBox.innerHTML = `<img src="${dataUrl}" alt="Photo ${slotIndex + 1}">`;
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
  if (!btnPublish) return;
  
  btnPublish.addEventListener("click", () => {
    const title = document.getElementById("prod-title").value.trim();
    const price = parseFloat(document.getElementById("prod-price").value);
    const desc = document.getElementById("prod-desc").value.trim();
    const category = document.getElementById("prod-category").value;
    const subcategory = document.getElementById("prod-subcategory").value;
    
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
    
    // Map variants to match storefront format
    const formattedVariants = activeVariants.map(v => {
      // Find the first non-null image to represent the variant swatch image
      const activeImg = v.images.find(img => img !== null) || "images/product_male.png";
      const validImagesList = v.images.filter(img => img !== null);
      
      return {
        name: v.name,
        color: v.color,
        img: activeImg,
        images: validImagesList
      };
    });
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = slug + "-" + Date.now();
    
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
      sizes: ["Taille Unique", "S", "M", "L", "XL"],
      stock: 10 // initial stock
    };
    
    window.db.saveProduct(newProduct);
    
    alert(`L'article "${title}" a été publié avec succès !`);
    
    // Reset form and UI
    document.getElementById("form-add-product").reset();
    document.getElementById("list-creation-variants").innerHTML = "";
    activeVariants = [];
    
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
