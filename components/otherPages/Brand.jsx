"use client";
import React, { useMemo, useState } from "react";

const letters = [
    "Show all",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
];

const brandGroups = [
    {
        letter: "A",
        brands: [
            "AAVRANI",
            "ABBOTT",
            "Act+Acre",
            "adwoa beauty",
            "Ami Colé",
            "amika",
            "Anastasia Beverly Hills",
            "Aquis",
        ],
    },
    {
        letter: "B",
        brands: [
            "BaBylissPRO",
            "banu",
            "bareMinerals",
            "BASMA",
            "Beauty of Joseon",
            "BeautyBio",
            "Beautyblender",
            "belif",
            "Benefit Cosmetics",
            "Bio Ionic",
            "Biodance",
            "Biossance",
            "Blinc",
        ],
    },
    {
        letter: "C",
        brands: [
            "caliray",
            "CANOPY",
            "Carolina Herrera",
            "Caudalie",
            "CAY SKIN",
            "Ceremonia",
            "CHANEL",
            "Charlotte Tilbury",
            "Chloé",
            "Chris McMillan",
        ],
    },
    {
        letter: "D",
        brands: [
            "DIOR",
            "Dolce&Gabbana",
            "DOMINIQUE COSMETICS",
            "Donna Karan",
            "Dr. Barbara Sturm",
            "dae",
            "DAMDAM",
            "Danessa Myricks Beauty",
        ],
    },
    {
        letter: "E",
        brands: [
            "EADEM",
            "Element Eight",
            "Elemis",
            "Ellis Brooklyn",
            "Emi Jay",
            "Estée Lauder",
        ],
    },
    {
        letter: "F",
        brands: ["FocalPoint"],
    },
    {
        letter: "G",
        brands: [
            "AAVRANI",
            "ABBOTT",
            "Act+Acre",
            "adwoa beauty",
            "Ami Colé",
            "amika",
            "Anastasia Beverly Hills",
            "Aquis",
        ],
    },
    {
        letter: "K",
        brands: ["Kérastase", "Kiehl’s", "Kosas", "KVD Beauty"],
    },
    {
        letter: "M",
        brands: ["MAC Cosmetics", "Maison Margiela", "Milk Makeup", "Moroccanoil"],
    },
    {
        letter: "N",
        brands: ["NARS", "Natasha Denona", "Neutrogena", "Nudestix"],
    },
    {
        letter: "P",
        brands: [
            "Paula’s Choice",
            "Peace Out Skincare",
            "Peter Thomas Roth",
            "Prada Beauty",
        ],
    },
    {
        letter: "W",
        brands: [
            "Wander Beauty",
            "Westman Atelier",
            "Wet n Wild",
            "Wella Professionals",
        ],
    },
    {
        letter: "Z",
        brands: ["Zara Beauty", "Zelens", "Zoëva", "ZitSticka"],
    },
];

export default function Brand() {
    const [activeLetter, setActiveLetter] = useState("Show all");

    const availableLetters = useMemo(() => {
        return brandGroups.map((group) => group.letter);
    }, []);

    const filteredGroups = useMemo(() => {
        if (activeLetter === "Show all") {
            return brandGroups;
        }

        return brandGroups.filter((group) => group.letter === activeLetter);
    }, [activeLetter]);

    return (
        <section className="flat-spacing-3">
            <div className="container">
                <div className="brand-filter">
                    {letters.map((letter) => {
                        const isAll = letter === "Show all";
                        const isAvailable = isAll || availableLetters.includes(letter);
                        const isActive = activeLetter === letter;

                        return (
                            <button
                                key={letter}
                                type="button"
                                className={`btn-filter_brand text-body-l fw-normal ${
                                    isActive ? "active" : ""
                                } ${!isAvailable ? "disabled" : ""}`}
                                onClick={() => {
                                    if (isAvailable) {
                                        setActiveLetter(letter);
                                    }
                                }}
                                disabled={!isAvailable}
                            >
                                {letter}
                            </button>
                        );
                    })}
                </div>

                <div className="brand-list-v2">
                    {filteredGroups.map((group) => (
                        <div
                            key={group.letter}
                            className="brand-group"
                            data-letter={group.letter}
                        >
                            <h4 className="brand-title">{group.letter}</h4>

                            <ul className="name-brand_list">
                                {group.brands.map((brand) => (
                                    <li key={brand}>
                                        <a href={`shop-default`}>
                                            {brand}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
