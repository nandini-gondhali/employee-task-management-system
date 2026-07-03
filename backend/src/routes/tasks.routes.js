import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller.js';
import authenticate from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', upload.single('attachment'), createTask);
router.put('/:id', upload.single('attachment'), updateTask);
router.delete('/:id', deleteTask);

export default router;
