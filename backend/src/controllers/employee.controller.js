import { EmployeeService } from '../services/employee.service.js';
import { StorageService } from '../utils/fileUpload.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  bulkStatusSchema,
  bulkActionSchema
} from '../validations/employee.validation.js';

export const getEmployees = async (req, res) => {
  const result = await EmployeeService.listEmployees(req.query, req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Employees retrieved successfully.',
    data: result.employees,
    pagination: result.pagination
  });
};

export const getEmployeeById = async (req, res) => {
  const employee = await EmployeeService.getEmployeeById(req.params.id, req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Employee details retrieved successfully.',
    data: employee
  });
};

export const createEmployee = async (req, res) => {
  const parsedBody = createEmployeeSchema.parse(req.body);
  const employee = await EmployeeService.createEmployee(parsedBody, req.user.id);
  res.status(201).json({
    success: true,
    message: 'Employee profile created successfully.',
    data: employee
  });
};

export const updateEmployee = async (req, res) => {
  const parsedBody = updateEmployeeSchema.parse(req.body);
  const employee = await EmployeeService.updateEmployee(req.params.id, parsedBody, req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Employee profile updated successfully.',
    data: employee
  });
};

export const deleteEmployee = async (req, res) => {
  await EmployeeService.deleteEmployee(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Employee profile soft deleted successfully.'
  });
};

export const restoreEmployee = async (req, res) => {
  const employee = await EmployeeService.restoreEmployee(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Employee profile restored successfully.',
    data: employee
  });
};

export const updateAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  // Find existing employee profile
  const employee = await EmployeeService.getEmployeeById(req.params.id, req.user.role, req.user.id);

  // Purge old avatar file if present
  if (employee.avatar) {
    StorageService.deleteFile(employee.avatar);
  }

  const avatarUrl = StorageService.saveFile(req.file);
  const updatedEmployee = await EmployeeService.updateEmployee(
    req.params.id,
    { avatar: avatarUrl },
    req.user.role,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully.',
    data: updatedEmployee
  });
};

export const bulkDelete = async (req, res) => {
  const parsed = bulkActionSchema.parse(req.body);
  await EmployeeService.bulkDelete(parsed.ids, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Bulk soft delete operation completed successfully.'
  });
};

export const bulkUpdateStatus = async (req, res) => {
  const parsed = bulkStatusSchema.parse(req.body);
  await EmployeeService.bulkUpdateStatus(parsed.ids, parsed.status, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Bulk status update completed successfully.'
  });
};

export const bulkRestore = async (req, res) => {
  const parsed = bulkActionSchema.parse(req.body);
  await EmployeeService.bulkRestore(parsed.ids);
  res.status(200).json({
    success: true,
    message: 'Bulk restore operation completed successfully.'
  });
};

export const exportEmployees = async (req, res) => {
  const format = req.query.format || 'csv';
  const csvContent = await EmployeeService.exportToCSV(req.query, req.user.role, req.user.id);

  if (format === 'xlsx') {
    // Falls back to CSV download with xlsx filename to let Excel parse directly
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees_export.xlsx');
  } else {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employees_export.csv');
  }

  return res.status(200).send(csvContent);
};
