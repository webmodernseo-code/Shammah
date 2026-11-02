import React from "react";
import Sidebar from "./Sidebar";
import Link from "next/link";
import Image from "next/image";
export default function Orders() {
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
          <div className="my-acount-content account-orders">
            <div className="account-no-orders-wrap">
              <Image
                className="lazyload"
                data-src="/images/section/account-no-order.png"
                alt=""
                src="/images/section/account-no-order.png"
                width={169}
                height={168}
              />
              <div className="display-sm fw-medium title">
                You haven’t placed any order yet
              </div>
              <div className="text text-sm">
                It’s time to make your first order
              </div>
              <Link
                href={`/shop-fullwidth`}
                className="tf-btn animate-btn d-inline-flex bg-dark-2 justify-content-center"
              >
                Shop Now
              </Link>
            </div>
            <div className="account-orders-wrap">
              <h5 className="title">Order History</h5>
              <div className="wrap-account-order">
                <table>
                  <thead>
                    <tr>
                      <th className="text-md fw-medium">Order ID</th>
                      <th className="text-md fw-medium">Date</th>
                      <th className="text-md fw-medium">Status</th>
                      <th className="text-md fw-medium">Total</th>
                      <th className="text-md fw-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="tf-order-item">
                      <td className="text-md">#12345</td>
                      <td className="text-md">15 May 2024</td>
                      <td className="text-md text-delivered">Delivered</td>
                      <td className="text-md">$690 / 3 items</td>
                      <td>
                        <a
                          href="#order_detail"
                          data-bs-toggle="modal"
                          className="view-detail"
                        >
                          Detail
                        </a>
                      </td>
                    </tr>
                    <tr className="tf-order-item">
                      <td className="text-md">#12345</td>
                      <td className="text-md">15 May 2024</td>
                      <td className="text-md text-delivered">Delivered</td>
                      <td className="text-md">$690 / 3 items</td>
                      <td>
                        <a
                          href="#order_detail"
                          data-bs-toggle="modal"
                          className="view-detail"
                        >
                          Detail
                        </a>
                      </td>
                    </tr>
                    <tr className="tf-order-item">
                      <td className="text-md">#12345</td>
                      <td className="text-md">15 May 2024</td>
                      <td className="text-md text-on-the-way">On the way</td>
                      <td className="text-md">$690 / 3 items</td>
                      <td>
                        <a
                          href="#order_detail"
                          data-bs-toggle="modal"
                          className="view-detail"
                        >
                          Detail
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Account */}
    </div>
  );
}
