import { ProjectService } from '../services/project.service.js';
import {
  createProjectSchema,
  updateProjectSchema,
  assignManagerSchema,
  assignMembersSchema,
  bulkStatusSchema,
  bulkActionSchema
} from '../validations/project.validation.js';

export class ProjectController {
  static async listProjects(req, res, next) {
    try {
      const {
        page,
        limit,
        search,
        status,
        priority,
        departmentId,
        managerId,
        isDeleted,
        sortBy,
        sortOrder
      } = req.query;

      const result = await ProjectService.listProjects({
        page,
        limit,
        search,
        status,
        priority,
        departmentId,
        managerId,
        isDeleted,
        sortBy,
        sortOrder,
        user: req.user
      });

      return res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully.',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProject(req, res, next) {
    try {
      const { id } = req.params;
      const project = await ProjectService.getProjectById(id, req.user);

      return res.status(200).json({
        success: true,
        message: 'Project details retrieved successfully.',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req, res, next) {
    try {
      const parsedData = createProjectSchema.parse(req.body);
      const project = await ProjectService.createProject(parsedData, req.user.id);

      return res.status(201).json({
        success: true,
        message: 'Project created successfully.',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const parsedData = updateProjectSchema.parse(req.body);
      const project = await ProjectService.updateProject(id, parsedData, req.user.id, req.user);

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully.',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      await ProjectService.softDeleteProject(id, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Project soft deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async restoreProject(req, res, next) {
    try {
      const { id } = req.params;
      await ProjectService.restoreProject(id);

      return res.status(200).json({
        success: true,
        message: 'Project restored successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignManager(req, res, next) {
    try {
      const { id } = req.params;
      const { managerId } = assignManagerSchema.parse(req.body);
      const project = await ProjectService.assignManager(id, managerId, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Project manager assigned successfully.',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignMembers(req, res, next) {
    try {
      const { id } = req.params;
      const { members } = assignMembersSchema.parse(req.body);
      const project = await ProjectService.assignMembers(id, members, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Project members assigned successfully.',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMembers(req, res, next) {
    try {
      const { id } = req.params;
      const members = await ProjectService.getProjectMembers(id);

      return res.status(200).json({
        success: true,
        message: 'Project members list retrieved successfully.',
        data: members
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSpecificStatistics(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await ProjectService.getProjectSpecificStatistics(id);

      return res.status(200).json({
        success: true,
        message: 'Project specific statistics retrieved successfully.',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async getGlobalStatistics(req, res, next) {
    try {
      const stats = await ProjectService.getGlobalStatistics();

      return res.status(200).json({
        success: true,
        message: 'Projects overall statistics retrieved successfully.',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkDelete(req, res, next) {
    try {
      const { ids } = bulkActionSchema.parse(req.body);
      await ProjectService.bulkSoftDelete(ids, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Bulk soft delete operation completed successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkUpdateStatus(req, res, next) {
    try {
      const { ids, status } = bulkStatusSchema.parse(req.body);
      await ProjectService.bulkUpdateStatus(ids, status, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Bulk status update operation completed successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkRestore(req, res, next) {
    try {
      const { ids } = bulkActionSchema.parse(req.body);
      await ProjectService.bulkRestore(ids);

      return res.status(200).json({
        success: true,
        message: 'Bulk restore operation completed successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportProjects(req, res, next) {
    try {
      const csvData = await ProjectService.exportProjectsCSV(req.user);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=projects_export.csv');
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}
