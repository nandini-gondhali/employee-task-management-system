import express from 'express';
import {
  getCompletedReport,
  getPendingReport,
  getEmployeeWiseReport,
  exportCsv,
  exportExcel
} from '../controllers/reports.controller.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/completed', getCompletedReport);
router.get('/pending', getPendingReport);
router.get('/employee-wise', getEmployeeWiseReport);
router.get('/export/csv', exportCsv);
router.get('/export/excel', exportExcel);

export default router;
