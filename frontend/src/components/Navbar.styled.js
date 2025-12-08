import styled from "styled-components";

export const NavbarContainer = styled.nav`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

export const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    gap: 1rem;
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #f0f0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 10px rgba(255, 255, 255, 0.3));

  img {
    height: 2.5rem;
    width: auto;
    filter: drop-shadow(0 2px 10px rgba(255, 255, 255, 0.3));
    transition: all 0.3s ease;
    margin-bottom: 0.5rem;
  }

  &:hover {
    transform: scale(1.08) rotate(-2deg);
    filter: drop-shadow(0 4px 20px rgba(255, 255, 255, 0.6));

    img {
      filter: drop-shadow(0 4px 20px rgba(255, 255, 255, 0.6));
    }
  }
`;

export const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  flex: 1;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavLink = styled.button`
  background: ${(props) =>
    props.$isActive
      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2))"
      : "rgba(255, 255, 255, 0.1)"};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid
    ${(props) =>
      props.$isActive
        ? "rgba(255, 255, 255, 0.6)"
        : "rgba(255, 255, 255, 0.25)"};
  color: white;
  font-size: 1rem;
  font-weight: ${(props) => (props.$isActive ? "700" : "500")};
  cursor: pointer;
  padding: 0.6rem 1.5rem;
  border-radius: 15px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  box-shadow: ${(props) =>
    props.$isActive
      ? "0 8px 25px rgba(255, 255, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
      : "0 2px 8px rgba(0, 0, 0, 0.15)"};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.35),
      rgba(255, 255, 255, 0.25)
    );
    border-color: rgba(255, 255, 255, 0.8);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px) scale(1.02);
  }
`;

export const UserSection = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const UserButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.4);
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    span:last-child {
      display: none;
    }
  }
`;

export const GuestBadge = styled.span`
  background: linear-gradient(135deg, #ffd89b 0%, #ff9a76 100%);
  color: white;
  padding: 0.25rem 0.65rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const UserDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  overflow: hidden;
  z-index: 1001;
  animation: slideDown 0.3s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const DropdownItem = styled.button`
  width: 100%;
  padding: 1rem 1.25rem;
  background: ${(props) => (props.$danger ? "#fff5f5" : "white")};
  color: ${(props) => (props.$danger ? "#d32f2f" : "#333")};
  border: none;
  text-align: left;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    background: ${(props) => (props.$danger ? "#ffebee" : "#f5f5f5")};
    transform: translateX(4px);
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

export const HamburgerButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;

  @media (max-width: 768px) {
    display: flex;
  }

  span {
    width: 2rem;
    height: 0.25rem;
    background: white;
    border-radius: 10px;
    transition: all 0.3s ease;
    position: relative;
    transform-origin: 1px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

    &:first-child {
      transform: rotate(0);
    }

    &:nth-child(2) {
      opacity: 1;
      transform: translateX(0);
    }

    &:nth-child(3) {
      transform: rotate(0);
    }
  }

  &:hover span {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.4);
  }
`;

export const MobileMenu = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    background: linear-gradient(
      180deg,
      rgba(102, 126, 234, 0.95) 0%,
      rgba(118, 75, 162, 0.95) 100%
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    padding: 1rem;
    gap: 0.75rem;
    animation: slideDown 0.3s ease;

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`;

export const MobileNavLink = styled.button`
  background: ${(props) =>
    props.$isActive ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)"};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid
    ${(props) =>
      props.$isActive
        ? "rgba(255, 255, 255, 0.5)"
        : "rgba(255, 255, 255, 0.2)"};
  color: ${(props) => (props.$danger ? "#ffebee" : "white")};
  font-size: 1rem;
  font-weight: ${(props) => (props.$isActive ? "700" : "600")};
  cursor: pointer;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  text-align: left;
  box-shadow: ${(props) =>
    props.$isActive
      ? "0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateX(5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: translateX(3px);
  }
`;
