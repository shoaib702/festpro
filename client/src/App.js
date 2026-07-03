import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Register from './Components/User/Register';
import Login from './Components/User/Login';
import Home from './Components/Home/Home';
import Dashboard from './Components/Dashboard/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import VendorLogin from './Components/Admin/VendorLogin';
import VendorRegister from './Components/Admin/VendorRegister';
import VendorDashboard from './Components/Admin/VendorDashboard';
import VendorProtectedRoute from './Components/VendorProtectedRoute';
import MyProfile from './Components/Dashboard/Myprofile';
import VenueDetails from './Components/Venue/VenueDetails';
import VenueBooking from './Components/Venue/VenueBooking';
import Venues from './Components/Dashboard/venues';
import Payment from './Components/Venue/VenuePayment';
import MyBookings from './Components/Venue/MyBooking';
import VenuesList from './Components/Admin/VenuesList';
import BookingsTable from './Components/Admin/BookingsTable';
import AllBookings from './Components/Admin/AllBooking';
import VenuesAll from './Components/Admin/VenuesAll';
import Report from './Components/Admin/Report';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendorlogin" element={<VendorLogin />} />
        <Route path="/vendorRegister" element={<VendorRegister />} />


        {/* Vendor Protected Route */}
        <Route element={<VendorProtectedRoute />}>
          <Route path="/vendorDashboard" element={<VendorDashboard />} />
          <Route path= "/vendorList" element={<VenuesList/>}/>
         <Route path='/booking' element={<AllBookings/>}/>
         <Route path='/allvenues' element={<VenuesAll/>}/>
         <Route path='/report' element={<Report/>}/>
        </Route>

        {/* User Protected Route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/explore" element={<Dashboard />} />
          <Route path='/my_profile' element={<MyProfile/>}/>
          <Route path="/book-venue" element={<VenueBooking/>} /> 
          <Route path="/venue/:id" element={<VenueDetails />} />
          <Route path='/venues' element={<Venues/>}/>
          <Route path='/payment' element= { <Payment/>}/>
          <Route path='/mybooking' element ={<MyBookings/>}/>

        </Route>
      </Routes>
    </Router>
    
  );
}

export default App;
