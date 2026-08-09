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
      const res = await axios.get('/api/users/profile');
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
      const res = await axios.get('/api/transactions/daybook');
      setTransactions(res.data.transactions || []);
      setSummary(res.data.summary || { totalCashIn: 0, totalCashOut: 0, netBalance: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await axios.get('/api/parties/list');
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
      const res = await axios.get(`/api/parties/ledger/${partyId}`);
      setSelectedParty(res.data.party);
      setPartyLedger(res.data.transactions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/parties/add', {
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
      await axios.put('/api/users/profile', {
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
      await axios.post('/api/transactions/add', {
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
      alert('Failed to save transaction entry.');
    }
  };

  const handlePurgeData = async () => {
    if (confirm('Are you sure you want to delete all transaction records?')) {
      try {
        await axios.delete('/api/users/purge-data');
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
      {/* Hide Next.js Dev Indicator */}
      <style jsx global>{`
        [data-nextjs-toast], [data-nextjs-dialog-overlay], #nextjs-dev-indicator {
          display: none !important;
        }
      `}</style>

      {/* Sidebar */}
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

      {/* Main Workspace */}
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

          {activeTab === 'parties' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Party Accounts</h3>
                  <p className="text-xs text-slate-500 font-semibold">Track customer and vendor ledger balances</p>
                </div>
                <button 
                  onClick={() => setShowAddPartyModal(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2"
                >
                  <UserPlus size={16} /> Add Party Account
                </button>
              </div>

              {parties.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Users size={44} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-slate-700 text-base">No Party Accounts</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Add a customer or vendor account to manage balances.</p>
                  <button 
                    onClick={() => setShowAddPartyModal(true)}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    + Add Party
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 border-r border-slate-100">
                    {parties.map((p) => {
                      const partyNetBalance = parseFloat(p.total_given) - parseFloat(p.total_received);
                      const isSelected = selectedParty && selectedParty.id === p.id;
                      return (
                        <div 
                          key={p.id}
                          onClick={() => fetchPartyLedger(p.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-sky-500 bg-sky-50/50 shadow-sm' 
                              : 'border-slate-200/80 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                              <p className="text-[11px] text-slate-500 font-medium">{p.phone || 'No phone'}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-black ${partyNetBalance >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                Rs. {Math.abs(partyNetBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                              <div className="text-[9px] font-extrabold uppercase text-slate-400">
                                {partyNetBalance >= 0 ? 'RECEIVABLE (DR)' : 'PAYABLE (CR)'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="md:col-span-2 flex flex-col justify-between">
                    {!selectedParty ? (
                      <div className="text-center py-20 text-slate-400 text-xs font-semibold">
                        Select a party from the left panel to view transactions.
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900">{selectedParty.name}</h3>
                            <p className="text-xs text-slate-500 font-semibold">Contact: {selectedParty.phone || 'N/A'}</p>
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setTxnType('CASH_OUT'); setShowModal(true); }}
                              className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Minus size={14} /> Debit (Paid)
                            </button>
                            <button 
                              onClick={() => { setTxnType('CASH_IN'); setShowModal(true); }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Plus size={14} /> Credit (Received)
                            </button>
                          </div>
                        </div>

                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100/70 text-slate-600 text-[10px] uppercase font-black border-b border-slate-200">
                              <th className="p-3">Date</th>
                              <th className="p-3">Particulars / Details</th>
                              <th className="p-3">Mode</th>
                              <th className="p-3 text-right">Debit (Rs.)</th>
                              <th className="p-3 text-right">Credit (Rs.)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
                            {partyLedger.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-400 font-medium text-xs">
                                  No transaction records found for this party.
                                </td>
                              </tr>
                            ) : (
                              partyLedger.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3 text-slate-500 text-xs font-mono font-semibold">
                                    {new Date(t.txn_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </td>
                                  <td className="p-3 font-bold text-slate-900">{t.remarks || 'Cash Transaction'}</td>
                                  <td className="p-3">
                                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/80 text-slate-700 rounded text-[10px] font-black uppercase">
                                      {t.payment_mode}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-bold text-rose-600">
                                    {t.txn_type === 'CASH_OUT' ? `Rs. ${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                  </td>
                                  <td className="p-3 text-right font-bold text-emerald-600">
                                    {t.txn_type === 'CASH_IN' ? `Rs. ${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
                    onClick={() => window.open('/api/reports/excel', '_blank')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Download size={15} /> Download Excel File
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm max-w-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Store Details</h3>
              <p className="text-xs text-slate-500 mb-6">Manage shop name, phone number, and address printed on PDF statements.</p>

              {saveSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} /> Details saved successfully.
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">Shop / Firm Name</label>
                  <input 
                    type="text" 
                    required
                    value={businessName} 
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Verma Traders" 
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210" 
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="store@email.com" 
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">GSTIN Number (Optional)</label>
                  <input 
                    type="text" 
                    value={gstin} 
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="07AAAAA0000A1Z5" 
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">Shop Address</label>
                  <textarea 
                    rows={2}
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop No, Main Market, City..." 
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" 
                  ></textarea>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button 
                    type="submit"
                    className="bg-slate-950 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
                  >
                    Save Changes
                  </button>

                  <button 
                    type="button"
                    onClick={handlePurgeData}
                    className="text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete All Records
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Add Party Modal */}
      {showAddPartyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-extrabold uppercase tracking-wider mb-4 text-slate-900">
              Add New Party
            </h3>
            <form onSubmit={handleAddParty} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Party / Customer Name</label>
                <input 
                  type="text" 
                  required 
                  value={partyName} 
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={partyPhone} 
                  onChange={(e) => setPartyPhone(e.target.value)}
                  placeholder="e.g. 9811234567"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddPartyModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-white bg-sky-600 hover:bg-sky-700 rounded-xl font-bold text-xs uppercase shadow-md cursor-pointer"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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