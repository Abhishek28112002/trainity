import React, { useState, useEffect } from "react";
// import "./SidePanel.css"; // Import CSS file for styling

const Layout = () => {
  // write some dummy data
  const user = {
    _id: "12345", // Example user ID
    displayName: "John Doe",
    team: "Engineering",
    position: 1, // Manager role (modify for other roles)
    image: "images/user_avatar.png", // Placeholder image path
  };
  const location = {
    country: "United States",
    city: "San Francisco",
    state: "California",
    address: "123 Main Street", // Optional for more detail
  };
  const today = new Date();
  // const formattedDate = moment(today).format('YYYY-MM-DD');

  const managementUrl = `/performanceBoard/?date=${"formattedDate"}`; // Example URL using moment.js
  const performanceUrl = `/performanceBoardemployee/${
    user._id
  }/${"formattedDate"}`; // Example URL using user ID and date

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    document.querySelectorAll(".SidePanalBox").forEach((link) => {
      if (link.href?.indexOf(currentPath) !== -1) {
        link.classList.add("navbar-active");
      }
    });
  }, [location]);

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
    if (!isSidePanelOpen) {
      document.getElementById("MainPageContent").style.marginLeft = "300px";
      document.getElementById("MainPageContent").style.width =
        "calc(100% - 300px)";
      const windowWidth = window.innerWidth;
      const streakbox = document.getElementById("streakHeaderStreak");
      if (streakbox || windowWidth < 1000) {
        streakbox.style.display = "none";
      }
    } else {
      document.getElementById("MainPageContent").style.marginLeft = "0px";
      document.getElementById("MainPageContent").style.width = "100%";
      const streakbox = document.getElementById("streakHeaderStreak");
      if (streakbox) {
        streakbox.style.display = "flex";
      }
    }
  };

  const handleHover = () => {
    if (!isSidePanelOpen && !isHovering) {
      setIsHovering(true);
      document.getElementById("sidenav-main").style.width = "300px";
      document.getElementById("MainPageContent").style.marginLeft = "300px";
      document.getElementById("MainPageContent").style.width =
        "calc(100% - 300px)";
    }
  };

  const handleMouseLeave = () => {
    if (!isSidePanelOpen && isHovering) {
      setIsHovering(false);
      document.getElementById("sidenav-main").style.width = "95px";
      document.getElementById("MainPageContent").style.marginLeft = "95px";
      document.getElementById("MainPageContent").style.width =
        "calc(100% - 95px)";
    }
  };

  const reloadPage = () => {
    location.reload();
  };

  useEffect(() => {
    // Set a timer to reload the page after 5 minutes in a controlled way
    const reloadTimer = setTimeout(reloadPage, 600000);

    // Clear the timer when the component unmounts to prevent memory leaks
    return () => clearTimeout(reloadTimer);
  }, []);

  const renderMenuItems = () => {
    const menuItems = [
      // Add dynamic menu items based on user roles and conditional rendering
      {
        text: "Home",
        icon: "home.svg",
        href: "/dashboard",
        isActive: location.pathname === "/dashboard",
      },
      {
        text: "Performance",
        icon: "Performance.svg",
        href: performanceUrl,
        isActive: location.pathname === "/dashboard",
      },
      // ... More menu items
    ];

    return menuItems.map((item, index) => (
      <a
        key={index}
        href={item.href}
        className={`navbar-box SidePanalBox ${
          item.isActive ? "navbar-active" : ""
        }`}
      >
        <img src={`../SIde bar Icons/${item.icon}`} alt={item.text} />
        <div className="text-navbar">{item.text}</div>
      </a>
    ));
  };

  return (
    <div
      id="sidenav-main"
      style={{
        width: isSidePanelOpen ? "300px" : "95px",
        transition: "0.5s ease",
      }}
      onMouseEnter={handleHover}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          width: "100%",
        }}
      >
        {/* Sidenav header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            alignSelf: "stretch",
          }}
        >
          <a
            style={{ display: "flex", gap: "12px", alignItems: "center" }}
            href="../"
          >
            <img
              src="../SIde bar Icons/Traintity_logo.png"
              alt="Traintity logo"
            />
            <div
              style={{ color: "#FFF", fontSize: "25.313px", fontWeight: "800" }}
              className="changeview"
            >
              {/* Dynamically display user name here */}
              {user.displayName}
            </div>
          </a>
          <div
            style={{ padding: "8px" }}
            className="changeview SidePanalBox"
            id="sidenav-toggle"
            onClick={toggleSidePanel}
          >
            <img
              src="../SIde bar Icons/sidebar_front.svg"
              alt="Toggle side panel"
            />
          </div>
        </div>

        {/* Application nav */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "12px",
            width: "100%",
            alignSelf: "stretch",
          }}
          className="navbar-body"
        >
          {renderMenuItems()}
        </div>
      </div>
      <div className="sidenav-footer">{/* ... */}</div>
    </div>
  );
};

export default Layout;
