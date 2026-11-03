import React from "react";
import Image from "next/image";
export default function Testimonials() {
  return (
    <section className="flat-spacing-15 pt-0">
      <div className="container">
        <div className="box-testimonial-quote text-center">
          <div className="list-star-default justify-content-center">
            <i className="icon-star text-green" />
            <i className="icon-star text-green" />
            <i className="icon-star text-green" />
            <i className="icon-star text-green" />
            <i className="icon-star text-green" />
          </div>
          <p className="text-xl-2 lh-xl-32">
            « J'ai commandé plusieurs fois sur Shammah et je suis impressionné par la qualité
            des matières, la précision des impressions et la rapidité d'expédition. <br className="d-none d-lg-block" />
            Porter ces messages au quotidien est une vraie source d'édification ! »
          </p>
          <div className="box-author">
            <div className="avt">
              <Image
                alt="Témoignage client Shammah"
                src="/images/testimonial/tes-about.jpg"
                width={100}
                height={100}
              />
            </div>
            <p className="text-md lh-xl-26 fw-medium">Samuel D.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
