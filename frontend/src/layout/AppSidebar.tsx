import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  ListIcon,
  PlugInIcon,
  UserCircleIcon,
  EnvelopeIcon,
} from "../icons";

import { useAppSidebar, useAppUser } from "../store/useAppStore";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Home",
    path: "/",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Courses",
    path: "/courses",
  },
  {
    icon: <ListIcon />,
    name: "Assignments",
    subItems: [
      { name: "All Assignments", path: "/assignments" },
      { name: "Dynamic Report", path: "/dynamic-report" },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Profile",
    path: "/profile",
  },
  {
    icon: <EnvelopeIcon />,
    name: "Contact Us",
    path: "/contact",
    roles: ["student"],
  },
];

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setSidebarHovered } = useAppSidebar();
  const user = useAppUser();

  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    if (!openSubmenu) return;
    const key = `${openSubmenu.type}-${openSubmenu.index}`;
    const el = subMenuRefs.current[key];
    if (el) {
      setSubMenuHeight(prev => ({ ...prev, [key]: el.scrollHeight }));
    }
  }, [openSubmenu]);

  const handleToggle = (index: number, type: "main" | "others") => {
    setOpenSubmenu(prev =>
      prev?.type === type && prev?.index === index ? null : { type, index }
    );
  };

  const renderItems = (items: NavItem[], type: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items
        .filter(item => !item.roles || item.roles.includes(user?.role ?? ""))
        .map((item, index) => (
          <li key={item.name}>
            {item.subItems ? (
              <button
                onClick={() => handleToggle(index, type)}
                className={`menu-item ${
                  openSubmenu?.type === type && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-size">{item.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{item.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto transition-transform ${
                      openSubmenu?.type === type && openSubmenu?.index === index
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              item.path && (
                <Link
                  to={item.path}
                  className={`menu-item ${
                    isActive(item.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span className="menu-item-icon-size">{item.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{item.name}</span>
                  )}
                </Link>
              )
            )}

            {item.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={el => { subMenuRefs.current[`${type}-${index}`] = el; }}
                style={{
                  height:
                    openSubmenu?.type === type && openSubmenu?.index === index
                      ? subMenuHeight[`${type}-${index}`]
                      : 0,
                }}
                className="overflow-hidden transition-all duration-300"
              >
                <ul className="ml-9 mt-2 space-y-1">
                  {item.subItems.map(sub => {
                    if (sub.name === "Dynamic Report" && (user?.role === "student" || user?.role === "admin")) {
                      return null;
                    }

                    return (
                      <li key={sub.name}>
                        <Link
                          to={sub.path}
                          className={`menu-dropdown-item ${
                            isActive(sub.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {sub.name}
                          {sub.name === "Dynamic Report" && (
                            <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wide">
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        ))}
    </ul>
  );

  const isAdminPanelActive = location.pathname.startsWith("/admin");

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-white transition-all dark:bg-gray-900
      ${isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
    >
      {/* LOGO */}
      <div className="flex items-center justify-center px-5 py-7 h-20">
        <Link to="/" className="flex items-center justify-center w-full">
          {isExpanded || isHovered || isMobileOpen ? (
            <img
              src="/images/logo/StudySyncLogo.png"
              alt="StudySync Logo"
              className="h-10 w-auto object-contain transition-all duration-200"
            />
          ) : (
            <img
              src="/images/logo/StudySyncLogo.png"
              alt="StudySync Mini Logo"
              className="h-8 w-8 object-contain transition-all duration-200"
            />
          )}
        </Link>
      </div>

      <div className="overflow-y-auto">
        <nav className="px-5">
          <h2 className="mb-4 text-xs text-gray-400">MENU</h2>
          {renderItems(navItems, "main")}

          {user?.role === "admin" && (
            <div className="mt-4">
              <Link
                to="/admin"
                className={`menu-item ${
                  isAdminPanelActive ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-size"><ShieldIcon /></span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">Admin Panel</span>
                )}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;