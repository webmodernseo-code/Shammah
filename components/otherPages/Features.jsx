import React from "react";
import Image from "next/image";

export default function Features() {
  return (
    <section className="flat-spacing-3">
      <div className="container">
        <div className="flat-title-2 text-center">
          <p className="display-md-2 fw-medium">Pourquoi Choisir Shammah</p>
          <p className="text-md text-main">
            Nos créations allient qualité textile d'exception, inspiration chrétienne
            et confection éco-responsable imprimée en France.{" "}
            <br className="d-none d-lg-block" />
            Nous donnons du sens à votre style pour proclamer la foi, l'amour et l'espérance au quotidien.
          </p>
        </div>
        <div className="row">
          <div className="col-xl-7 col-md-6">
            <ul className="list-esd d-md-flex flex-md-column justify-content-md-center h-100">
              <li className="item">
                <h6>Éthique &amp; Confection Responsable</h6>
                <p className="text-md">
                  Chez Shammah, nous nous engageons à respecter les standards éthiques
                  les plus rigoureux. Chaque pièce est imprimée à la demande avec soin
                  afin de bannir le gaspillage textile et de préserver notre environnement.
                </p>
              </li>
              <li className="item">
                <h6>Élégance &amp; Durabilité</h6>
                <p className="text-md">
                  Du t-shirt essentiel au sweat à capuche réconfortant, nos collections
                  Shammah privilégient des cotons doux, des coupes modernes et des finitions
                  conçues pour durer au fil du temps.
                </p>
              </li>
              <li className="item">
                <h6>Exprimer sa Foi avec Fierté</h6>
                <p className="text-md">
                  Chaque création porte un message biblique, une promesse ou un verset inspirant
                  qui transforme un simple vêtement en un témoignage vivant de lumière et de grâce.
                </p>
              </li>
            </ul>
          </div>
          <div className="col-xl-5 col-md-6">
            <div className="image radius-16 overflow-hidden w-100 h-100">
              <Image
                src="/images/section/about-2.jpg"
                alt=""
                className="lazyload w-100 h-100 object-fit-cover"
                width={586}
                height={586}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
