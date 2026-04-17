import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import api from "../api";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const location = useLocation();

  const [profile, setProfile] = useState({
    fullName: "Trader",
    email: "",
    username: "",
    profileImage: "",
  });

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    username: "",
  });

  const menuItems = [
    { label: "Dashboard", to: "/", icon: <SpaceDashboardOutlinedIcon fontSize="inherit" /> },
    { label: "Orders", to: "/orders", icon: <ReceiptLongOutlinedIcon fontSize="inherit" /> },
    { label: "Holdings", to: "/holdings", icon: <AccountBalanceWalletOutlinedIcon fontSize="inherit" /> },
    { label: "Positions", to: "/positions", icon: <ShowChartOutlinedIcon fontSize="inherit" /> },
    { label: "Funds", to: "/funds", icon: <SavingsOutlinedIcon fontSize="inherit" /> },
    { label: "Apps", to: "/apps", icon: <AppsOutlinedIcon fontSize="inherit" /> },
  ];

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        setProfileLoading(true);
        const res = await api.get("/me");
        const user = res.data;
        const next = {
          fullName: user.fullName || "Trader",
          email: user.email || "",
          username: user.username || "",
          profileImage: user.profileImage || "",
        };
        setProfile(next);
        setProfileForm({
          fullName: next.fullName,
          email: next.email,
          username: next.username,
        });
      } catch (err) {
        console.log(err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileFieldChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setProfileError("");
    setProfileMessage("");
  };

  const handleProfileSave = async () => {
    try {
      setIsSavingProfile(true);
      setProfileError("");
      setProfileMessage("");

      const res = await api.put("/me", profileForm);
      const user = res.data.user;
      const next = {
        fullName: user.fullName || "Trader",
        email: user.email || "",
        username: user.username || "",
        profileImage: user.profileImage || profile.profileImage || "",
      };

      setProfile(next);
      setProfileForm({
        fullName: next.fullName,
        email: next.email,
        username: next.username,
      });
      setProfileMessage("Profile updated");
    } catch (err) {
      setProfileError(err.response?.data?.message || "Unable to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please upload a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setProfileError("");
        setProfileMessage("");
        const base64Image = reader.result;
        const res = await api.put("/me/avatar", { profileImage: base64Image });
        const user = res.data.user;
        setProfile((prev) => ({ ...prev, profileImage: user.profileImage || "" }));
        setProfileMessage("Avatar updated");
      } catch (err) {
        setProfileError(err.response?.data?.message || "Unable to upload avatar");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.reload();
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  const isMenuActive = (to, index) => {
    if (location.pathname === to) return true;
    if (to !== "/" && location.pathname.startsWith(to)) return true;
    return selectedMenu === index;
  };

  return (
    <div className="menu-container">
      <Link to="/" className="dashboard-brand" style={{ textDecoration: "none" }}>
        <span className="dashboard-brand-dot" aria-hidden="true"></span>
        <span className="dashboard-brand-text">RealTime Fintech Trading Engine</span>
      </Link>
      <div className="menus">
        <ul>
          {menuItems.map((item, index) => (
            <li key={item.to}>
              <Link
                style={{ textDecoration: "none" }}
                to={item.to}
                onClick={() => handleMenuClick(index)}
              >
                <p className={isMenuActive(item.to, index) ? activeMenuClass : menuClass}>
                  <span className="menu-icon">{item.icon}</span>
                  {item.label}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <hr />
        <div className="profile" onClick={handleProfileClick}>
          <div className="avatar">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="Profile" className="avatar-image" />
            ) : (
              <AccountCircleOutlinedIcon fontSize="inherit" />
            )}
          </div>
          <p className="username">{profile.fullName || "TRADER"}</p>
        </div>
        {isProfileDropdownOpen && (
          <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="profile-dropdown-header">
              <div className="profile-dropdown-title">
                <EditOutlinedIcon fontSize="inherit" />
                Profile Settings
              </div>
            </div>

            <label className="profile-avatar-upload">
              <span className="profile-avatar-upload-icon"><CloudUploadOutlinedIcon fontSize="inherit" /></span>
              <span>Upload profile image</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} />
            </label>

            <label className="profile-field-label">Full name</label>
            <input
              className="profile-field-input"
              type="text"
              name="fullName"
              value={profileForm.fullName}
              onChange={handleProfileFieldChange}
            />

            <label className="profile-field-label">Email</label>
            <input
              className="profile-field-input"
              type="email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileFieldChange}
            />

            <label className="profile-field-label">Username</label>
            <input
              className="profile-field-input"
              type="text"
              name="username"
              value={profileForm.username}
              onChange={handleProfileFieldChange}
            />

            {profileLoading && <p className="profile-status-text">Loading profile…</p>}
            {profileError && <p className="profile-status-text error">{profileError}</p>}
            {profileMessage && <p className="profile-status-text success">{profileMessage}</p>}

            <div className="profile-actions-row">
              <button
                type="button"
                className="profile-save-btn"
                onClick={handleProfileSave}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? "Saving…" : "Save"}
              </button>
              <button type="button" className="profile-logout-btn" onClick={handleLogout}>
                <LogoutOutlinedIcon fontSize="inherit" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;