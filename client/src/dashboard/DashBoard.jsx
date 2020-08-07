import React, { Component } from "react";
import { Link } from "react-router-dom";
import ListingComponent from "./Listing";
import ContactForm from "./ContactForm";
import styles from "./dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faPlusCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import variables from "../env_variables";

const tableColumn = {
  width: "100px",
};

export default class Dashboard extends Component {
  state = {
    contacts: [],
    email: "",
    firstName: "",
    lastName: "",
    contactFormToggle: false,
    editing: false,
    filterActive: false,
  };

  async componentDidMount() {
    try {
      const res = await fetch(`${variables.URL_API}lists`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.status === 200) {
        this.setState({
          email: data.email,
          contacts: data.contacts,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } else {
        const error = new Error(data.error);
        throw error;
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  handleAddContactForm = (event) => {
    if (!this.state.editing) {
      const { contactFormToggle } = this.state;
      this.setState({ contactFormToggle: !contactFormToggle });
    }
  };

  handleDelete = async (index) => {
    const contacts = this.state.contacts.filter((item, idx) => idx !== index);
    try {
      const res = await fetch(`${variables.URL_API}lists`, {
        method: "PUT",
        body: JSON.stringify({ contacts: contacts }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.status === 200) {
        this.setState({
          contacts: contacts,
        });
      } else {
        const error = new Error(data.error);
        throw error;
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  handleEditing = (value) => {
    this.setState({ editing: value });
  };

  delete_cookie(name) {
    document.cookie =
      name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  handleLogout = () => {
    this.delete_cookie("token");
  };
  handleSave = async (item, isNew, index) => {
    let contacts = this.state.contacts;
    if (!isNew) {
      contacts = contacts.filter((i, idx) => idx !== index);
      item["lastUpdate"] = Date.now();
    } else {
      this.handleAddContactForm();
    }
    contacts.unshift(item);
    try {
      const res = await fetch(`${variables.URL_API}lists`, {
        method: "PUT",
        body: JSON.stringify({ contacts: contacts }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.status === 200) {
        this.setState({
          contacts: contacts,
        });
        this.handleEditing(false);
      } else {
        const error = new Error(data.error);
        throw error;
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  render() {
    return (
      <div className={styles.container}>
        <div className={[styles.leftSideBar, styles.center].join(" ")}>
          <div className="text-center text-light mb-3">
            <FontAwesomeIcon icon={faUserCircle} size="6x" />
          </div>
          <div className={styles.leftlinks}>
            <span>Welcome</span>
            <br></br>
            <span>
              {this.state.firstName} {this.state.lastName}
            </span>
            <br></br>
            <span>
              <FontAwesomeIcon icon={faSignOutAlt} size="1x" />
            </span>
            &nbsp;&nbsp;&nbsp;
            <span>
              <Link to="/" onClick={this.handleLogout}>
                Logout
              </Link>
            </span>
          </div>
        </div>
        <div className={styles.rightSideBar}>
          <div className="mt-5">
            <span
              style={{ fontSize: "16px", color: "#FFFFFF", fontWeight: 600 }}
            >
              Contact List
            </span>
          </div>
          <div className="mt-2 w-100">
            <button
              className={styles.listingButtons}
              style={{ marginRight: "10px" }}
            >
              Last Ten Days
            </button>
            <button className={styles.listingButtons}>Last Month</button>
            <div
              className="flex-grow-1 text-right pr-5"
              style={{ color: "#0ED199" }}
            >
              <FontAwesomeIcon
                onClick={this.handleAddContactForm}
                icon={faPlusCircle}
                size="3x"
              />
            </div>
          </div>
          <div className="w-100">
            <div
              className="d-flex flex-row w-100 justify-content-between p-3 align-items-center mt-4"
              style={{
                backgroundColor: "#2E2439",
                color: "#DFDFDF",
                height: "24px",
              }}
            >
              <div style={tableColumn}>Name</div>
              <div style={tableColumn}>Date</div>
              <div style={tableColumn}>Location</div>
              <div style={tableColumn}>Status</div>
              <div style={tableColumn}></div>
            </div>
          </div>

          {this.state.contactFormToggle && (
            <ContactForm onContactSave={this.handleSave} new={true} />
          )}
          <ListingComponent
            contacts={this.state.contacts}
            handleDelete={this.handleDelete}
            handleEditing={this.handleEditing}
            onContactSave={this.handleSave}
          />
        </div>
      </div>
    );
  }
}
