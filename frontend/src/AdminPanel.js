import React, { useState } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { Navbar, Nav, NavItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import './AdminPanel.css'; // Import the CSS file

const AdminPanel = ({ setAuthToken, user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true); // Set initial state to true to open the sidebar by default
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    setAuthToken(null);
    navigate('/login');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const getUserInitial = () => {
    return user && user.name ? user.name.charAt(0).toUpperCase() : '';
  };

  return (
    <div className="d-flex" id="wrapper">
      <div className={`bg-light border-right ${isOpen ? 'toggled' : ''}`} id="sidebar-wrapper">
        <div className="sidebar-heading">Admin Panel</div>
        <div className="list-group list-group-flush">
          <Link to="/dashboard" className="list-group-item list-group-item-action bg-light">Dashboard</Link>
          <div className="list-group-item list-group-item-action bg-light">
            Projects
            <div className="list-group list-group-flush">
              <Link to="/projects/all" className="list-group-item list-group-item-action bg-light">All Projects</Link>
              <Link to="/projects/create" className="list-group-item list-group-item-action bg-light">Create Project</Link>
            </div>
          </div>
          <Link to="/forms" className="list-group-item list-group-item-action bg-light">Forms</Link>
          <Link to="/submissions" className="list-group-item list-group-item-action bg-light">Submissions</Link>
        </div>
      </div>
      <div id="page-content-wrapper">
        <Navbar color="light" light className="border-bottom">
          <i className="fas fa-bars" onClick={toggleSidebar} style={{ cursor: 'pointer', fontSize: '1.5rem' }}></i>
          <Nav className="ms-auto" navbar>
            <NavItem>
              <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle caret className="user-avatar">
                  {getUserInitial()}
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem onClick={handleViewProfile}>View Profile</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavItem>
          </Nav>
        </Navbar>
        <div className="container-fluid">
          {/* <h2>Admin Panel</h2> */}
          <Outlet /> {/* This will render the nested routes */}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;