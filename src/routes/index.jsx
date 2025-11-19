import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Home screens
import Home from '../screens/home/Home';
import Dashboard from '../screens/home/Dashboard';
import Guide from '../screens/home/Guide';

// Charger screens
import AddCharger from '../screens/chargers/AddCharger';
import ConnectCharger from '../screens/chargers/ConnectCharger';
import MyChargers from '../screens/chargers/MyChargers';
import ChargerDetails from '../screens/chargers/ChargerDetails';
import ChargerSettings from '../screens/chargers/ChargerSettings';
import ChargerSettingsAdvanced from '../screens/chargers/ChargerSettingsAdvanced';

// Session screens
import ChargingLiveSession from '../screens/sessions/ChargingLiveSession';
import SessionSummary from '../screens/sessions/SessionSummary';
import ChargingHistory from '../screens/sessions/ChargingHistory';

// Pricing screens
import PricingFees from '../screens/pricing/PricingFees';
import PrePayOrder from '../screens/pricing/PrePayOrder';

// Access screens
import Availability from '../screens/access/Availability';
import AccessPermissions from '../screens/access/AccessPermissions';

// Scheduling screens
import Schedules from '../screens/scheduling/Schedules';
import CreateOrEditSchedule from '../screens/scheduling/CreateOrEditSchedule';

// Analytics screens
import EnergyAnalytics from '../screens/analytics/EnergyAnalytics';
import CO2SavingsImpact from '../screens/analytics/CO2SavingsImpact';

// Payment screens
import PaymentMethods from '../screens/payments/PaymentMethods';
import InvoicesBilling from '../screens/payments/InvoicesBilling';

// Wallet screens
import Wallet from '../screens/wallet/Wallet';

// Booking screens
import BookingsReservations from '../screens/bookings/BookingsReservations';

// Marketplace screens
import OperatorMarketplace from '../screens/marketplace/OperatorMarketplace';

// User screens
import AccessUserProfile from '../screens/users/AccessUserProfile';
import QRPoster from '../screens/users/QRPoster';

// Utility screens
import ReceiptViewer from '../screens/utilities/ReceiptViewer';
import StartByQRorID from '../screens/utilities/StartByQRorID';

// Settings screens
import Settings from '../screens/settings/Settings';
import OperatorSelection from '../screens/settings/OperatorSelection';
import SiteSelector from '../screens/settings/SiteSelector';
import AddSite from '../screens/settings/AddSite';
import AdvancedConfiguration from '../screens/settings/AdvancedConfiguration';
import DiagnosticsLogs from '../screens/settings/DiagnosticsLogs';
import FaultDetail from '../screens/settings/FaultDetail';
import ConnectorManagement from '../screens/settings/ConnectorManagement';
import FirmwareSelfTest from '../screens/settings/FirmwareSelfTest';
import NotificationsRules from '../screens/settings/NotificationsRules';
import TroubleshootingWizard from '../screens/settings/TroubleshootingWizard';
import MaintenanceReminders from '../screens/settings/MaintenanceReminders';
import AuditCommandLog from '../screens/settings/AuditCommandLog';
import SupportHelpCenter from '../screens/settings/SupportHelpCenter';
import TariffTemplatesLibrary from '../screens/settings/TariffTemplatesLibrary';
import UtilityTOUImports from '../screens/settings/UtilityTOUImports';
import ScheduleCalendars from '../screens/settings/ScheduleCalendars';
import SiteEditorAdvanced from '../screens/settings/SiteEditorAdvanced';
import MobileStationRequest from '../screens/settings/MobileStationRequest';
import DataExportCenter from '../screens/settings/DataExportCenter';
import LanguageCurrency from '../screens/settings/LanguageCurrency';
import OperatorShiftLogs from '../screens/settings/OperatorShiftLogs';
import AggregatorCPMSBridge from '../screens/settings/AggregatorCPMSBridge';

// Error screens
import NotFound from '../screens/error/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      
      {/* Charger routes */}
      <Route path="/chargers" element={<PrivateRoute><MyChargers /></PrivateRoute>} />
      <Route path="/chargers/add" element={<PrivateRoute><AddCharger /></PrivateRoute>} />
      <Route path="/chargers/connect" element={<PrivateRoute><ConnectCharger /></PrivateRoute>} />
      <Route path="/chargers/:id" element={<PrivateRoute><ChargerDetails /></PrivateRoute>} />
      <Route path="/chargers/:id/settings" element={<PrivateRoute><ChargerSettings /></PrivateRoute>} />
      <Route path="/chargers/:id/settings/advanced" element={<PrivateRoute><ChargerSettingsAdvanced /></PrivateRoute>} />
      
      {/* Session routes */}
      <Route path="/sessions" element={<PrivateRoute><ChargingHistory /></PrivateRoute>} />
      <Route path="/sessions/live" element={<PrivateRoute><ChargingLiveSession /></PrivateRoute>} />
      <Route path="/sessions/:id" element={<PrivateRoute><SessionSummary /></PrivateRoute>} />
      
      {/* Pricing routes */}
      <Route path="/pricing" element={<PrivateRoute><PricingFees /></PrivateRoute>} />
      <Route path="/prepay" element={<PrivateRoute><PrePayOrder /></PrivateRoute>} />
      
      {/* Access routes */}
      <Route path="/availability" element={<PrivateRoute><Availability /></PrivateRoute>} />
      <Route path="/access" element={<PrivateRoute><AccessPermissions /></PrivateRoute>} />
      
      {/* Scheduling routes */}
      <Route path="/schedules" element={<PrivateRoute><Schedules /></PrivateRoute>} />
      <Route path="/schedules/new" element={<PrivateRoute><CreateOrEditSchedule /></PrivateRoute>} />
      <Route path="/schedules/:id/edit" element={<PrivateRoute><CreateOrEditSchedule /></PrivateRoute>} />
      
      {/* Analytics routes */}
      <Route path="/analytics/energy" element={<PrivateRoute><EnergyAnalytics /></PrivateRoute>} />
      <Route path="/analytics/co2" element={<PrivateRoute><CO2SavingsImpact /></PrivateRoute>} />
      
      {/* Payment routes */}
      <Route path="/payments" element={<PrivateRoute><PaymentMethods /></PrivateRoute>} />
      <Route path="/invoices" element={<PrivateRoute><InvoicesBilling /></PrivateRoute>} />
      
      {/* Wallet routes */}
      <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
      
      {/* Booking routes */}
      <Route path="/bookings" element={<PrivateRoute><BookingsReservations /></PrivateRoute>} />
      
      {/* Marketplace routes */}
      <Route path="/marketplace" element={<PrivateRoute><OperatorMarketplace /></PrivateRoute>} />
      
      {/* User routes */}
      <Route path="/users/:id" element={<PrivateRoute><AccessUserProfile /></PrivateRoute>} />
      <Route path="/qr-poster" element={<PrivateRoute><QRPoster /></PrivateRoute>} />
      
      {/* Utility routes */}
      <Route path="/receipt/:id" element={<PrivateRoute><ReceiptViewer /></PrivateRoute>} />
      <Route path="/start" element={<PrivateRoute><StartByQRorID /></PrivateRoute>} />
      
      {/* Settings routes */}
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/settings/operator" element={<PrivateRoute><OperatorSelection /></PrivateRoute>} />
      <Route path="/settings/sites" element={<PrivateRoute><SiteSelector /></PrivateRoute>} />
      <Route path="/settings/sites/add" element={<PrivateRoute><AddSite /></PrivateRoute>} />
      <Route path="/settings/advanced" element={<PrivateRoute><AdvancedConfiguration /></PrivateRoute>} />
      <Route path="/settings/diagnostics" element={<PrivateRoute><DiagnosticsLogs /></PrivateRoute>} />
      <Route path="/settings/faults/:id" element={<PrivateRoute><FaultDetail /></PrivateRoute>} />
      <Route path="/settings/connectors" element={<PrivateRoute><ConnectorManagement /></PrivateRoute>} />
      <Route path="/settings/firmware" element={<PrivateRoute><FirmwareSelfTest /></PrivateRoute>} />
      <Route path="/settings/notifications" element={<PrivateRoute><NotificationsRules /></PrivateRoute>} />
      <Route path="/settings/troubleshooting" element={<PrivateRoute><TroubleshootingWizard /></PrivateRoute>} />
      <Route path="/settings/maintenance" element={<PrivateRoute><MaintenanceReminders /></PrivateRoute>} />
      <Route path="/settings/audit" element={<PrivateRoute><AuditCommandLog /></PrivateRoute>} />
      <Route path="/settings/support" element={<PrivateRoute><SupportHelpCenter /></PrivateRoute>} />
      <Route path="/settings/tariffs" element={<PrivateRoute><TariffTemplatesLibrary /></PrivateRoute>} />
      <Route path="/settings/tou-imports" element={<PrivateRoute><UtilityTOUImports /></PrivateRoute>} />
      <Route path="/settings/calendars" element={<PrivateRoute><ScheduleCalendars /></PrivateRoute>} />
      <Route path="/settings/site-editor" element={<PrivateRoute><SiteEditorAdvanced /></PrivateRoute>} />
      <Route path="/settings/mobile-stations" element={<PrivateRoute><MobileStationRequest /></PrivateRoute>} />
      <Route path="/settings/export" element={<PrivateRoute><DataExportCenter /></PrivateRoute>} />
      <Route path="/settings/language" element={<PrivateRoute><LanguageCurrency /></PrivateRoute>} />
      <Route path="/settings/shifts" element={<PrivateRoute><OperatorShiftLogs /></PrivateRoute>} />
      <Route path="/settings/aggregator" element={<PrivateRoute><AggregatorCPMSBridge /></PrivateRoute>} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

