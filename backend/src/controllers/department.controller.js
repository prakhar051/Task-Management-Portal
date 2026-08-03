import { DepartmentService } from '../services/department.service.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  assignManagerSchema,
  assignEmployeesSchema,
  bulkStatusSchema,
  bulkActionSchema
} from '../validations/department.validation.js';

export const getDepartments = async (req, res) => {
  const result = await DepartmentService.listDepartments(req.query, req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Departments retrieved successfully.',
    data: result.departments,
    pagination: result.pagination
  });
};

export const getDepartmentById = async (req, res) => {
  const department = await DepartmentService.getDepartmentById(req.params.id, req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Department details retrieved successfully.',
    data: department
  });
};

export const createDepartment = async (req, res) => {
  const parsedBody = createDepartmentSchema.parse(req.body);
  const department = await DepartmentService.createDepartment(parsedBody, req.user.id);
  res.status(201).json({
    success: true,
    message: 'Department created successfully.',
    data: department
  });
};

export const updateDepartment = async (req, res) => {
  const parsedBody = updateDepartmentSchema.parse(req.body);
  const department = await DepartmentService.updateDepartment(req.params.id, parsedBody, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Department updated successfully.',
    data: department
  });
};

export const deleteDepartment = async (req, res) => {
  await DepartmentService.deleteDepartment(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Department soft deleted successfully.'
  });
};

export const restoreDepartment = async (req, res) => {
  const department = await DepartmentService.restoreDepartment(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Department restored successfully.',
    data: department
  });
};

export const assignManager = async (req, res) => {
  const parsed = assignManagerSchema.parse(req.body);
  const department = await DepartmentService.assignManager(req.params.id, parsed.managerId, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Department manager assigned successfully.',
    data: department
  });
};

export const getDepartmentEmployees = async (req, res) => {
  const employees = await DepartmentService.getDepartmentEmployees(req.params.id, req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Department employees retrieved successfully.',
    data: employees
  });
};

export const assignEmployees = async (req, res) => {
  const parsed = assignEmployeesSchema.parse(req.body);
  const department = await DepartmentService.assignEmployees(req.params.id, parsed.employeeIds, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Employees assigned to department successfully.',
    data: department
  });
};

export const getStatistics = async (req, res) => {
  const stats = await DepartmentService.getStatistics();
  res.status(200).json({
    success: true,
    message: 'Department statistics retrieved successfully.',
    data: stats
  });
};

export const bulkDelete = async (req, res) => {
  const parsed = bulkActionSchema.parse(req.body);
  await DepartmentService.bulkDelete(parsed.ids, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Bulk soft delete completed successfully.'
  });
};

export const bulkUpdateStatus = async (req, res) => {
  const parsed = bulkStatusSchema.parse(req.body);
  await DepartmentService.bulkUpdateStatus(parsed.ids, parsed.status, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Bulk status update completed successfully.'
  });
};

export const bulkRestore = async (req, res) => {
  const parsed = bulkActionSchema.parse(req.body);
  await DepartmentService.bulkRestore(parsed.ids);
  res.status(200).json({
    success: true,
    message: 'Bulk restore completed successfully.'
  });
};

export const exportDepartments = async (req, res) => {
  const format = req.query.format || 'csv';
  const csvContent = await DepartmentService.exportToCSV(req.query, req.user.role, req.user.id);

  if (format === 'xlsx') {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=departments_export.xlsx');
  } else {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=departments_export.csv');
  }

  return res.status(200).send(csvContent);
};
