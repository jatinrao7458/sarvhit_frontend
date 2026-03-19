import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import {
    ArrowLeft, IndianRupee, Download, FileText, CalendarDays,
    Check, Building2, Receipt
} from 'lucide-react';
import './TaxReceiptsPage.css';

const RECEIPTS = [
    { id: 'TR-2026-001', date: 'Feb 15, 2026', amount: 50000, org: 'Green Earth Foundation', project: 'Tree Plantation Week', status: 'generated', section: '80G' },
    { id: 'TR-2026-002', date: 'Jan 28, 2026', amount: 100000, org: 'Swasthya Sewa', project: 'Rural Health Camp', status: 'generated', section: '80G' },
    { id: 'TR-2025-012', date: 'Dec 10, 2025', amount: 200000, org: 'TechBridge India', project: 'Digital Literacy Program', status: 'generated', section: '80G' },
    { id: 'TR-2025-011', date: 'Nov 5, 2025', amount: 30000, org: 'Ocean Warriors', project: 'Beach Cleanup Saturday', status: 'generated', section: '80G' },
    { id: 'TR-2025-010', date: 'Oct 18, 2025', amount: 150000, org: 'Green Earth Foundation', project: 'Clean River Drive', status: 'generated', section: '80G' },
    { id: 'TR-2025-009', date: 'Sep 2, 2025', amount: 75000, org: 'Vidya Foundation', project: 'Teach India', status: 'generated', section: '80G' },
];

export default function TaxReceiptsPage() {
    const navigate = useNavigate();
    const totalDeductible = RECEIPTS.reduce((sum, r) => sum + r.amount, 0);

    return (
        <div className="tax-receipts">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            <motion.div className="tax-receipts__header" {...fadeUp(0)}>
                <div>
                    <h1>Tax Receipts</h1>
                    <p>Download 80G receipts for your donations. All receipts are auto-generated.</p>
                </div>
            </motion.div>

            {/* Summary */}
            <div className="tax-receipts__summary">
                <motion.div className="tax-stat" {...fadeUp(1)}>
                    <div className="tax-stat__icon"><IndianRupee size={20} /></div>
                    <div className="tax-stat__value">₹{(totalDeductible / 100000).toFixed(1)}L</div>
                    <div className="tax-stat__label">Total Deductible (80G)</div>
                </motion.div>
                <motion.div className="tax-stat" {...fadeUp(2)}>
                    <div className="tax-stat__icon"><Receipt size={20} /></div>
                    <div className="tax-stat__value">{RECEIPTS.length}</div>
                    <div className="tax-stat__label">Receipts Generated</div>
                </motion.div>
                <motion.div className="tax-stat" {...fadeUp(3)}>
                    <div className="tax-stat__icon"><CalendarDays size={20} /></div>
                    <div className="tax-stat__value">FY 25-26</div>
                    <div className="tax-stat__label">Current Financial Year</div>
                </motion.div>
            </div>

            {/* Receipts list */}
            <motion.div className="tax-receipts__list-section" {...fadeUp(4)}>
                <div className="tax-receipts__list-header">
                    <h2><FileText size={18} /> All Receipts</h2>
                    <motion.button
                        className="download-all-btn"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    >
                        <Download size={14} /> Download All
                    </motion.button>
                </div>

                <div className="receipts-table">
                    <div className="receipts-table__head">
                        <span>Receipt ID</span>
                        <span>Date</span>
                        <span>Organization</span>
                        <span>Project</span>
                        <span>Amount</span>
                        <span>Action</span>
                    </div>
                    {RECEIPTS.map((r, i) => (
                        <motion.div key={r.id} className="receipts-table__row" {...fadeUp(i + 5)}>
                            <span className="receipt-id">{r.id}</span>
                            <span>{r.date}</span>
                            <span className="receipt-org">{r.org}</span>
                            <span className="receipt-project">{r.project}</span>
                            <span className="receipt-amount">₹{r.amount.toLocaleString()}</span>
                            <motion.button
                                className="receipt-download"
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            >
                                <Download size={14} />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
