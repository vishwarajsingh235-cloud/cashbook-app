'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  Plus, 
  Minus, 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  Search,
  Building2,
  Download,
  FileText,
  CheckCircle2,
  UserPlus,
  Trash2
} from 'lucide-react';

// Express Backend URL for DB calls (Localhost or Production)
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'http://localhost:5000'; // Agar online backend host ho toh yahan URL badlein

export default function CashLedgerDashboard() {
  const [user] = useState({ phone: '9258089101', business_name: 'My Store' });

  // App State
  const [activeTab, setActiveTab] = useState('daybook');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalCashIn: 0, totalCashOut: 0, netBalance: 0 });
  const [showModal, setShowModal] = useState(false);
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);

  // Party Management State
  const [parties, setParties] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [partyLedger, setPartyLedger] = useState<any[]>([]);

  // Form Fields
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [txnType, setTxnType] = useState('CASH_IN');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Store Profile State
  const [businessName, setBusinessName] = useState('My Store');
  const [phone, setPhone] = useState('9258089101');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchDaybook();
    fetchParties();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/users/profile`);
      if (res.data) {
        setBusinessName(res.data.business_name || 'My Store');
        setPhone(res.data.phone || '9258089101');
        setEmail(res.data.email || '');
        setAddress(res.data.address || '');
        setGstin(res.data.gstin || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDaybook = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/transactions/daybook`);
      setTransactions(res.data.transactions || []);
      setSummary(res.data.summary || { totalCashIn: 0, totalCashOut: 0, netBalance: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/parties/list`);
      setParties(res.data || []);
      if (res.data && res.data.length > 0 && !selectedParty) {
        fetchPartyLedger(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPartyLedger = async (partyId: number) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/parties/ledger/${partyId}`);
      setSelectedParty(res.data.party);
      setPartyLedger(res.data.transactions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/parties/add`, {
        name: partyName,
        phone: partyPhone
      });
      setShowAddPartyModal(false);
      setPartyName('');
      setPartyPhone('');
      fetchParties();
    } catch (err) {
      alert('Error saving party details.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${BACKEND_URL}/api/users/profile`, {
        business_name: businessName,
        phone,
        email,
        address,
        gstin
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update store settings.');
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/transactions/add`, {
        party_id: activeTab === 'parties' && selectedParty ? selectedParty.id : null,
        txn_type: txnType,
        amount: parseFloat(amount),
        payment_mode: paymentMode,
        remarks: remarks
      });

      setShowModal(false);
      setAmount('');
      setRemarks('');
      fetchDaybook();
      if (selectedParty) fetchPartyLedger(selectedParty.id);
      fetchParties();
    } catch (err) {
      alert('Failed to save transaction entry. Ensure backend server is running.');
    }
  };

  const handlePurgeData = async () => {
    if (confirm('Are you sure you want to delete all transaction records?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/users/purge-data`);
        alert('All records deleted successfully.');
        fetchDaybook();
        fetchParties();
        setSelectedParty(null);
      } catch (err) {
        alert('Error purging data.');
      }
    }
  };

  const filteredTransactions = transactions.filter(t => 
    (t.remarks && t.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.payment_mode && t.payment_mode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <aside className="w-64 bg-slate-950 text-white flex flex-col justify-between hidden md:flex border-r border-slate-800">
        <div>
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                <Building2 size={22} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white uppercase">CashLedger</h1>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Business Cashbook</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <button 
              onClick={() => setActiveTab('daybook')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'daybook' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <BookOpen size={16} /> Cashbook
            </button>

            <button 
              onClick={() => setActiveTab('parties')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'parties' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Users size={16} /> Customers & Parties
            </button>

            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'reports' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <FileSpreadsheet size={16} /> Reports & Exports
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Settings size={16} /> Store Profile
            </button>
          </nav>
        </div>

        <div className="p-4 m-4 bg-slate-900/90 rounded-2xl border border-slate-800">
          <div className="text-xs font-extrabold text-white mb-0.5 truncate">+91 {user?.phone}</div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase">Active Account</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200/80 px-8 py-5 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === 'daybook' && 'Cash In & Out Entries'}
              {activeTab === 'parties' && 'Party Ledger Statements'}
              {activeTab === 'reports' && 'Reports & Statements'}
              {activeTab === 'settings' && 'Store Settings'}
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Manage daily cash flow and accounts</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setTxnType('CASH_IN'); setShowModal(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Plus size={16} /> Cash In
            </button>
            <button 
              onClick={() => { setTxnType('CASH_OUT'); setShowModal(true); }}
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Minus size={16} /> Cash Out
            </button>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'daybook' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Credit (Cash In)</p>
                    <h3 className="text-3xl font-black text-emerald-600 mt-1">
                      Rs. {summary.totalCashIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                    <ArrowDownRight size={26} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Debit (Cash Out)</p>
                    <h3 className="text-3xl font-black text-rose-600 mt-1">
                      Rs. {summary.totalCashOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                    <ArrowUpRight size={26} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Net Balance</p>
                    <h3 className={`text-3xl font-black mt-1 ${summary.netBalance >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
                      Rs. {summary.netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
                    <Wallet size={26} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
                    <span className="text-[11px] bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full font-extrabold">
                      {filteredTransactions.length} Total
                    </span>
                  </div>

                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search entry..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold w-48 md:w-64 shadow-sm"
                    />
                  </div>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-600 text-[10px] uppercase font-black border-b border-slate-200">
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Particulars / Details</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4 text-right">Cash In (Rs.)</th>
                      <th className="p-4 text-right">Cash Out (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                          No records found. Click <span className="text-emerald-600 font-bold">+ Cash In</span> or <span className="text-rose-600 font-bold">- Cash Out</span>.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 text-slate-500 text-xs font-mono font-semibold">
                            {new Date(t.txn_date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="p-4 font-bold text-slate-900">{t.remarks || 'Cash Entry'}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/80 text-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                              {t.payment_mode}
                            </span>
                          </td>
                          <td className="p-4 text-right font-bold text-emerald-600">
                            {t.txn_type === 'CASH_IN' ? `Rs. ${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="p-4 text-right font-bold text-rose-600">
                            {t.txn_type === 'CASH_OUT' ? `Rs. ${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Download Account Statements</h3>
              <p className="text-xs text-slate-500 mb-6">Download printable PDF statements and Excel files</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-slate-200/80 rounded-2xl hover:border-sky-500 transition-all bg-slate-50/30">
                  <FileText size={32} className="text-sky-600 mb-3" />
                  <h4 className="font-bold text-slate-900 text-base">PDF Account Statement</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-5">Printable A4 PDF statement with complete transaction breakdown.</p>
                  
                  <button 
                    onClick={() => window.open('/api/reports/pdf', '_blank')}
                    className="bg-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Download size={15} /> Download PDF
                  </button>
                </div>

                <div className="p-6 border border-slate-200/80 rounded-2xl hover:border-emerald-500 transition-all bg-slate-50/30">
                  <FileSpreadsheet size={32} className="text-emerald-600 mb-3" />
                  <h4 className="font-bold text-slate-900 text-base">Excel Worksheet (.XLSX)</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-5">Spreadsheet format for MS Excel and accounting software.</p>
                  
                  <button 
                    onClick={() => window.open(`${BACKEND_URL}/api/reports/excel`, '_blank')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Download size={15} /> Download Excel File
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className={`text-base font-extrabold uppercase tracking-wider mb-4 ${txnType === 'CASH_IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {txnType === 'CASH_IN' ? '+ Record Cash In Entry' : '- Record Cash Out Entry'}
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Amount (Rs.)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Payment Method</label>
                <select 
                  value={paymentMode} 
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI / Online Transfer</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Details / Remarks</label>
                <input 
                  type="text" 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Purchased Supplies (Invoice #804)"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-5 py-2 text-white rounded-xl font-bold text-xs uppercase shadow-md cursor-pointer ${txnType === 'CASH_IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}