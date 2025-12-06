import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  NavbarContainer,
  NavContent,
  Logo,
  NavLinks,
  NavLink,
  UserSection,
  UserButton,
  UserDropdown,
  DropdownItem,
  GuestBadge,
  UserInfo,
  HamburgerButton,
  MobileMenu,
  MobileNavLink,
} from "./Navbar.styled";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isGuest = localStorage.getItem("is_guest") === "true";
  const userName = localStorage.getItem("user_name") || "User";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("guest_id");
    localStorage.removeItem("is_guest");
    localStorage.removeItem("user_name");
    navigate("/auth");
  };

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleMobileLogout = () => {
    setMobileMenuOpen(false);
    handleLogout();
  };

  return (
    <NavbarContainer>
      <NavContent>
        <Logo onClick={() => navigate("/my-videos")}>ClipWise</Logo>

        <NavLinks>
          <NavLink
            onClick={() => navigate("/my-videos")}
            $isActive={isActive("/my-videos")}
          >
            📚 My Videos
          </NavLink>
          <NavLink
            onClick={() => navigate("/add-video")}
            $isActive={isActive("/add-video")}
          >
            ➕ Add Video
          </NavLink>
        </NavLinks>

        <UserSection>
          <UserButton
            onClick={() => setShowDropdown(!showDropdown)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          >
            <UserInfo>
              <span>👤</span>
              <span>{isGuest ? "Guest" : userName}</span>
            </UserInfo>
            {isGuest && <GuestBadge>Guest</GuestBadge>}
          </UserButton>

          {showDropdown && (
            <UserDropdown>
              <DropdownItem onClick={() => navigate("/profile")}>
                ⚙️ Profile
              </DropdownItem>
              <DropdownItem onClick={handleLogout} $danger>
                🚪 {isGuest ? "Exit Guest Mode" : "Logout"}
              </DropdownItem>
            </UserDropdown>
          )}
        </UserSection>

        <HamburgerButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </HamburgerButton>
      </NavContent>

      {mobileMenuOpen && (
        <MobileMenu>
          <MobileNavLink
            onClick={() => handleNavClick("/my-videos")}
            $isActive={isActive("/my-videos")}
          >
            📚 My Videos
          </MobileNavLink>
          <MobileNavLink
            onClick={() => handleNavClick("/add-video")}
            $isActive={isActive("/add-video")}
          >
            ➕ Add Video
          </MobileNavLink>
          <MobileNavLink onClick={() => handleNavClick("/profile")}>
            ⚙️ Profile
          </MobileNavLink>
          <MobileNavLink onClick={handleMobileLogout} $danger>
            🚪 {isGuest ? "Exit Guest Mode" : "Logout"}
          </MobileNavLink>
        </MobileMenu>
      )}
    </NavbarContainer>
  );
}

export default Navbar;
