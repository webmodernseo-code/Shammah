import React from "react";

export default function Register() {
  return (
    <div
      className="offcanvas offcanvas-end popup-style-1 popup-register"
      id="register"
    >
      <div className="canvas-wrapper">
        <div className="canvas-header popup-header">
          <span className="title">Create account</span>
          <button
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="canvas-body popup-inner">
          <form action="account-page.html" className="form-login">
            <div className="">
              <fieldset className="text mb_12">
                <input type="text" placeholder="First name" />
              </fieldset>
              <fieldset className="text mb_12">
                <input type="text" placeholder="Last name" />
              </fieldset>
              <fieldset className="email mb_12">
                <input type="email" placeholder="Email*" />
              </fieldset>
              <fieldset className="password">
                <input type="password" placeholder="Password*" />
              </fieldset>
            </div>
            <div className="bot">
              <p className="text text-sm text-main-2">
                Sign up for early Sale access plus tailored new arrivals, trends
                and promotions. To opt out, click unsubscribe in our emails.
              </p>
              <div className="button-wrap">
                <button
                  className="subscribe-button tf-btn animate-btn bg-dark-2 w-100"
                  type="submit"
                >
                  Sign up
                </button>
                <button
                  type="button"
                  data-bs-target="#login"
                  data-bs-toggle="offcanvas"
                  className="tf-btn btn-out-line-dark2 w-100"
                >
                  Sign in
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
