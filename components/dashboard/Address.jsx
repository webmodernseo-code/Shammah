"use client";
import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";

export default function Address() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      firstName: "Vinetant",
      lastName: "Pham",
      company: "Company",
      address1: "16 Yarran st",
      city: "Punchbowl",
      region: "Australia",
      province: "", // Corrected spelling
      zipCode: "2196",
      phone: "+61 1234 3435",
      isDefault: false,
      email: "account@vineta.com",
    },
    {
      id: 2,
      firstName: "Vinetant",
      lastName: "Pham",
      company: "Company",
      address1: "17 Yarran st",
      city: "Punchbowl",
      region: "Australia",
      province: "",
      zipCode: "2196",
      phone: "+61 1234 3435",
      isDefault: false,
      email: "account@vineta.com",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    city: "",
    region: "",
    province: "",
    zipCode: "",
    phone: "",
    isDefault: false,
    email: "",
  });

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setNewAddress((prevAddress) => ({
      ...prevAddress,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();

    const nextId =
      addresses.length > 0
        ? Math.max(...addresses.map((addr) => addr.id)) + 1
        : 1;

    const newAddressToAdd = {
      ...newAddress,
      id: nextId,
    };

    setAddresses((prevAddresses) => [...prevAddresses, newAddressToAdd]);

    setNewAddress({
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      city: "",
      region: "",
      province: "",
      zipCode: "",
      phone: "",
      isDefault: false,
      email: "",
    });
    setShowAddForm(false);
  };

  const handleEditAddress = (id) => {
    setEditingAddressId(id);

    const addressToEdit = addresses.find((addr) => addr.id === id);

    if (addressToEdit) {
      setNewAddress({ ...addressToEdit }); // Pre-populate the form
    }
  };

  const handleUpdateAddress = (e) => {
    e.preventDefault();

    setAddresses((prevAddresses) =>
      prevAddresses.map((address) =>
        address.id === editingAddressId
          ? { ...address, ...newAddress }
          : address
      )
    );

    setEditingAddressId(null);
    setNewAddress({
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      city: "",
      region: "",
      province: "",
      zipCode: "",
      phone: "",
      isDefault: false,
      email: "",
    });
  };

  const handleDeleteAddress = (id) => {
    setAddresses((prevAddresses) =>
      prevAddresses.filter((address) => address.id !== id)
    );
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
    setNewAddress({
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      city: "",
      region: "",
      province: "",
      zipCode: "",
      phone: "",
      isDefault: false,
      email: "",
    });
  };

  const handleSetDefault = (id) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      }))
    );
  };

  return (
    <div className="flat-spacing-13">
      <div className="container-7">
        <div className="btn-sidebar-mb d-lg-none">
          <button data-bs-toggle="offcanvas" data-bs-target="#mbAccount">
            <i className="icon icon-sidebar" />
          </button>
        </div>
        {/* /sidebar-account */}
        {/* Account */}

        <div className="main-content-account">
          <div className="sidebar-account-wrap sidebar-content-wrap sticky-top d-lg-block d-none">
            <ul className="my-account-nav">
              <Sidebar />
            </ul>
          </div>
          <div className="my-acount-content account-address">
            <h6 className="title-account">
              Your addresses ({addresses.length})
            </h6>
            <div className="widget-inner-address">
              <button
                className="tf-btn btn-add-address animate-btn"
                onClick={() => setShowAddForm(true)}
              >
                Add new address
              </button>

              {showAddForm && (
                <form
                  onSubmit={handleAddAddress}
                  className="wd-form-address form-default show-form-address"
                  style={{ display: "block" }}
                >
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        value={newAddress.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        value={newAddress.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="company">Company</label>
                      <input
                        type="text"
                        id="company"
                        value={newAddress.company}
                        onChange={handleInputChange}
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="address1">Address 1</label>
                      <input
                        type="text"
                        id="address1"
                        value={newAddress.address1}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        value={newAddress.city}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="region">Country/region</label>
                      <input
                        type="text"
                        id="region"
                        value={newAddress.region}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="province">Province</label>
                      <input
                        type="text"
                        id="province"
                        value={newAddress.province}
                        onChange={handleInputChange}
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="zipCode">Postal/ZIP code</label>
                      <input
                        type="text"
                        id="zipCode"
                        value={newAddress.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="text"
                        id="phone"
                        value={newAddress.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="tf-cart-checkbox">
                    <input
                      type="checkbox"
                      name="isDefault"
                      className="tf-check"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="isDefault" className="label">
                      <span>Set as default address</span>
                    </label>
                  </div>
                  <div className="box-btn">
                    <button className="tf-btn animate-btn" type="submit">
                      Add Address
                    </button>
                    <button
                      type="button"
                      className="tf-btn btn-out-line-dark btn-hide-address"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <ul className="list-account-address tf-grid-layout md-col-2">
                {addresses.map((address, i) => (
                  <li className="account-address-item" key={i}>
                    <p className="title text-md fw-medium">
                      {address.address1}
                    </p>
                    <div className="info-detail">
                      <div className="box-infor">
                        <p className="text-md">
                          {address.firstName} {address.lastName}
                        </p>
                        <p className="text-md">{address.email}</p>
                        {address.company && (
                          <p className="text-md">{address.company}</p>
                        )}
                        <p className="text-md">{address.address1}</p>
                        <p className="text-md">{address.city}</p>
                        <p className="text-md">{address.region}</p>
                        {address.province && (
                          <p className="text-md">{address.province}</p>
                        )}
                        <p className="text-md">{address.zipCode}</p>
                        <p className="text-md">{address.phone}</p>
                        <p className="text-md">
                          Default Address: {address.isDefault ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="box-btn">
                        <button
                          className="tf-btn btn-out-line-dark btn-edit-address"
                          onClick={() => {
                            handleEditAddress(address.id);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="tf-btn btn-out-line-dark btn-delete-address"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {editingAddressId !== null && (
                <form
                  onSubmit={handleUpdateAddress}
                  className="wd-form-address form-default edit-form-address "
                  style={{ display: "block" }}
                >
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        value={newAddress.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        value={newAddress.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="company">Company</label>
                      <input
                        type="text"
                        id="company"
                        value={newAddress.company}
                        onChange={handleInputChange}
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="address1">Address 1</label>
                      <input
                        type="text"
                        id="address1"
                        value={newAddress.address1}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        value={newAddress.city}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="region">Country/region</label>
                      <input
                        type="text"
                        id="region"
                        value={newAddress.region}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="province">Province</label>
                      <input
                        type="text"
                        id="province"
                        value={newAddress.province}
                        onChange={handleInputChange}
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="zipCode">Postal/ZIP code</label>
                      <input
                        type="text"
                        id="zipCode"
                        value={newAddress.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="text"
                        id="phone"
                        value={newAddress.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </fieldset>
                  </div>
                  <div className="tf-cart-checkbox">
                    <input
                      type="checkbox"
                      name="isDefault"
                      className="tf-check"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="isDefault" className="label">
                      <span>Set as default address</span>
                    </label>
                  </div>
                  <div className="box-btn">
                    <button className="tf-btn animate-btn" type="submit">
                      Update
                    </button>
                    <button
                      type="button"
                      className="tf-btn btn-out-line-dark btn-hide-edit-address"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* /Account */}
      </div>
    </div>
  );
}
