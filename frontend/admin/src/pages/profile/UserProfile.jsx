import React, { useState } from "react";
import "./UserProfile.css";
import {
  UserOutlined,
  LockOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  CheckOutlined,
  ManOutlined,
  WomanOutlined,
  EyeOutlined,
} from "@ant-design/icons";

function UserProfile() {
  // Profile State
  const [profilePicture, setProfilePicture] = useState(null);
  const [username, setUsername] = useState("JohnDoe");
  const [phone, setPhone] = useState("+1234567890");
  const [recoveryNumber, setRecoveryNumber] = useState("+0987654321");
  const [location, setLocation] = useState("New York, USA");
  const [email, setEmail] = useState("johndoe@example.com");
  const [gender, setGender] = useState("man");

  // Password State
  const [currentSection, setCurrentSection] = useState("profile"); 
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Event Handlers
  const handleProfilePictureChange = (event) => {
    setProfilePicture(URL.createObjectURL(event.target.files[0]));
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const handleRecoveryNumberChange = (event) => {
    setRecoveryNumber(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleGenderChange = (value) => {
    setGender(value);
  };

  const handleSaveProfile = () => {
    console.log("Profile saved:", {
      username,
      phone,
      recoveryNumber,
      location,
      email,
      gender,
    });
  };

  const handleDeleteProfile = () => {
    console.log("Profile deleted");
  };

  const handleCurrentPasswordChange = (event) => {
    setCurrentPassword(event.target.value);
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
    setNewPasswordError("");
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    setConfirmPasswordError("");
  };


  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div
          className={`sidebar-item ${
            currentSection === "profile" ? "active" : ""
          }`}
          onClick={() => setCurrentSection("profile")}
        >
          <div className="sidebar-icon">
            <UserOutlined />
          </div>
          <div className="sidebar-text">Profile</div>
        </div>
        <div
          className={`sidebar-item ${
            currentSection === "password" ? "active" : ""
          }`}
          onClick={() => setCurrentSection("password")}
        >
          <div className="sidebar-icon">
            <LockOutlined />
          </div>
          <div className="sidebar-text">Password</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {currentSection === "profile" && (
          <div className="profile-section">
            <div className="profile-header">
              <h2>Profile Settings</h2>
              <p className="profile-subtitle">Manage your personal information</p>
            </div>
            <div className="profile-content">
              {/* Profile Picture Section */}
              <div className="profile-picture-section">
                <div className="profile-picture-container">
                  <div className="profile-picture-wrapper">
                    <img
                      src={
                        profilePicture ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                      }
                      alt="Profile"
                      className="profile-image"
                    />
                    <label htmlFor="profile-upload" className="edit-overlay">
                      <EditOutlined className="edit-icon" />
                      <span>Change Photo</span>
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
                <div className="profile-actions">
                  <button
                    className="action-button upload-button"
                    onClick={() => document.getElementById("profile-upload").click()}
                  >
                    Upload New Photo
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={handleDeleteProfile}
                  >
                    Remove Photo
                  </button>
                </div>
              </div>

              {/* Profile Details Form */}
              <div className="profile-details-form">
                <div className="form-grid">
                  {/* Username */}
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <div className="input-with-icon">
                      <UserOutlined className="input-icon" />
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="Enter your username"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-with-icon">
                      <MailOutlined className="input-icon" />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-with-icon">
                      <PhoneOutlined className="input-icon" />
                      <input
                        type="text"
                        id="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Recovery Number */}
                  <div className="form-group">
                    <label htmlFor="recovery-number">Recovery Number</label>
                    <div className="input-with-icon">
                      <SafetyOutlined className="input-icon" />
                      <input
                        type="text"
                        id="recovery-number"
                        value={recoveryNumber}
                        onChange={handleRecoveryNumberChange}
                        placeholder="Enter recovery number"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <div className="input-with-icon">
                      <EnvironmentOutlined className="input-icon" />
                      <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={handleLocationChange}
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label>Gender</label>
                    <div className="gender-selection">
                      <button
                        className={`gender-option ${gender === "man" ? "active" : ""}`}
                        onClick={() => handleGenderChange("man")}
                      >
                        <ManOutlined />
                        <span>Male</span>
                      </button>
                      <button
                        className={`gender-option ${gender === "woman" ? "active" : ""}`}
                        onClick={() => handleGenderChange("woman")}
                      >
                        <WomanOutlined />
                        <span>Female</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="form-actions">
                  <button
                    style={{ backgroundColor: "#52c41a" }}
                    className="save-button"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Section */}
        {currentSection === "password" && (
          <div className="password-section">
            <div className="password-header">
              <h2>Password Settings</h2>
              <p className="password-subtitle">Change your account password</p>
            </div>
            <div className="password-form">
              {/* Current Password */}
              <div className="form-group">
                <label htmlFor="current-password">
                  Current Password
                  <span className="required-asterisk">*</span>
                </label>
                <div className="password-input-container">
                  <LockOutlined className="input-icon" />
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={handleCurrentPasswordChange}
                    placeholder="Enter current password"
                  />
                  {currentPassword && (
                    <EyeOutlined
                      className="toggle-password"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    />
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="form-group">
                <label htmlFor="new-password">
                  New Password
                  <span className="required-asterisk">*</span>
                </label>
                <div className="password-input-container">
                  <LockOutlined className="input-icon" />
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Enter new password"
                  />
                  {newPassword && (
                    <EyeOutlined
                      className="toggle-password"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    />
                  )}
                </div>
                {newPasswordError && (
                  <p className="error-message">{newPasswordError}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirm-password">
                  Confirm Password
                  <span className="required-asterisk">*</span>
                </label>
                <div className="password-input-container">
                  <LockOutlined className="input-icon" />
                  <input
                    id="confirm-password"
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm new password"
                  />
                </div>
                {confirmPasswordError && (
                  <p className="error-message">{confirmPasswordError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setNewPasswordError("");
                    setConfirmPasswordError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default UserProfile;