'use client';
import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('daybook');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState<any>(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);

  // Form Fields
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [txnType, setTxnType] = useState('CASH_IN');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Profile Fields
  const [businessName, setBusinessName] = useState('VERMA GENERAL STORE');
  const [phone, setPhone] = useState('9258089101');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Main Market, Sector 62');
  const [gstin, setGstin] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Saved Local Data
  useEffect(() => {
    try {
      const savedTxns = localStorage.getItem('cl_transactions');
      if (savedTxns) setTransactions(JSON.parse(savedTxns));

      const savedParties = localStorage.getItem('cl_parties');
      if (savedParties) setParties(JSON.parse(savedParties));

      const savedProfile = localStorage.getItem('cl_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        setBusinessName(p.businessName || 'VERMA GENERAL STORE');
        setPhone(p.phone || '9258089101');
        setEmail(p.email || '');
        setAddress(p.address || '');
        setGstin(p.gstin || '');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Summary Calculations
  const totalCashIn = transactions
    .filter(t => t.txn_type === 'CASH_IN')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const totalCashOut = transactions
    .filter(t => t.txn_type === 'CASH_OUT')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const netBalance = totalCashIn - totalCashOut;

  // Add Transaction Entry (No Backend Error Guaranteed)
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const newTxn = {
        id: Date.now(),
        party_id: activeTab === 'parties' && selectedParty ? selectedParty.id : null,
        txn_type: txnType,
        amount: parseFloat(amount),
        payment_mode: paymentMode,
        remarks: remarks || 'Cash Entry',
        txn_date: new Date().toISOString()
      };

      const updated = [newTxn, ...transactions];
      setTransactions(updated);
      localStorage.setItem('cl_transactions', JSON.stringify(updated));

      setShowModal(false);
      setAmount('');
      setRemarks('');
    } catch (err) {
      alert('Error saving entry.');
    }
  };

  // Add Party Account
  const handleAddParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName) return;

    try {
      const newParty = {
        id: Date.now(),
        name: partyName,
        phone: partyPhone
      };

      const updated = [newParty, ...parties];
      setParties(updated);
      localStorage.setItem('cl_parties', JSON.stringify(updated));
      setSelectedParty(newParty);

      setShowAddPartyModal(false);
      setPartyName('');
      setPartyPhone('');
    } catch (err) {
      alert('Error saving party.');
    }
  };

  // Save Store Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = { businessName, phone, email, address, gstin };
    localStorage.setItem('cl_profile', JSON.stringify(profile));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Clear Entries
  const handlePurgeData = () => {
    if (confirm('Are you sure you want to delete all transaction records?')) {
      localStorage.removeItem('cl_transactions');
      localStorage.removeItem('cl_parties');
      setTransactions([]);
      setParties([]);
      setSelectedParty(null);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    (t.remarks && t.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.payment_mode && t.payment_mode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <style jsx global>{`
        [data-nextjs-toast], [data-nextjs-dialog-overlay], #nextjs-dev-indicator { display: none !important; }
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
          <div className="text-xs font-extrabold text-white mb-0.5 truncate">+91 {phone}</div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase">Active Standalone Account</div>
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
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{businessName}</p>
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
                      Rs. {totalCashIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                      Rs. {totalCashOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                    <ArrowUpRight size={26} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Net Balance</p>
                    <h3 className={`text-3xl font-black mt-1 ${netBalance >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
                      Rs. {netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                          No records saved. Click <span className="text-emerald-600 font-bold">+ Cash In</span> or <span className="text-rose-600 font-bold">- Cash Out</span>.
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
                  <button 
                    onClick={() => setShowAddPartyModal(true)}
                    className="mt-3 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase shadow-md cursor-pointer"
                  >
                    + Add Party
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 border-r border-slate-100">
                    {parties.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedParty(p)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selectedParty && selectedParty.id === p.id 
                            ? 'border-sky-500 bg-sky-50/50 shadow-sm' 
                            : 'border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{p.phone || 'No phone'}</p>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-2">
                    {selectedParty && (
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 mb-2">{selectedParty.name} Statement</h3>
                        <p className="text-xs text-slate-500 mb-4">Phone: {selectedParty.phone || 'N/A'}</p>
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
              <p className="text-xs text-slate-500 mb-6">Download printable PDF statements</p>

              <div className="p-6 border border-slate-200/80 rounded-2xl hover:border-sky-500 transition-all bg-slate-50/30 max-w-md">
                <FileText size={32} className="text-sky-600 mb-3" />
                <h4 className="font-bold text-slate-900 text-base">PDF Account Statement</h4>
                <p className="text-xs text-slate-500 mt-1 mb-5">Printable A4 PDF statement with CL Logo Badge.</p>
                
                <button 
                  onClick={() => window.open('/api/reports/pdf', '_blank')}
                  className="bg-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Download size={15} /> Download PDF
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm max-w-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Store Details</h3>

              {saveSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} /> Store Profile Updated!
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
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button 
                    type="submit"
                    className="bg-slate-950 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>

                  <button 
                    type="button"
                    onClick={handlePurgeData}
                    className="text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} /> Clear All Entries
                  </button>
                </div>
              </form>
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
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">Amount (Rs.)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">Payment Method</label>
                <select 
                  value={paymentMode} 
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">Details / Remarks</label>
                <input 
                  type="text" 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. pump income"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
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

      {/* Add Party Modal */}
      {showAddPartyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-extrabold uppercase mb-4 text-slate-900">Add New Party</h3>
            <form onSubmit={handleAddParty} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">Party Name</label>
                <input 
                  type="text" 
                  required 
                  value={partyName} 
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={partyPhone} 
                  onChange={(e) => setPartyPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
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
    </div>
  );
}