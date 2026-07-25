(function () {
  "use strict";

  function createChipsEditor(container, initialSizes, onSizesChange) {
    let sizes = initialSizes.slice();

    function render() {
      container.innerHTML = "";
      const list = document.createElement("div");
      list.className = "size-chip-list";

      sizes.forEach((size, index) => {
        const chip = document.createElement("span");
        chip.className = "size-chip";
        chip.innerHTML = '<span></span><button type="button" class="size-chip-remove" data-index="' + index + '">&times;</button>';
        chip.querySelector("span").textContent = size;
        chip.querySelector(".size-chip-remove").addEventListener("click", () => {
          sizes.splice(index, 1);
          onSizesChange(sizes.slice());
          render();
        });
        list.appendChild(chip);
      });

      const addWrap = document.createElement("div");
      addWrap.className = "size-chip-add";
      addWrap.innerHTML =
        '<input type="text" class="size-chip-input" placeholder="Ajouter une taille (Ex: 42, XXL)">' +
        '<button type="button" class="btn-secondary size-chip-add-btn">Ajouter</button>';
      const input = addWrap.querySelector(".size-chip-input");
      const addBtn = addWrap.querySelector(".size-chip-add-btn");

      function commitAdd() {
        const val = input.value.trim();
        if (val === "" || sizes.includes(val)) { input.value = ""; return; }
        sizes.push(val);
        onSizesChange(sizes.slice());
        input.value = "";
        render();
      }

      addBtn.addEventListener("click", commitAdd);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); commitAdd(); }
      });

      list.appendChild(addWrap);
      container.appendChild(list);
    }

    render();
    return {
      getSizes() { return sizes.slice(); },
      setSizes(newSizes) { sizes = newSizes.slice(); render(); }
    };
  }

  function mount(container, options) {
    options = options || {};
    const initialSizes = options.sizes && options.sizes.length ? options.sizes.slice() : ["S", "M", "L", "XL"];
    const variants = (options.variants || []).map(v => ({
      id: "var-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      name: v.name || "",
      color: v.color || "#000000",
      images: (v.images || []).slice(0, 3).concat([null, null, null]).slice(0, 3),
      sizesStock: Object.assign({}, v.sizesStock || {})
    }));
    const onChange = typeof options.onChange === "function" ? options.onChange : function () {};

    container.innerHTML = "";
    const sizesSection = document.createElement("div");
    sizesSection.className = "variant-editor-sizes";
    container.appendChild(sizesSection);

    const variantsSection = document.createElement("div");
    variantsSection.className = "variant-editor-colors";
    container.appendChild(variantsSection);

    function emitChange() {
      onChange({
        sizes: chipsApi.getSizes(),
        variants: variants.map(v => ({ name: v.name, color: v.color, images: v.images.slice(), sizesStock: Object.assign({}, v.sizesStock) }))
      });
    }

    const chipsApi = createChipsEditor(sizesSection, initialSizes, () => {
      renderVariantsSection();
      emitChange();
    });

    function renderVariantsSection() {
      variantsSection.innerHTML = "";
      variants.forEach(v => variantsSection.appendChild(renderColorCard(v)));
    }

    function renderColorCard(v) {
      // Implémentation minimale à cette étape : nom + pastille + suppression.
      // La Task 10 remplace cette fonction pour ajouter les photos, la grille de stock et le glisser-déposer.
      const card = document.createElement("div");
      card.className = "variant-color-card";
      card.dataset.variantId = v.id;
      card.innerHTML =
        '<div class="variant-color-card-header">' +
          '<span class="variant-color-swatch" style="background:' + v.color + '"></span>' +
          '<span class="variant-color-name"></span>' +
          '<button type="button" class="btn-secondary variant-color-remove">Supprimer</button>' +
        '</div>';
      card.querySelector(".variant-color-name").textContent = v.name || "Nouvelle couleur";
      card.querySelector(".variant-color-remove").addEventListener("click", () => {
        const idx = variants.findIndex(x => x.id === v.id);
        if (idx !== -1) variants.splice(idx, 1);
        renderVariantsSection();
        emitChange();
      });
      return card;
    }

    renderVariantsSection();

    return {
      getState() {
        return {
          sizes: chipsApi.getSizes(),
          variants: variants.map(v => ({ name: v.name, color: v.color, images: v.images.slice(), sizesStock: Object.assign({}, v.sizesStock) }))
        };
      },
      addColor(name, color) {
        variants.push({ id: "var-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7), name: name, color: color, images: [null, null, null], sizesStock: {} });
        renderVariantsSection();
        emitChange();
      },
      destroy() { container.innerHTML = ""; }
    };
  }

  window.VariantEditor = { mount: mount };
})();
