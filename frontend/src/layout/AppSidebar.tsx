import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  UserCircleIcon,
} from "../icons";

import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
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
      { name: "Statistics", path: "/stats" },
      { name: "Import / Export", path: "/data-tools" },
    ],
  },

  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },

  {
    icon: <UserCircleIcon />,
    name: "Profile",
    path: "/profile",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart" },
      { name: "Bar Chart", path: "/bar-chart" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts" },
      { name: "Buttons", path: "/buttons" },
      { name: "Images", path: "/images" },
      { name: "Videos", path: "/videos" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin" },
      { name: "Sign Up", path: "/signup" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let found = false;

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;

      items.forEach((nav, index) => {
        nav.subItems?.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu({
              type: menuType as "main" | "others",
              index,
            });
            found = true;
          }
        });
      });
    });

    if (!found) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (!openSubmenu) return;

    const key = `${openSubmenu.type}-${openSubmenu.index}`;
    const el = subMenuRefs.current[key];

    if (el) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [key]: el.scrollHeight,
      }));
    }
  }, [openSubmenu]);

  const handleToggle = (index: number, type: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev?.type === type && prev?.index === index
        ? null
        : { type, index }
    );
  };

  const renderItems = (items: NavItem[], type: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((item, index) => (
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
                    openSubmenu?.type === type &&
                    openSubmenu?.index === index
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
                  isActive(item.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-size">{item.icon}</span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{item.name}</span>
                )}
              </Link>
            )
          )}

          {/* SUBMENU */}
          {item.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${type}-${index}`] = el;
              }}
              style={{
                height:
                  openSubmenu?.type === type && openSubmenu?.index === index
                    ? subMenuHeight[`${type}-${index}`]
                    : 0,
              }}
              className="overflow-hidden transition-all duration-300"
            >
              <ul className="ml-9 mt-2 space-y-1">
                {item.subItems.map((sub) => (
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
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-white transition-all dark:bg-gray-900
      ${
        isExpanded || isMobileOpen || isHovered
          ? "w-[290px]"
          : "w-[90px]"
      }
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LOGO */}
      <div className="flex justify-center py-8">
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <img src="/images/logo/logo.svg" width={150} />
          ) : (
            <img src="/images/logo/logo-icon.svg" width={32} />
          )}
        </Link>
      </div>

      {/* MENU */}
      <div className="overflow-y-auto">
        <nav className="px-5">
          <h2 className="mb-4 text-xs text-gray-400">MENU</h2>
          {renderItems(navItems, "main")}

          <h2 className="mb-4 mt-6 text-xs text-gray-400">OTHERS</h2>
          {renderItems(othersItems, "others")}
        </nav>

        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;