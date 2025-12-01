import express from 'express';
import {
    getCustomers,
    getCustomerDetails,
    updateCustomer,
    getCustomerStats,
    getAtRiskCustomers,
    getTopCustomers,
    addCustomerNote,
} from '../../controllers/business/crmController';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.get('/customers', protect, getCustomers);
router.get('/customers/stats', protect, getCustomerStats);
router.get('/customers/at-risk', protect, getAtRiskCustomers);
router.get('/customers/top', protect, getTopCustomers);
router.get('/customers/:id', protect, getCustomerDetails);
router.put('/customers/:id', protect, updateCustomer);
router.post('/customers/:id/notes', protect, addCustomerNote);

export default router;
