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
      const currentSizes = chipsApi.getSizes();
      const card = document.createElement("div");
      card.className = "variant-color-card";
      card.draggable = true;
      card.dataset.variantId = v.id;

      const stockGridHTML = currentSizes.map(size => {
        const val = v.sizesStock[size] !== undefined ? v.sizesStock[size] : 5;
        return '<div class="variant-stock-field"><label></label><input type="number" min="0" class="variant-stock-input" data-size="' + size + '" value="' + val + '"></div>';
      }).join("");

      const dropzonesHTML = [0, 1, 2].map(i => {
        const img = v.images[i];
        return '<div class="variant-photo-dropzone" data-slot="' + i + '">' +
          (img ? '<img src="' + img + '" alt="Photo ' + (i + 1) + '"><button type="button" class="variant-photo-remove" data-slot="' + i + '">&times;</button>' : '<span class="variant-photo-placeholder">Photo ' + (i + 1) + '</span>') +
          '<input type="file" accept="image/*" class="variant-photo-input" data-slot="' + i + '" hidden></div>';
      }).join("");

      card.innerHTML =
        '<div class="variant-color-card-header">' +
          '<span class="variant-drag-handle">&#10021;</span>' +
          '<span class="variant-color-swatch" style="background:' + v.color + '"></span>' +
          '<input type="text" class="variant-color-name-input" value="" placeholder="Nom de la couleur">' +
          '<button type="button" class="btn-secondary variant-color-remove">Supprimer</button>' +
        '</div>' +
        '<div class="variant-stock-grid">' + stockGridHTML + '</div>' +
        '<div class="variant-photo-grid">' + dropzonesHTML + '</div>';

      card.querySelectorAll(".variant-stock-field label").forEach((label, idx) => { label.textContent = currentSizes[idx]; });
      card.querySelector(".variant-color-name-input").value = v.name;

      card.querySelector(".variant-color-name-input").addEventListener("input", (e) => {
        v.name = e.target.value;
        emitChange();
      });

      card.querySelector(".variant-color-remove").addEventListener("click", () => {
        const idx = variants.findIndex(x => x.id === v.id);
        if (idx !== -1) variants.splice(idx, 1);
        renderVariantsSection();
        emitChange();
      });

      card.querySelectorAll(".variant-stock-input").forEach(input => {
        input.addEventListener("input", () => {
          v.sizesStock[input.dataset.size] = Math.max(0, parseInt(input.value, 10) || 0);
          emitChange();
        });
      });

      function handleFile(slotIndex, file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          v.images[slotIndex] = evt.target.result;
          renderVariantsSection();
          emitChange();
        };
        reader.readAsDataURL(file);
      }

      card.querySelectorAll(".variant-photo-dropzone").forEach(zone => {
        const slot = parseInt(zone.dataset.slot, 10);
        const fileInput = zone.querySelector(".variant-photo-input");

        zone.addEventListener("click", (e) => {
          if (e.target.classList.contains("variant-photo-remove")) return;
          fileInput.click();
        });
        fileInput.addEventListener("change", (e) => handleFile(slot, e.target.files[0]));

        zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag-over"); });
        zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
        zone.addEventListener("drop", (e) => {
          e.preventDefault();
          zone.classList.remove("drag-over");
          handleFile(slot, e.dataTransfer.files && e.dataTransfer.files[0]);
        });

        const removeBtn = zone.querySelector(".variant-photo-remove");
        if (removeBtn) {
          removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            v.images[slot] = null;
            renderVariantsSection();
            emitChange();
          });
        }
      });

      card.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", v.id); card.classList.add("dragging"); });
      card.addEventListener("dragend", () => card.classList.remove("dragging"));
      card.addEventListener("dragover", (e) => e.preventDefault());
      card.addEventListener("drop", (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData("text/plain");
        if (draggedId === v.id) return;
        const fromIndex = variants.findIndex(x => x.id === draggedId);
        const toIndex = variants.findIndex(x => x.id === v.id);
        if (fromIndex === -1 || toIndex === -1) return;
        const moved = variants.splice(fromIndex, 1)[0];
        variants.splice(toIndex, 0, moved);
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
