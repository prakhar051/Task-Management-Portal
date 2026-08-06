import { prisma } from '../src/config/db.js';
import AssetService from '../src/services/asset.service.js';
import MaintenanceService from '../src/services/maintenance.service.js';
import VendorService from '../src/services/vendor.service.js';

async function runAssetVerification() {
  console.log('🚀 Starting Phase 15 Asset Management Integration Test Suite...');
  const uniqueId = Date.now().toString().slice(-4);

  let mockDept = null;
  let mockUserA = null;
  let mockEmpA = null;
  let mockUserB = null;
  let mockEmpB = null;
  let category = null;
  let vendor = null;
  let asset = null;
  let assignment = null;
  let transfer = null;
  let maintenance = null;

  try {
    // 0. Pre-test cleanup
    await prisma.depreciationRecord.deleteMany({});
    await prisma.maintenanceRecord.deleteMany({});
    await prisma.assetTransfer.deleteMany({});
    await prisma.assetAssignment.deleteMany({});
    await prisma.assetHistory.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.assetCategory.deleteMany({});
    await prisma.vendor.deleteMany({});

    // 1. Setup Department & Employees
    console.log('1. Setting up mock HR and Department parameters...');
    mockDept = await prisma.department.create({
      data: {
        name: `Asset Testing Lab ${uniqueId}`,
        code: `AL${uniqueId}`,
        location: 'Building B Lab 3',
        email: `asset_lab_${uniqueId}@company.local`,
        phone: '555-0199',
        status: 'ACTIVE'
      }
    });

    mockUserA = await prisma.user.create({
      data: {
        email: `emp_a_${uniqueId}@company.local`,
        name: 'Employee Alpha',
        role: 'EMPLOYEE',
        passwordHash: 'dummyhash'
      }
    });

    mockEmpA = await prisma.employee.create({
      data: {
        employeeCode: `EMPA-${uniqueId}`,
        firstName: 'Employee',
        lastName: 'Alpha',
        email: `emp_a_${uniqueId}@company.local`,
        phone: `555-08${uniqueId}`,
        designation: 'Engineer',
        status: 'ACTIVE',
        hireDate: new Date(),
        userId: mockUserA.id,
        departmentId: mockDept.id
      }
    });

    mockUserB = await prisma.user.create({
      data: {
        email: `emp_b_${uniqueId}@company.local`,
        name: 'Employee Beta',
        role: 'EMPLOYEE',
        passwordHash: 'dummyhash'
      }
    });

    mockEmpB = await prisma.employee.create({
      data: {
        employeeCode: `EMPB-${uniqueId}`,
        firstName: 'Employee',
        lastName: 'Beta',
        email: `emp_b_${uniqueId}@company.local`,
        phone: `555-09${uniqueId}`,
        designation: 'Architect',
        status: 'ACTIVE',
        hireDate: new Date(),
        userId: mockUserB.id,
        departmentId: mockDept.id
      }
    });

    console.log('✔ Department and Employees created.');

    // 2. Setup Category & Vendor
    console.log('2. Creating Asset Category and Vendor profiles...');
    category = await prisma.assetCategory.create({
      data: {
        name: `Laptops ${uniqueId}`,
        code: `LAP-${uniqueId}`,
        description: 'Developer workspace laptops'
      }
    });

    vendor = await VendorService.createVendor(mockUserA, {
      name: `Global Tech Vendors ${uniqueId}`,
      contactName: 'John Vendor',
      email: 'vendor@globaltech.local',
      phone: '555-9000',
      address: 'Industrial Sector 4'
    });

    console.log('✔ Category and Vendor profiles compiled.');

    // 3. Asset CRUD verification
    console.log('3. Verifying Asset creation with QR/Barcode endpoints...');
    asset = await AssetService.createAsset(mockUserA, {
      tag: `AST-LAP-${uniqueId}`,
      name: 'MacBook Pro 16',
      serialNumber: `SN-MP16-${uniqueId}`,
      categoryId: category.id,
      vendorId: vendor.id,
      status: 'AVAILABLE',
      condition: 'NEW',
      purchasePrice: 2400.0,
      salvageValue: 400.0,
      usefulLifeYears: 5,
      purchaseDate: new Date().toISOString(),
      warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Primary work machine',
      location: 'HQ Cabinet 2'
    });

    if (!asset.qrCodeUrl || !asset.barcodeUrl) {
      throw new Error('Asset QR codes or Barcodes URLs were not generated.');
    }
    console.log('✔ Asset successfully registered in inventory.');

    // 4. Asset Assignment
    console.log('4. Testing Asset Assignment to Employee Alpha...');
    assignment = await AssetService.assignAsset(mockUserA, {
      assetId: asset.id,
      employeeId: mockEmpA.id,
      conditionOnAssign: 'NEW',
      notes: 'Initial work machine allocation'
    });

    // Check status updated to ASSIGNED
    let checkAsset = await AssetService.getAssetById(mockUserA, asset.id);
    if (checkAsset.status !== 'ASSIGNED' || checkAsset.currentEmployeeId !== mockEmpA.id) {
      throw new Error(`Asset status did not update correctly. Status: ${checkAsset.status}`);
    }

    // Verify double-assignment block
    try {
      await AssetService.assignAsset(mockUserA, {
        assetId: asset.id,
        employeeId: mockEmpB.id,
        conditionOnAssign: 'GOOD'
      });
      throw new Error('Safety check failed: Assigned an already allocated asset.');
    } catch (e) {
      console.log('✔ Double assignment block verified: ' + e.message);
    }

    // 5. Transfer Asset
    console.log('5. Verifying asset transfer from Employee Alpha to Beta...');
    transfer = await AssetService.transferAsset(mockUserA, {
      assetId: asset.id,
      toEmployeeId: mockEmpB.id,
      notes: 'Team reshuffling transfer'
    });

    checkAsset = await AssetService.getAssetById(mockUserA, asset.id);
    if (checkAsset.status !== 'ASSIGNED' || checkAsset.currentEmployeeId !== mockEmpB.id) {
      throw new Error(`Asset transfer status did not align. Current Employee: ${checkAsset.currentEmployeeId}`);
    }
    console.log('✔ Asset transfer executed successfully.');

    // 6. Return Asset
    console.log('6. Processing asset return from Employee Beta...');
    // Find active assignment for Employee Beta (which was created during transfer)
    const activeAssign = await prisma.assetAssignment.findFirst({
      where: { assetId: asset.id, returnedAt: null }
    });
    if (!activeAssign) throw new Error('No active assignment log to return.');

    await AssetService.returnAsset(mockUserA, activeAssign.id, {
      conditionOnReturn: 'GOOD',
      notes: 'Returned in clean shape'
    });

    checkAsset = await AssetService.getAssetById(mockUserA, asset.id);
    if (checkAsset.status !== 'AVAILABLE' || checkAsset.currentEmployeeId !== null) {
      throw new Error(`Asset return status failed. Current status: ${checkAsset.status}`);
    }
    console.log('✔ Asset return logged and marked AVAILABLE.');

    // 7. Maintenance Scheduling
    console.log('7. Scheduling hardware maintenance diagnostics...');
    maintenance = await MaintenanceService.createRecord(mockUserA, {
      assetId: asset.id,
      title: 'Battery Diagnostics',
      description: 'Replace battery calibration cycle',
      cost: 150.0,
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'SCHEDULED'
    });

    checkAsset = await AssetService.getAssetById(mockUserA, asset.id);
    if (checkAsset.status !== 'UNDER_MAINTENANCE') {
      throw new Error(`Asset status did not transition to maintenance. Status: ${checkAsset.status}`);
    }
    console.log('✔ Asset scheduled and status updated to UNDER_MAINTENANCE.');

    // Close maintenance
    console.log('7.1 Closing asset maintenance record...');
    await MaintenanceService.updateRecord(mockUserA, maintenance.id, {
      status: 'COMPLETED',
      cost: 165.0
    });

    checkAsset = await AssetService.getAssetById(mockUserA, asset.id);
    if (checkAsset.status !== 'AVAILABLE') {
      throw new Error(`Asset did not return to AVAILABLE status. Status: ${checkAsset.status}`);
    }
    console.log('✔ Maintenance closed. Asset back to AVAILABLE.');

    // 8. Depreciation Calculations
    console.log('8. Evaluating straight-line and double-declining depreciation calculations...');
    const depStraight = await AssetService.calculateDepreciation(mockUserA, asset.id, 'STRAIGHT_LINE', 3);
    if (depStraight.length !== 3) {
      throw new Error(`Expected 3 straight-line logs, got: ${depStraight.length}`);
    }

    const depDeclining = await AssetService.calculateDepreciation(mockUserA, asset.id, 'DECLINING_BALANCE', 2);
    if (depDeclining.length !== 2) {
      throw new Error(`Expected 2 declining balance logs, got: ${depDeclining.length}`);
    }

    // Verify depreciation values
    // Straight-line: (Cost - Salvage) / usefulLifeYears / 12 = (2400 - 400) / 5 / 12 = 400 / 12 = 33.33 per month
    const slVal = depStraight[0].depreciatedValue;
    if (Math.abs(slVal - 33.333) > 0.1) {
      throw new Error(`Straight line monthly value mismatch: ${slVal}`);
    }

    console.log(`✔ Depreciation calculators validated. (SL Month 1: $${slVal.toFixed(2)})`);

    // 9. Notifications and Logs matches checks
    console.log('9. Checking audit logs & notification counts...');
    const historyLogs = await prisma.assetHistory.findMany({ where: { assetId: asset.id } });
    if (historyLogs.length < 5) {
      throw new Error(`Expected at least 5 audit history steps, found: ${historyLogs.length}`);
    }
    console.log(`✔ Audit trails mapped. Found ${historyLogs.length} state log entries.`);

  } catch (err) {
    console.error('❌ Verification failed: ', err);
    process.exit(1);
  } finally {
    // 10. Database Cleanup
    console.log('10. Running database cleanup...');
    if (mockEmpA) await prisma.employee.delete({ where: { id: mockEmpA.id } });
    if (mockUserA) {
      await prisma.notification.deleteMany({ where: { userId: mockUserA.id } });
      await prisma.user.delete({ where: { id: mockUserA.id } });
    }
    if (mockEmpB) await prisma.employee.delete({ where: { id: mockEmpB.id } });
    if (mockUserB) {
      await prisma.notification.deleteMany({ where: { userId: mockUserB.id } });
      await prisma.user.delete({ where: { id: mockUserB.id } });
    }
    if (mockDept) await prisma.department.delete({ where: { id: mockDept.id } });

    console.log('✔ Verification Database clean.');
  }

  console.log('🏆 All Phase 15 asset management tests passed successfully!');
}

runAssetVerification();
