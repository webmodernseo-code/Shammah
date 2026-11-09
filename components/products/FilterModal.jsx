"use client";
import { brands, sizes } from "@/data/filterOptions";
import React from "react";
import Slider from "rc-slider";
import { products1 } from "@/data/products";
import Link from "next/link";
import Image from "next/image";
export default function FilterModal({ allProps }) {
  return (
    <div
      className="offcanvas offcanvas-start canvas-sidebar canvas-filter"
      id="filterShop"
    >
      <div className="canvas-wrapper">
        <div className="canvas-header">
          <span className="title">Filtres</span>
          <button
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
            aria-label="Fermer"
          />
        </div>
        <div className="canvas-body">
          <div className="widget-facet">
            <div className="facet-title text-xl fw-medium mb-2">
              <span>Catégories</span>
            </div>
            <ul className="list-categories shammah-sidebar-collections current-scrollbar">
              <li className="cate-item">
                <button
                  type="button"
                  onClick={() => allProps.setCategory("All")}
                  data-bs-dismiss="offcanvas"
                  className={`text-sm link shammah-sidebar-cat-link w-100 border-0 bg-transparent text-start ${
                    allProps.category === "All" ? "active fw-bold text-dark" : ""
                  }`}
                >
                  <span>Tous les produits</span>
                </button>
              </li>
              <li className="cate-item">
                <button
                  type="button"
                  onClick={() => allProps.setCategory("t-shirts")}
                  data-bs-dismiss="offcanvas"
                  className={`text-sm link shammah-sidebar-cat-link w-100 border-0 bg-transparent text-start ${
                    allProps.category === "t-shirts" ? "active fw-bold text-dark" : ""
                  }`}
                >
                  <span className="shammah-sidebar-cat-thumb">
                    <Image src="/images/cls-categories/pod/t-shirts-jesus.jpg" alt="T-shirts" width={36} height={36} />
                  </span>
                  <span>T-shirts</span>
                </button>
              </li>
              <li className="cate-item">
                <button
                  type="button"
                  onClick={() => allProps.setCategory("sweats")}
                  data-bs-dismiss="offcanvas"
                  className={`text-sm link shammah-sidebar-cat-link w-100 border-0 bg-transparent text-start ${
                    allProps.category === "sweats" ? "active fw-bold text-dark" : ""
                  }`}
                >
                  <span className="shammah-sidebar-cat-thumb">
                    <Image src="/images/cls-categories/pod/sweat-vert-jesus.jpg" alt="Sweats à capuche" width={36} height={36} />
                  </span>
                  <span>Sweats à capuche</span>
                </button>
              </li>
              <li className="cate-item">
                <button
                  type="button"
                  onClick={() => allProps.setCategory("casquettes")}
                  data-bs-dismiss="offcanvas"
                  className={`text-sm link shammah-sidebar-cat-link w-100 border-0 bg-transparent text-start ${
                    allProps.category === "casquettes" ? "active fw-bold text-dark" : ""
                  }`}
                >
                  <span className="shammah-sidebar-cat-thumb">
                    <Image src="/images/cls-categories/pod/bonnets-casquettes.jpg" alt="Casquettes" width={36} height={36} />
                  </span>
                  <span>Casquettes</span>
                </button>
              </li>
              <li className="cate-item">
                <button
                  type="button"
                  onClick={() => allProps.setCategory("accessoires")}
                  data-bs-dismiss="offcanvas"
                  className={`text-sm link shammah-sidebar-cat-link w-100 border-0 bg-transparent text-start ${
                    allProps.category === "accessoires" ? "active fw-bold text-dark" : ""
                  }`}
                >
                  <span className="shammah-sidebar-cat-thumb">
                    <Image src="/images/cls-categories/pod/accessories-mug.jpg" alt="Accessoires" width={36} height={36} />
                  </span>
                  <span>Accessoires</span>
                </button>
              </li>
            </ul>
          </div>
          <div className="widget-facet">
            <div
              className="facet-title text-xl fw-medium"
              data-bs-target="#availability"
              role="button"
              data-bs-toggle="collapse"
              aria-expanded="true"
              aria-controls="availability"
            >
              <span>Disponibilité</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="availability" className="collapse show">
              <ul className="collapse-body filter-group-check current-scrollbar">
                <li
                  className="list-item"
                  onClick={() => allProps.setAvailability(true)}
                >
                  <input
                    type="radio"
                    name="availability"
                    className="tf-check"
                    id="inStock"
                    readOnly
                    checked={allProps.availability == true}
                  />
                  <label className="label">
                    <span>En stock</span>&nbsp;
                    <span className="count">(20)</span>
                  </label>
                </li>
                <li
                  className="list-item"
                  onClick={() => allProps.setAvailability(false)}
                >
                  <input
                    type="radio"
                    name="availability"
                    className="tf-check"
                    id="outStock"
                    checked={allProps.availability == false}
                    readOnly
                  />
                  <label className="label">
                    <span>Épuisé</span>&nbsp;
                    <span className="count">(3)</span>
                  </label>
                </li>
              </ul>
            </div>
          </div>
          <div className="widget-facet">
            <div
              className="facet-title text-xl fw-medium"
              data-bs-target="#price"
              role="button"
              data-bs-toggle="collapse"
              aria-expanded="true"
              aria-controls="price"
            >
              <span>Prix</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="price" className="collapse show">
              <div className="collapse-body widget-price filter-price">
                <div
                  className="price-val-range"
                  id="price-value-range"
                  data-min={0}
                  data-max={300}
                >
                  <Slider
                    value={allProps.price}
                    onChange={(price) => allProps.setPrice(price)}
                    range
                    min={0}
                    max={300}
                  />
                </div>
                <div className="box-value-price">
                  <span className="text-sm">Prix :</span>
                  <div className="price-box">
                    <div
                      className="price-val"
                      id="price-min-value"
                      data-currency="€"
                    >
                      {allProps.price[0]}
                    </div>
                    <span>-</span>
                    <div
                      className="price-val"
                      id="price-max-value"
                      data-currency="€"
                    >
                      {allProps.price[1]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="widget-facet">
            <div
              className="facet-title text-xl fw-medium"
              data-bs-target="#color"
              role="button"
              data-bs-toggle="collapse"
              aria-expanded="true"
              aria-controls="color"
            >
              <span>Couleur</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="color" className="collapse show">
              <div className="collapse-body filter-color-box flat-check-list">
                {[
                  { bgClass: "bg-yellow", name: "Yellow", label: "Jaune", hasLine: false },
                  { bgClass: "bg-dark", name: "Black", label: "Noir", hasLine: false },
                  { bgClass: "bg-white", name: "White", label: "Blanc", hasLine: true },
                  { bgClass: "bg-purple-3", name: "Purple", label: "Violet", hasLine: false },
                  {
                    bgClass: "bg-light-orange",
                    name: "Light Orange",
                    label: "Beige / Sable",
                    hasLine: false,
                  },
                  {
                    bgClass: "bg-light-pink-4",
                    name: "Light Pink",
                    label: "Rose poudré",
                    hasLine: false,
                  },
                  { bgClass: "bg-pink", name: "Pink", label: "Rose", hasLine: false },
                  {
                    bgClass: "bg-dark-green",
                    name: "Dark Green",
                    label: "Vert forêt",
                    hasLine: false,
                  },
                  { bgClass: "bg-grey-4", name: "Grey", label: "Gris", hasLine: false },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`check-item color-item color-check ${
                      allProps.color == item.name ? "active" : ""
                    } ${item.hasLine ? "line" : ""}`}
                    onClick={() => allProps.setColor(item.name)}
                  >
                    <span className={`color ${item.bgClass}`} />
                    <span className="color-text">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="widget-facet">
            <div
              className="facet-title text-xl fw-medium"
              data-bs-target="#size"
              role="button"
              data-bs-toggle="collapse"
              aria-expanded="true"
              aria-controls="size"
            >
              <span>Taille</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="size" className="collapse show">
              <div className="collapse-body filter-size-box flat-check-list">
                {sizes.map((item) => (
                  <div
                    key={item.size}
                    onClick={() => allProps.setSize(item.size)}
                    className={`check-item size-item size-check ${
                      item.size == allProps.size ? "active" : ""
                    } `}
                  >
                    <span className="size">{item.size}</span>&nbsp;
                    <span className="count">({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="widget-facet pt-2">
            <button
              type="button"
              onClick={allProps.clearFilter}
              data-bs-dismiss="offcanvas"
              className="tf-btn btn-line-dark w-100 justify-content-center"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
