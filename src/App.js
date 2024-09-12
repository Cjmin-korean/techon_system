import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './component/login/Login';
import Dashboard from './component/main/Dashboard';

import DashboardMain from './component/main/DashboardMain.js';

import WorkOrders from './component/main/ProductionManagement/WorkOrders';

import ProductionOrders from './component/main/ProductionOrders.js';
import ScheduleManagement from './component/main/ProductionManagement/ScheduleManagement';
import EmployeeRegistration from './component/main/EmployeeRegistration.js';
import EmployeeDashboard from './component/main/EmployeeDashboard.js';
import ComprehensiveMESDashboard from './component/main/ProductionManagement/ComprehensiveMESDashboard';

import InspectionReportForm from 'component/main/QualityControl/InspectionReportForm';
import InspectionReportList from 'component/main/QualityControl/InspectionReportList';
import DefectTrackingScreen from 'component/main/QualityControl/DefectTrackingScreen';
import QCAuditLog from 'component/main/QualityControl/QCAuditLog';
import RawMaterialsList from 'component/main/InventoryManagement/RawMaterialsList';
import WarehousingManagement from 'component/main/InventoryManagement/WarehousingManagement';
import InventoryAlerts from 'component/main/InventoryManagement/InventoryAlerts';
import SupplierManagement from 'component/main/InventoryManagement/SupplierManagement';
import InventoryMovementRecords from 'component/main/InventoryManagement/InventoryMovementRecords';
import InventoryCount from 'component/main/InventoryManagement/InventoryCount';
import BOMManagement from 'component/main/Bom/BOMManagement';
import ProductBOMMapping from 'component/main/Bom/ProductBOMMapping';
import OEEDashboard from 'component/main/Monitoring/OEEDashboard';
import DowntimeAnalysisDashboard from 'component/main/Monitoring/DowntimeAnalysisDashboard';
import EfficiencyReportDashboard from 'component/main/Monitoring/EfficiencyReportDashboard';
import ProductionReport from 'component/main/Report/ProductionReport';
import QualityReport from 'component/main/Report/QualityReport';
import ScheduledMaintenance from 'component/main/Maintenance/ScheduledMaintenance';
import MaintenanceLogScreen from 'component/main/Maintenance/MaintenanceLogScreen';
import EquipmentInformation from 'component/main/Info/EquipmentInformation';
import MaterialInformation from 'component/main/Info/MaterialInformation';
import ProductInformation from 'component/main/Info/ProductInformation';
import SupplierInformation from 'component/main/Info/SupplierInformation';
import CustomerInformation from 'component/main/Info/CustomerInformation';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>        
          <Route index element={<DashboardMain />} />
          <Route path="production/orders" element={<ProductionOrders />} />
          <Route path="production/schedule" element={<ScheduleManagement />} />

          {/* 기초정보 */}
          <Route path="equipment-assets" element={<EquipmentInformation />} />
          <Route path="product-materials" element={<ProductInformation />} />
          <Route path="product-item" element={<MaterialInformation />} />
          <Route path="supplier-info" element={<SupplierInformation />} />
          <Route path="customer-info" element={<CustomerInformation />} />
          <Route path="production-line-info" element={<ProductInformation />} />


          {/* 생산관리 */}
          <Route path="work-instructions" element={<WorkOrders />} /> 
          <Route path="work-calendar" element={<ScheduleManagement />} />
          <Route path="work-production" element={<ComprehensiveMESDashboard />} />

          {/* 품질관리 */}
          <Route path="quality-report" element={<InspectionReportForm />} />
          <Route path="quality-report-list" element={<InspectionReportList />} />
          <Route path="quality-defect-tracking" element={<DefectTrackingScreen/>} />
          <Route path="quality-qc-audit-log" element={<QCAuditLog/>} />

          {/* 재고관리 */}
          <Route path="inventory/raw-materials" element={<RawMaterialsList />} />
          <Route path="inventory/raw-materials-inbound" element={<WarehousingManagement />} />
          <Route path="inventory/raw-materials-alerts" element={<InventoryAlerts />} />
          <Route path="inventory/supplier-management" element={<SupplierManagement />} />
          <Route path="inventory/raw-materials-movement" element={<InventoryMovementRecords />} />
          <Route path="inventory/stock-count" element={<InventoryCount />} />
          
          {/* BOM관리 */}
          <Route path="bom-managment" element={<BOMManagement />} />
          <Route path="bom-mapping" element={<ProductBOMMapping />} />
          
          {/* 설비모니터링 */}
          <Route path="monitor-oee" element={<OEEDashboard />} />
          <Route path="monitor-downtime" element={<DowntimeAnalysisDashboard />} />
          <Route path="monitor-reports" element={<EfficiencyReportDashboard />} />

          {/* 유지보수 */}
          <Route path="maintenance-scheduled" element={<ScheduledMaintenance />} />
          <Route path="maintenance-logs" element={<MaintenanceLogScreen />} />
          
          {/* 보고서 */}
          <Route path="report-work" element={<ProductionReport />} />
          <Route path="report-quality" element={<QualityReport />} />

          
          
          

          {/* 직원관리 */}
          <Route path="employee/list" element={<EmployeeDashboard />} />
          
        </Route>
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
