"use client";

import ListProducts from "./ListProducts";
import GridProducts from "./GridProducts";
import FilterModal from "./FilterModal";
import LayoutHandler from "./LayoutHandler";
import Image from "next/image";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useSearchParams } from "next/navigation";
import { initialState, reducer } from "@/reducer/filterReducer";
import { products } from "@/data/products";
import { useContextElement } from "@/context/Context";

export const SHAMMAH_CATEGORY_FILTERS = [
  { slug: "All", label: "Tous les produits", thumb: null },
  {
    slug: "t-shirts",
    label: "T-shirts",
    thumb: "/images/cls-categories/pod/t-shirts-jesus.jpg",
  },
  {
    slug: "sweats",
    label: "Sweats à capuche",
    thumb: "/images/cls-categories/pod/sweat-vert-jesus.jpg",
  },
  {
    slug: "casquettes",
    label: "Casquettes",
    thumb: "/images/cls-categories/pod/casquette-jesus.jpg",
  },
  {
    slug: "accessoires",
    label: "Accessoires",
    thumb: "/images/cls-categories/pod/accessories-mug.jpg",
  },
];

const SORT_LABELS = {
  "Sort by (Default)": "Trier par (Défaut)",
  "Title Ascending": "Nom : A à Z",
  "Title Descending": "Nom : Z à A",
  "Price Ascending": "Prix : croissant",
  "Price Descending": "Prix : décroissant",
};

export default function Products1({
  fullWidth = false,
  cardStyleClass,
  tooltipDirection,
  parentClass = "flat-spacing-24",
}) {
  const { dbProducts = [] } = useContextElement();
  const [activeLayout, setActiveLayout] = useState(4);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    price,
    category,
    availability,
    color,
    size,
    brands,

    filtered,
    sortingOption,
    sorted,
  } = state;

  // Fusionner les produits créés dans le tableau de bord avec ceux du catalogue
  const catalogSource = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const item of [...dbProducts, ...products]) {
      const key = String(item.title || "").trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      list.push(item);
    }
    return list;
  }, [dbProducts]);

  const updateUrlCategory = (nextCat) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!nextCat || nextCat === "All") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", nextCat);
    }
    window.history.replaceState({}, "", url.toString());
  };

  const allProps = {
    ...state,
    setPrice: (value) => dispatch({ type: "SET_PRICE", payload: value }),

    setCategory: (value) => {
      const next = value === category && value !== "All" ? "All" : value;
      dispatch({ type: "SET_CATEGORY", payload: next });
      updateUrlCategory(next);
    },

    setColor: (value) => {
      value == color
        ? dispatch({ type: "SET_COLOR", payload: "All" })
        : dispatch({ type: "SET_COLOR", payload: value });
    },
    setSize: (value) => {
      value == size
        ? dispatch({ type: "SET_SIZE", payload: "All" })
        : dispatch({ type: "SET_SIZE", payload: value });
    },
    setAvailability: (value) => {
      dispatch({ type: "SET_AVAILABILITY", payload: value });
    },

    setBrands: (newBrand) => {
      dispatch({ type: "SET_BRANDS", payload: newBrand });
    },
    removeBrand: (newBrand) => {
      const updated = [...brands].filter((brand) => brand != newBrand);

      dispatch({ type: "SET_BRANDS", payload: updated });
    },
    setSortingOption: (value) =>
      dispatch({ type: "SET_SORTING_OPTION", payload: value }),

    setCurrentPage: (value) =>
      dispatch({ type: "SET_CURRENT_PAGE", payload: value }),
    setItemPerPage: (value) => {
      dispatch({ type: "SET_CURRENT_PAGE", payload: 1 }),
        dispatch({ type: "SET_ITEM_PER_PAGE", payload: value });
    },
    clearFilter: () => {
      dispatch({ type: "CLEAR_FILTER" });
      updateUrlCategory("All");
    },
  };

  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get("category")?.toLowerCase() || "";

  useEffect(() => {
    if (categoryParam) {
      dispatch({ type: "SET_CATEGORY", payload: categoryParam });
    } else {
      dispatch({ type: "SET_CATEGORY", payload: "All" });
    }
  }, [categoryParam]);

  useEffect(() => {
    let filteredArrays = [];

    if (category && category !== "All") {
      const filteredByCategory = [...catalogSource].filter((elm) => {
        if (!elm.categories) return false;
        return elm.categories.includes(category);
      });
      filteredArrays = [...filteredArrays, filteredByCategory];
    }

    if (brands !== "All") {
      const filteredByBrands = [...catalogSource].filter((elm) =>
        elm.filterBrands?.includes(brands)
      );
      filteredArrays = [...filteredArrays, filteredByBrands];
    }
    if (availability !== "All") {
      const filteredByavailability = [...catalogSource].filter(
        (elm) => availability === elm.inStock
      );
      filteredArrays = [...filteredArrays, filteredByavailability];
    }
    if (color !== "All") {
      const filteredByColor = [...catalogSource].filter((elm) =>
        elm.filterColor?.includes(color)
      );
      filteredArrays = [...filteredArrays, filteredByColor];
    }
    if (size !== "All" && size !== "Free Size") {
      const filteredBysize = [...catalogSource].filter((elm) =>
        elm.filterSizes?.includes(size)
      );
      filteredArrays = [...filteredArrays, filteredBysize];
    }

    const filteredByPrice = [...catalogSource].filter(
      (elm) => elm.price >= price[0] && elm.price <= price[1]
    );
    filteredArrays = [...filteredArrays, filteredByPrice];

    const commonItems = [...catalogSource].filter((item) =>
      filteredArrays.every((array) => array.includes(item))
    );
    dispatch({ type: "SET_FILTERED", payload: commonItems });
  }, [price, category, availability, color, size, brands, catalogSource]);

  useEffect(() => {
    if (sortingOption === "Price Ascending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => a.price - b.price),
      });
    } else if (sortingOption === "Price Descending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => b.price - a.price),
      });
    } else if (sortingOption === "Title Ascending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => a.title.localeCompare(b.title)),
      });
    } else if (sortingOption === "Title Descending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => b.title.localeCompare(a.title)),
      });
    } else {
      dispatch({ type: "SET_SORTED", payload: filtered });
    }
    dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
  }, [filtered, sortingOption]);

  const activeCategoryLabel =
    SHAMMAH_CATEGORY_FILTERS.find((c) => c.slug === category)?.label || category;

  const hasActiveFilters =
    category !== "All" ||
    availability != "All" ||
    brands != "All" ||
    price.join("-") != [0, 300].join("-") ||
    color != "All" ||
    size != "All";

  return (
    <>
      <section className={parentClass}>
        <div className={fullWidth ? "container-full" : "container"}>
          {/* Barre de filtres rapides par catégorie (Collection unique) */}
          <div className="shammah-category-filter-bar" role="tablist" aria-label="Filtrer par catégorie">
            {SHAMMAH_CATEGORY_FILTERS.map((cat) => {
              const isActive = category === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`shammah-cat-pill ${isActive ? "active" : ""}`}
                  onClick={() => allProps.setCategory(cat.slug)}
                >
                  {cat.thumb && (
                    <span className="shammah-cat-pill-thumb">
                      <Image
                        src={cat.thumb}
                        alt={cat.label}
                        width={28}
                        height={28}
                      />
                    </span>
                  )}
                  <span className="shammah-cat-pill-label">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="tf-shop-control">
            <div className="tf-group-filter">
              <a
                href="#filterShop"
                data-bs-toggle="offcanvas"
                aria-controls="filterShop"
                className="tf-btn-filter"
              >
                <span className="icon icon-filter" />
                <span className="text">Filtrer</span>
              </a>
              <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
                <div className="btn-select">
                  <span className="text-sort-value">
                    {SORT_LABELS[sortingOption] || sortingOption}
                  </span>
                  <span className="icon icon-arr-down" />
                </div>
                <div className="dropdown-menu">
                  {[
                    "Sort by (Default)",
                    "Title Ascending",
                    "Title Descending",
                    "Price Ascending",
                    "Price Descending",
                  ].map((elm, i) => (
                    <div
                      key={i}
                      className={`select-item ${
                        sortingOption == elm ? "active" : ""
                      }`}
                      onClick={() => allProps.setSortingOption(elm)}
                      data-sort-value="best-selling"
                    >
                      <span className="text-value-item">
                        {SORT_LABELS[elm] || elm}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <ul className="tf-control-layout">
              <LayoutHandler
                setActiveLayout={setActiveLayout}
                activeLayout={activeLayout}
              />
            </ul>
          </div>
          <div className="wrapper-control-shop">
            {hasActiveFilters && (
              <div className="meta-filter-shop" style={{}}>
                <div id="product-count-grid" className="count-text">
                  <span className="count">{sorted.length}</span> article
                  {sorted.length > 1 ? "s" : ""} trouvé
                  {sorted.length > 1 ? "s" : ""}
                </div>

                <div id="applied-filters">
                  {category !== "All" ? (
                    <span
                      className="filter-tag"
                      onClick={() => allProps.setCategory("All")}
                    >
                      <span className="remove-tag icon-close"></span>{" "}
                      Catégorie : {activeCategoryLabel}
                    </span>
                  ) : (
                    ""
                  )}
                  {availability != "All" ? (
                    <span
                      className="filter-tag"
                      onClick={() => allProps.setAvailability("All")}
                    >
                      <span className="remove-tag icon-close"></span>{" "}
                      Disponibilité : {availability ? "En stock" : "Épuisé"}
                    </span>
                  ) : (
                    ""
                  )}
                  {brands != "All" ? (
                    <span
                      className="filter-tag"
                      onClick={() => allProps.setBrands("All")}
                    >
                      <span
                        className="remove-tag icon-close"
                        data-filter="brand"
                      />
                      Collection : {brands}
                    </span>
                  ) : (
                    ""
                  )}
                  {price.join("-") != [0, 300].join("-") ? (
                    <span
                      className="filter-tag"
                      onClick={() => allProps.setPrice([0, 300])}
                    >
                      <span
                        className="remove-tag icon-close"
                        data-filter="price"
                      />
                      Prix : {price[0]} € - {price[1]} €
                    </span>
                  ) : (
                    ""
                  )}
                  {color != "All" ? (
                    <span
                      className="filter-tag"
                      onClick={() => allProps.setColor("All")}
                    >
                      <span
                        className="remove-tag icon-close"
                        data-filter="color"
                      />
                      Couleur : {color}
                    </span>
                  ) : (
                    ""
                  )}
                  {size != "All" ? (
                    <span
                      className="filter-tag"
                      onClick={() => allProps.setSize("All")}
                    >
                      <span
                        className="remove-tag icon-close"
                        data-filter="size"
                      />
                      Taille : {size}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                <button
                  id="remove-all"
                  className="remove-all-filters"
                  onClick={allProps.clearFilter}
                >
                  <i className="icon icon-close" /> Effacer tous les filtres
                </button>
              </div>
            )}

            {activeLayout == 1 ? (
              <div className="tf-list-layout wrapper-shop" id="listLayout">
                <ListProducts products={sorted} />
                <ul className="wg-pagination">
                  <li className="active">
                    <div className="pagination-item">1</div>
                  </li>
                  <li>
                    <a href="#" className="pagination-item">
                      2
                    </a>
                  </li>
                  <li>
                    <a href="#" className="pagination-item">
                      3
                    </a>
                  </li>
                  <li>
                    <a href="#" className="pagination-item">
                      <i className="icon-arr-right2" />
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <div
                className={`wrapper-shop tf-grid-layout tf-col-${activeLayout}`}
                id="gridLayout"
              >
                <GridProducts
                  cardStyleClass={cardStyleClass}
                  products={sorted}
                  tooltipDirection={tooltipDirection}
                />
                <ul className="wg-pagination">
                  <li className="active">
                    <div className="pagination-item">1</div>
                  </li>
                  <li>
                    <a href="#" className="pagination-item">
                      2
                    </a>
                  </li>
                  <li>
                    <a href="#" className="pagination-item">
                      3
                    </a>
                  </li>
                  <li>
                    <a href="#" className="pagination-item">
                      <i className="icon-arr-right2" />
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
      <FilterModal allProps={allProps} />
    </>
  );
}
