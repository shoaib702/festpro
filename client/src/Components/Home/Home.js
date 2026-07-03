import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Home.css';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize carousel
  useEffect(() => {
    if (window.bootstrap && carouselRef.current) {
      const carousel = new window.bootstrap.Carousel(carouselRef.current, {
        interval: 3000,
        ride: 'carousel',
        wrap: true,
      });
      return () => carousel.dispose();
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

 
  const carouselItems = [
    {
      id: 1,
      image: `${process.env.PUBLIC_URL}/images/slider11.jpg`,
      alt: "Wedding Event Management",
      title: "Event Management",
      subtitle: "Exclusive Event Company"
    },
    {
      id: 2,
      image: `${process.env.PUBLIC_URL}/images/slider22.jpg`,
      alt: "Corporate Event Planning",
      title: "Exquisite Event Experiences",
      subtitle: "Tailored to Your Vision"
    },
    {
      id: 3,
      image: `${process.env.PUBLIC_URL}/images/slider33.jpg`,
      alt: "Social Event Organization",
      title: "Creating Unforgettable Memories",
      subtitle: "With Precision and Passion"
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleExploreClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate('/login');
      alert('Please login to explore our services');
    }
  };

  return (
    <div className="home-page">
    
      <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${scrolled ? 'navbar-scrolled' : 'navbar-transparent'}`}>
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">Event<span style={{ color: '#6c63ff', fontWeight: 'bold' }}>Ease</span></Link>
    
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/">Home</Link>
              </li>
              
              
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  id="userDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i> User
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  {isLoggedIn ? (
                    <>
                      <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                      <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item" onClick={handleLogout}>
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li><Link className="dropdown-item" to="/login">Login</Link></li>
                      <li><Link className="dropdown-item" to="/register">Register</Link></li>
                    </>
                  )}
                </ul>
              </li>
              
              
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  id="vendorDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-briefcase me-1"></i> Vendor
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="vendorDropdown">
                  <li><Link className="dropdown-item" to="/vendorlogin">Vendor Login</Link></li>
                  <li><Link className="dropdown-item" to="/vendorRegister">Vendor Register</Link></li>
                  {isLoggedIn && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li><Link className="dropdown-item" to="/admin">Admin Panel</Link></li>
                    </>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

    
      <header className="carousel slide" id="mainCarousel" ref={carouselRef} data-bs-ride="carousel">
        <div className="carousel-inner">
          {carouselItems.map((item, index) => (
            <div 
              key={item.id}
              className={`carousel-item ${index === 0 ? 'active' : ''}`}
            >
              <div className="zoom-effect">
                <img
                  src={item.image}
                  className="d-block w-100"
                  alt={item.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              <div className="carousel-caption d-none d-md-block">
                <h1 className="display-4 fw-bold mb-3">{item.title}</h1>
                <p className="lead mb-4">{item.subtitle}</p>
                <Link 
                  className="btn btn-primary btn-lg px-4 py-2" 
                  to="/explore" onClick={handleExploreClick}
                >
                  Explore
                </Link>
              </div>
            </div>
          ))}
        </div>

       
        <button 
          className="carousel-control-prev" 
          type="button" 
          data-bs-target="#mainCarousel" 
          data-bs-slide="prev"
          aria-label="Previous slide"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button 
          className="carousel-control-next" 
          type="button" 
          data-bs-target="#mainCarousel" 
          data-bs-slide="next"
          aria-label="Next slide"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </header>
    </div>
  );
};

export default Home;