import React from "react";
import Sidebar from "./Sidebar";
import Link from "next/link";
import Image from "next/image";
import CountdownTimer from "../common/Countdown";
export default function Account() {
  return (
    <div className="flat-spacing-13">
      <div className="container-7">
        {/* sidebar-account */}
        <div className="btn-sidebar-mb d-lg-none">
          <button data-bs-toggle="offcanvas" data-bs-target="#mbAccount">
            <i className="icon icon-sidebar" />
          </button>
        </div>
        {/* /sidebar-account */}
        {/* Section-acount */}

        <div className="main-content-account">
          <div className="sidebar-account-wrap sidebar-content-wrap sticky-top d-lg-block d-none">
            <ul className="my-account-nav">
              <Sidebar />
            </ul>
          </div>
          <div className="my-acount-content account-dashboard">
            <div className="box-account-title">
              <p className="hello-name display-sm fw-medium">
                Hello Vinetant Pham!
                <span>
                  (not <span className="name">Vinetant Pham</span>?
                </span>
                <Link href={`/`} className="text-decoration-underline link">
                  Log Out
                </Link>
                <span>)</span>
              </p>
              <p className="notice text-sm">
                Today is a great day to check your account page. You can check{" "}
                <a href="#" className="text-primary text-decoration-underline">
                  your last orders
                </a>{" "}
                or have a look to{" "}
                <a href="#" className="text-primary text-decoration-underline">
                  your wishlist
                </a>{" "}
                . Or maybe you can start to shop{" "}
                <a href="#" className="text-primary text-decoration-underline">
                  our latest offers
                </a>{" "}
                ?
              </p>
            </div>
            <div className="content-account">
              <ul className="box-check-list flex-sm-nowrap">
                <li>
                  <Link
                    href={`/account-orders`}
                    className="box-check text-center"
                  >
                    <div className="icon">
                      <i className="icon-order" />
                      <span className="count-number text-sm text-white fw-medium">
                        1
                      </span>
                    </div>
                    <div className="text">
                      <div className="link name-type text-xl fw-medium">
                        Orders
                      </div>
                      <p className="sub-type text-sm">
                        Check the history of all your orders
                      </p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href={`/wish-list`} className="box-check text-center">
                    <div className="icon">
                      <i className="icon-heart" />
                      <span className="count-number text-sm text-white fw-medium">
                        1
                      </span>
                    </div>
                    <div className="text">
                      <div className="link name-type text-xl fw-medium">
                        Wishlist
                      </div>
                      <p className="sub-type text-sm">Check your wishlist</p>
                    </div>
                  </Link>
                </li>
              </ul>
              <div className="banner-account">
                <div className="image">
                  <Image
                    src="/images/banner/account-1.jpg"
                    alt=""
                    className="lazyload"
                    width={912}
                    height={280}
                  />
                </div>
                <div className="banner-content-right">
                  <div className="banner-title">
                    <p className="display-md fw-medium">Free Shipping</p>
                    <p className="text-md">for all orders over $300.00</p>
                  </div>
                  <div className="banner-btn">
                    <Link href={`/shop-default`} className="tf-btn animate-btn">
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
              <div className="banner-account banner-acc-countdown bg-linear d-flex align-items-center">
                <div className="banner-content-left">
                  <div className="banner-title">
                    <p className="sub text-md fw-medium">SUMMER SALE</p>
                    <p className="display-xl fw-medium">50% OFF</p>
                    <p className="sub text-md fw-medium">
                      WITH PROMOTE CODE: 12D34E
                    </p>
                  </div>
                  <div className="banner-btn">
                    <Link
                      href={`/shop-default`}
                      className="tf-btn btn-white animate-btn animate-dark"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
                <div className="banner-countdown">
                  <div className="wg-countdown-2">
                    <span className="js-countdown">
                      <CountdownTimer style={2} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Account */}
    </div>
  );
}
