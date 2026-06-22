import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar }           from './components/Navbar';
import { Dashboard }        from './pages/Dashboard';
import { Components }       from './pages/Components';
import { PriceHistory }     from './pages/PriceHistory';
import { Bicycles }         from './pages/Bicycles';
import { BicycleBuilder }   from './pages/BicycleBuilder';
import { PricingBreakdown } from './pages/PricingBreakdown';
import { NotFound }         from './pages/NotFound';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                              element={<Dashboard />} />
        <Route path="/components"                    element={<Components />} />
        <Route path="/components/:id/prices"         element={<PriceHistory />} />
        <Route path="/bicycles"                      element={<Bicycles />} />
        <Route path="/bicycles/new"                  element={<Bicycles />} />
        <Route path="/bicycles/:id/build"            element={<BicycleBuilder />} />
        <Route path="/bicycles/:id/pricing"          element={<PricingBreakdown />} />
        <Route path="*"                              element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
