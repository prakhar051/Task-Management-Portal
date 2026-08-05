import { prisma } from '../src/config/db.js';
import DocumentService from '../src/services/document.service.js';
import LocalStorageProvider from '../src/providers/storage/local.provider.js';

async function runVerification() {
  console.log('🧪 Starting Phase 12 Document & File Management backend verification checks...');

  try {
    // 1. Setup mock records
    console.log('1. Setting up temporary verification records...');

    const mockDept = await prisma.department.create({
      data: {
        name: 'Docs QA Lab',
        code: 'DCQA',
        location: 'Building C Room 2',
        email: 'docs@test.local',
        phone: '333-444'
      }
    });

    const mockUser = await prisma.user.create({
      data: {
        email: `docs_admin_${Date.now()}@test.local`,
        name: 'Docs Admin Tester',
        role: 'ADMIN',
        passwordHash: 'dummy'
      }
    });

    const mockEmp = await prisma.employee.create({
      data: {
        employeeCode: `QA-D-${Date.now().toString().slice(-3)}`,
        firstName: 'Docs',
        lastName: 'QA',
        email: `docs_qa_${Date.now()}@test.local`,
        phone: '999-999',
        designation: 'Docs Tester',
        status: 'ACTIVE',
        hireDate: new Date(),
        userId: mockUser.id,
        departmentId: mockDept.id
      }
    });

    console.log('   Verification environment prepared successfully!');

    // 2. Test File Upload
    console.log('2. Testing Document Upload...');
    const dummyFile1 = {
      originalname: 'qa_spec.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Spec sheet content')
    };

    const doc1 = await DocumentService.uploadDocument(mockUser, dummyFile1, {
      name: 'QA Specification Sheet',
      category: 'PDF',
      entityType: 'GENERAL'
    });

    console.log(`   Document uploaded successfully! ID: ${doc1.id} | Name: "${doc1.name}"`);

    // 3. Test Checksum validation
    console.log('3. Validating Checksum generation...');
    const latestVersion1 = doc1.versions[0];
    console.log(`   Checksum generated: "${latestVersion1.checksum}"`);
    if (!latestVersion1.checksum) {
      throw new Error('File checksum hash was not computed.');
    }

    // 4. Test upload new version revision
    console.log('4. Testing Uploading New Revision...');
    const dummyFile2 = {
      originalname: 'qa_spec_v2.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Revision 2 spec content')
    };

    const doc2 = await DocumentService.uploadNewRevision(mockUser, doc1.id, dummyFile2);
    console.log(`   Revision uploaded successfully! Total versions: ${doc2.versions.length}`);
    if (doc2.versions.length !== 2) {
      throw new Error('New version creation failed.');
    }

    // 5. Test Download / Preview
    console.log('5. Testing Document Download & Preview streams...');
    const downloadRes = await DocumentService.downloadDocument(mockUser, doc1.id);
    console.log(`   Download stream ready: ${!!downloadRes.stream} | File: "${downloadRes.originalFilename}"`);
    if (!downloadRes.stream) {
      throw new Error('Failed to resolve download stream.');
    }

    // 6. Test Archive / Restore
    console.log('6. Testing Archive & Restore workflows...');
    const archivedDoc = await DocumentService.archiveDocument(mockUser, doc1.id);
    console.log(`   Archived successfully! Status: ${archivedDoc.status}`);
    if (archivedDoc.status !== 'ARCHIVED') {
      throw new Error('Document archiving failed.');
    }

    const restoredDoc = await DocumentService.restoreDocument(mockUser, doc1.id);
    console.log(`   Restored successfully! Status: ${restoredDoc.status}`);
    if (restoredDoc.status !== 'ACTIVE') {
      throw new Error('Document restoration failed.');
    }

    // 7. Test Bulk ZIP export
    console.log('7. Testing ZIP Archive compiling...');
    const zipStream = await DocumentService.bulkDownloadZip(mockUser, [doc1.id]);
    console.log(`   ZIP compile stream initialized: ${!!zipStream}`);
    if (!zipStream) {
      throw new Error('ZIP stream compiler failed.');
    }

    // 8. Test Soft Delete
    console.log('8. Testing Soft-Delete...');
    const deletedDoc = await DocumentService.softDeleteDocument(mockUser, doc1.id);
    console.log(`   Soft deleted successfully! isDeleted: ${deletedDoc.isDeleted}`);
    if (!deletedDoc.isDeleted) {
      throw new Error('Soft-delete failed.');
    }

    // 9. Cleanup database and local file uploads
    console.log('9. Cleaning up temporary files & database mock tables...');
    for (const ver of doc2.versions) {
      await LocalStorageProvider.delete(ver.storedFilename);
    }
    
    // Purge records from database
    await prisma.documentVersion.deleteMany({ where: { documentId: doc1.id } });
    await prisma.document.delete({ where: { id: doc1.id } });
    await prisma.employee.delete({ where: { id: mockEmp.id } });
    await prisma.user.delete({ where: { id: mockUser.id } });
    await prisma.department.delete({ where: { id: mockDept.id } });
    console.log('   Cleanup completed!');

    console.log('✅ All Phase 12 Document & File Management verification checks passed successfully!');
  } catch (err) {
    console.error('❌ Phase 12 Verification checks failed with error:', err);
    process.exit(1);
  }
}

runVerification();
