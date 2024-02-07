import React, { useState, useEffect } from 'react';
import './SidePanal.css'
import {Link} from 'react-router-dom'
function SidePanal() {

      const [user, setUser] = useState({ position: 0 });
      const [SidepanelClass, setSidepanelClass] = useState("sidenavShort");
      const [Sidepanal_hover_state_apply, setSidepanal_hover_state_apply] = useState(true);
      const locals = { managerVisiting: false };
      const [activeTab, setActiveTab] = useState("home");
    //   useEffect(() => {
    //     const current = window.location.pathname;
    //     const links = document.querySelectorAll(".navbar-body a");
    //     links.forEach(link => {
    //       if (link.getAttribute("href").indexOf(current) !== -1) {
    //         link.classList.add("navbar-active");
    //       }
    //     });
    //   }, []);
    
      useEffect(() => {
        ChangeVisbilitySidePanal();
      }, [Sidepanal_hover_state_apply]);
    
      function ChangeDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    
      function ChangeSidePanalHoverState() {
        setSidepanal_hover_state_apply(!Sidepanal_hover_state_apply);
      }
    
      function ChangeVisbilitySidePanal() {
        const sidepanel = document.getElementById('sidenav-main');
        const sidepanal_toggle = document.getElementById('sidenav-toggle');
    
        if (!sidepanel) return;
    
        if (Sidepanal_hover_state_apply) {
          sidepanel.style.width = "300px";
          sidepanal_toggle.innerHTML = `<img src="../SIde bar Icons/sidebar_back.svg" >`;
        } else {
          sidepanel.style.width = "95px";
          sidepanal_toggle.innerHTML = `<img src="../SIde bar Icons/sidebar_front.svg" >`;
        }
    
        const elements = document.querySelectorAll('.changeview');
        elements.forEach(element => {
          element.style.display = Sidepanal_hover_state_apply ? "none" : "flex";
        });
    
        const navbarBoxes = document.querySelectorAll('.navbar-box');
        navbarBoxes.forEach(element => {
          element.style.padding = Sidepanal_hover_state_apply ? "12px" : "12px 16px";
          element.style.justifyContent = "flex-start";
          element.style.width = Sidepanal_hover_state_apply ? 'fit-content' : '252px';
        });
    
        const mainPageContent = document.getElementById('MainPageContent');
        if (mainPageContent) {
          mainPageContent.style.marginLeft = Sidepanal_hover_state_apply ? "95px" : "300px";
          mainPageContent.style.width = `calc(100% - ${Sidepanal_hover_state_apply ? '95px' : '300px'})`;
        }
    
        const streakbox = document.getElementById('streakHeaderStreak');
        if (streakbox) {
          streakbox.style.display = Sidepanal_hover_state_apply ? "flex" : "none";
        }
      }
    
      function ShowSidePanalOnHover() {
      
        if (Sidepanal_hover_state_apply) {
          ChangeVisbilitySidePanal();
        }
      }
    
      function HideSidePanalOnHover() {
        if (Sidepanal_hover_state_apply) {
          ChangeVisbilitySidePanal();
        }
      }
    
      useEffect(() => {
        ChangeVisbilitySidePanal();
      }, []);
    
      const formattedDate = ChangeDate();
      const managementUrl = `/performanceBoard/?date=${formattedDate}`;
      const performanceUrl = `/performanceBoardemployee/${formattedDate}`;
    
  return (
        <div
          id="sidenav-main"
          style={{
            width: '300px',
            padding: '36px 24px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            margin: '0px',
            height: '100%',
            position: 'fixed',
            top: '0px',
            left: '0px',
            transition: '.5s ease',
            zIndex: 99,
            flexShrink: 0,
            background: 'var(--Black, #000)',
          }}
         
          onMouseOver={ShowSidePanalOnHover}
          onMouseOut={HideSidePanalOnHover}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' }}>
              <a style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img src="../SIde bar Icons/Traintity_logo.png" style={{ width: '56px', borderRadius: '3.684px', height: '56px' }} />
                <div className="changeview" style={{ color: 'var(--White, #FFF)', fontSize: '25.313px', fontStyle: 'normal', fontWeight: 800, lineHeight: 'normal' }}>
                  trainity
                </div>
              </a>
              <div className="changeview SidePanalBox" id="sidenav-toggle" onClick={ChangeSidePanalHoverState} style={{ padding: '8px' }}>
                <img src="../SIde bar Icons/sidebar_front.svg" />
              </div>
            </div>
    
            <div className="navbar-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', width: '100%', alignSelf: 'stretch' }}>
              <Link href="/dashboard" id="getHome" className="navbar-box SidePanalBox">
                <img src="../SIde bar Icons/home.svg" />
                <div className="text-navbar changeview">Home</div>
              </Link>
              <Link href={performanceUrl} id="getPerformance" className="navbar-box SidePanalBox">
                <img src="../SIde bar Icons/Performance.svg" />
                <div className="text-navbar changeview">Performance</div>
              </Link>
    
              {user?.position === 0 && (
                <Link href={managementUrl} id="getManagement" className="navbar-box SidePanalBox">
                  <img src="../SIde bar Icons/Management.svg"/>
                  <div className="text-navbar changeview">Management</div>
                </Link>
              )}
    
              {user?.position === 0 && (
                <>
                  <Link href="/project" id="getManagement" className="navbar-box SidePanalBox">
                    <img src="../SIde bar Icons/Project.svg"/>
                    <div className="text-navbar changeview">Projects & Tasks</div>
                  </Link>
    
                  <Link href="/leavesAccountabilityManager" id="getrewards" className="navbar-box SidePanalBox">
                    <img src="../SIde bar Icons/Leaves Management.svg"/>
                    <div className="text-navbar changeview">Leaves Management</div>
                  </Link>
                </>
              )}
    
              {locals.managerVisiting ?
                <>
                  <Link href={`/salaryManager/?id=${user._id}`} id="getrewards" className="navbar-box SidePanalBox">
                    <img src="../SIde bar Icons/Salary withdrawal.svg"/>
                    <div className="text-navbar changeview">Salary Withdrawal</div>
                  </Link>
                  <Link href={`/rewards/${user._id}?manager=True`} id="getrewards" className="navbar-box SidePanalBox">
                  <img src="../SIde bar Icons/Rewards.svg"/>
        <div class="text-navbar changeview">Rewards</div>
                    </Link>
                  </>
                :
                  <>
                    <a href={`/salary/?id=${user._id}`} id="getrewards" className="navbar-box SidePanalBox">
                      <img src="../SIde bar Icons/Salary withdrawal.svg"/>
                      <div className="text-navbar changeview">Salary Withdrawal</div>
                    </a>
                    <a href={`/rewards/${user._id}`} id="getrewards" className="navbar-box SidePanalBox">
                    <img src="../SIde bar Icons/Rewards.svg"/>
        <div class="text-navbar changeview">Rewards</div>
                    </a>
                    </>
              }
    
              <Link href="/leavesAccountability/<%=user._id%>" id="getrewards" className="navbar-box SidePanalBox">
                <img src="../SIde bar Icons/My Leaves.svg" />
                <div className="text-navbar changeview">My Leaves</div>
              </Link>
    
              {/* <!-- <a href="/achievementWall/<%=user._id%>" id="getrewards" className="navbar-box SidePanalBox" data-toggle="tooltip"
                            data-placement="right" title="Achievement Wall">
                            <img src="../SIde bar Icons/Achievements wall.svg">
                            <div className="text-navbar changeview">Achievement Wall</div>
                          </a> --> */}
    
            </div>
          </div>
    
          <div className="sidenav-footer" style={{ width: '100%' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="268" height="1" viewBox="0 0 268 1" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M268 1H0V0H268V1Z" fill="#475467" />
            </svg>
            <Link href={performanceUrl} style={{ display: 'flex', padding: '4px 8px', alignItems: 'flex-start', gap: '15px', alignSelf: 'stretch' }} className="SidePanalBox">
              <img src={user.image} style={{ display: 'flex', width: '52px', height: '52px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '200px' }} className="SidePanalImage" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} className="changeview">
                <div className="text-navbar">
                  {user.displayName}
                </div>
                <div className="text-navbar" style={{ fontSize: '14px', fontWeight: 400 }}>
                  {user.team}
                </div>
              </div>
            </Link>
          </div>
        </div>
      );
    };
    
    export default SidePanal;