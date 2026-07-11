import React, { useState, useMemo, useCallback } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  FileText, 
  Settings, 
  Bell, 
  UserCircle,
  X,
  Save,
  Trash2,
  Archive,
  AlertCircle,
  CheckCircle2,
  Download
} from 'lucide-react';
import { User, ImageRecord, AppNotification, ViewState, BU, Status } from './types';
import { MOCK_USERS, INITIAL_RECORDS, BUS } from './constants';

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const getIsoDate = () => new Date().toISOString();

// --- Main App Component ---
export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS['R&D User']);
  const [records, setRecords] = useState<ImageRecord[]>(INITIAL_RECORDS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('library');
  
  // UI State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ImageRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // --- Actions ---
  const addNotification = useCallback((message: string, type: 'info' | 'warning' | 'alert' = 'info') => {
    setNotifications(prev => [{
      id: generateId(),
      message,
      timestamp: getIsoDate(),
      read: false,
      type
    }, ...prev]);
  }, []);

  const handleSaveRecord = (recordData: Partial<ImageRecord>) => {
    // Duplicate Check
    const isDuplicate = records.some(r => 
      r.custId === recordData.custId && r.id !== recordData.id
    );

    if (isDuplicate) {
      alert(`Error: CUST ID "${recordData.custId}" already exists. Duplicates are not allowed.`);
      return;
    }

    if (recordData.id) {
      // Update existing
      setRecords(prev => prev.map(r => {
        if (r.id === recordData.id) {
          const updated = { ...r, ...recordData, modifiedBy: currentUser.name, modifiedAt: getIsoDate() };
          
          // Log changes
          const changes = [];
          if (r.status !== updated.status) changes.push(`Status changed to ${updated.status}`);
          if (r.tabId !== updated.tabId) changes.push(`TAB ID updated`);
          if (r.title !== updated.title) changes.push(`Title updated`);
          
          if (changes.length > 0) {
             updated.history = [{
               id: generateId(),
               timestamp: getIsoDate(),
               user: currentUser.name,
               action: changes.join(', ')
             }, ...updated.history];
          }
          return updated as ImageRecord;
        }
        return r;
      }));
      addNotification(`Record ${recordData.custId} updated by ${currentUser.name}`);
    } else {
      // Create new
      const newRecord: ImageRecord = {
        ...recordData,
        id: generateId(),
        status: 'Active',
        createdBy: currentUser.name,
        createdAt: getIsoDate(),
        modifiedBy: currentUser.name,
        modifiedAt: getIsoDate(),
        imageUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`,
        history: [{
          id: generateId(),
          timestamp: getIsoDate(),
          user: currentUser.name,
          action: 'Created Record'
        }]
      } as ImageRecord;
      setRecords(prev => [newRecord, ...prev]);
      addNotification(`New record ${newRecord.custId} created by ${currentUser.name}`, 'info');
    }
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const handleDeleteRecord = (id: string) => {
    if (currentUser.role !== 'DRD User') {
      alert("Only DRD users can permanently delete records.");
      return;
    }
    if (window.confirm("Are you sure you want to permanently delete this record? This action cannot be undone.")) {
      setRecords(prev => prev.map(r => r.id === id ? { 
        ...r, 
        status: 'Deleted', 
        modifiedBy: currentUser.name, 
        modifiedAt: getIsoDate(),
        history: [{ id: generateId(), timestamp: getIsoDate(), user: currentUser.name, action: 'Permanently Deleted' }, ...r.history]
      } : r));
      addNotification(`Record deleted by ${currentUser.name}. GMS/TAB Team notified.`, 'alert');
      setSelectedRecord(null);
    }
  };

  const handleArchiveRecord = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'Archived',
      modifiedBy: currentUser.name,
      modifiedAt: getIsoDate(),
      history: [{ id: generateId(), timestamp: getIsoDate(), user: currentUser.name, action: 'Status changed to Archived' }, ...r.history]
    } : r));
    addNotification(`Record archived by ${currentUser.name}. GMS/TAB Team notified.`, 'warning');
    setSelectedRecord(null);
  };

  // --- Permissions Logic ---
  const canCreate = currentUser.role === 'R&D User' || currentUser.role === 'DRD User';
  
  const canEditField = (record: ImageRecord | null, field: keyof ImageRecord) => {
    if (currentUser.role === 'DRD User') return true;
    if (currentUser.role === 'GMS User') return field === 'tabId';
    if (currentUser.role === 'R&D User') {
      // R&D can only edit their own BU, and cannot edit TAB ID
      if (field === 'tabId') return false;
      if (!record) return true; // Creating new
      return record.bu === currentUser.bu;
    }
    return false;
  };

  const canArchive = (record: ImageRecord) => {
    if (record.status !== 'Active') return false;
    if (currentUser.role === 'DRD User') return true;
    if (currentUser.role === 'R&D User') return record.bu === currentUser.bu;
    return false;
  };

  const canDelete = currentUser.role === 'DRD User';

  // --- Render Helpers ---
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Banner */}
      <div className="bg-blue-900 text-blue-50 px-4 py-2 text-sm flex items-center justify-center font-medium">
        <ShieldAlert className="w-4 h-4 mr-2 text-blue-300" />
        <span>
          <strong>Governance Notice:</strong> This library tracks and governs image metadata. Final high-resolution assets are stored and controlled in TAB.
        </span>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            R&D
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Artwork Image Library</h1>
        </div>

        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-lg rounded-md overflow-hidden z-50">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-sm flex justify-between items-center">
                  Activity Log (Simulated Emails)
                  <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500 text-center">No recent activity</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b border-slate-100 text-sm ${n.read ? 'opacity-60' : 'bg-blue-50/50'}`}>
                        <div className="flex items-start">
                          {n.type === 'alert' ? <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" /> :
                           n.type === 'warning' ? <ShieldAlert className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" /> :
                           <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />}
                          <div>
                            <p className="text-slate-800">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
            <UserCircle className="w-8 h-8 text-slate-400" />
            <div className="flex flex-col">
              <select 
                className="text-sm font-semibold bg-transparent border-none focus:ring-0 p-0 cursor-pointer text-slate-800"
                value={currentUser.role}
                onChange={(e) => {
                  const role = e.target.value as Role;
                  setCurrentUser(MOCK_USERS[role]);
                  setCurrentView('library'); // Reset view on role change
                }}
              >
                {Object.keys(MOCK_USERS).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {currentUser.role === 'R&D User' ? (
                <select 
                  className="text-xs text-slate-500 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
                  value={currentUser.bu}
                  onChange={(e) => setCurrentUser({...currentUser, bu: e.target.value as BU})}
                >
                  {BUS.map(bu => <option key={bu} value={bu}>BU: {bu}</option>)}
                </select>
              ) : (
                <span className="text-xs text-slate-500">Global Access</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white border-r border-slate-200 flex flex-col py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</div>
          <NavItem icon={<Search />} label="Library" active={currentView === 'library'} onClick={() => setCurrentView('library')} />
          {canCreate && (
            <NavItem icon={<Upload />} label="Bulk Upload" active={currentView === 'bulk-upload'} onClick={() => setCurrentView('bulk-upload')} />
          )}
          <NavItem icon={<FileText />} label="Governance Reports" active={currentView === 'reports'} onClick={() => setCurrentView('reports')} />
          
          {currentUser.role === 'DRD User' && (
            <>
              <div className="px-4 mt-8 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</div>
              <NavItem icon={<Settings />} label="Library Settings" active={currentView === 'admin'} onClick={() => setCurrentView('admin')} />
            </>
          )}
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {currentView === 'library' && (
            <LibraryView 
              records={records} 
              currentUser={currentUser} 
              onRowClick={(record) => { setSelectedRecord(record); setIsEditing(false); }}
              onCreateClick={() => { setSelectedRecord(null); setIsEditing(true); }}
              canCreate={canCreate}
            />
          )}
          {currentView === 'bulk-upload' && <BulkUploadView onUpload={(count) => addNotification(`Bulk uploaded ${count} records`, 'info')} />}
          {currentView === 'reports' && <ReportsView records={records} />}
          {currentView === 'admin' && <AdminSettingsView />}
        </main>
      </div>

      {/* Record Detail / Edit Modal */}
      {(selectedRecord || isEditing) && (
        <RecordModal 
          record={selectedRecord}
          isEditing={isEditing}
          currentUser={currentUser}
          onClose={() => { setSelectedRecord(null); setIsEditing(false); }}
          onSave={handleSaveRecord}
          onEdit={() => setIsEditing(true)}
          onArchive={() => selectedRecord && handleArchiveRecord(selectedRecord.id)}
          onDelete={() => selectedRecord && handleDeleteRecord(selectedRecord.id)}
          canEditField={canEditField}
          canArchive={selectedRecord ? canArchive(selectedRecord) : false}
          canDelete={canDelete}
        />
      )}
    </div>
  );
}

// --- Sub-Components ---

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center w-full px-6 py-3 text-sm font-medium transition-colors ${
        active ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className="w-5 h-5 mr-3 opacity-75">{icon}</span>
      {label}
    </button>
  );
}

function LibraryView({ records, currentUser, onRowClick, onCreateClick, canCreate }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Archived'>('Active');
  const [buFilter, setBuFilter] = useState<BU | 'All'>('All');

  // TODO: If PMA role added, ensure they cannot see status === 'Archived'
  const filteredRecords = useMemo(() => {
    return records.filter((r: ImageRecord) => {
      // Never show deleted in main view
      if (r.status === 'Deleted') return false;
      
      if (r.status !== statusFilter) return false;
      if (buFilter !== 'All' && r.bu !== buFilter) return false;
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return r.title.toLowerCase().includes(term) || 
               r.custId.toLowerCase().includes(term) || 
               (r.tabId && r.tabId.toLowerCase().includes(term));
      }
      return true;
    });
  }, [records, searchTerm, statusFilter, buFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Image Library</h2>
        {canCreate && (
          <button onClick={onCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> New Record
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Title, CUST ID, TAB ID..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            className="border border-slate-300 rounded-md text-sm py-2 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="Active">Status: Active</option>
            <option value="Archived">Status: Archived</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select 
            className="border border-slate-300 rounded-md text-sm py-2 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={buFilter}
            onChange={(e) => setBuFilter(e.target.value as any)}
          >
            <option value="All">All BUs</option>
            {BUS.map(bu => <option key={bu} value={bu}>{bu}</option>)}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IDs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">BU / BG</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Modified</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredRecords.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No records found matching criteria.</td></tr>
            ) : (
              filteredRecords.map((record: ImageRecord) => (
                <tr key={record.id} onClick={() => onRowClick(record)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={record.imageUrl} alt="thumbnail" className="w-12 h-12 rounded object-cover border border-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{record.title}</div>
                    <div className="text-sm text-slate-500 truncate max-w-[200px]">{record.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-mono">{record.custId}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">{record.tabId || <span className="italic text-slate-400">No TAB ID</span>}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {record.bu}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div>{new Date(record.modifiedAt).toLocaleDateString()}</div>
                    <div className="text-xs">{record.modifiedBy}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordModal({ record, isEditing, currentUser, onClose, onSave, onEdit, onArchive, onDelete, canEditField, canArchive, canDelete }: any) {
  const [formData, setFormData] = useState<Partial<ImageRecord>>(record || {
    title: '', description: '', custId: '', tabId: '', bu: currentUser.role === 'R&D User' ? currentUser.bu : 'Home Care'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.custId || !formData.title) {
      alert("CUST ID and Title are required.");
      return;
    }
    onSave(formData);
  };

  // Determine if user has ANY edit rights to show the "Edit" button
  const hasAnyEditRights = canEditField(record, 'title') || canEditField(record, 'tabId');

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {isEditing ? (record ? 'Edit Record' : 'New Image Record') : 'Record Details'}
          </h3>
          <div className="flex items-center space-x-2">
            {!isEditing && hasAnyEditRights && (
              <button onClick={onEdit} className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Edit
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          
          {/* Left Col: Form/Details */}
          <div className="flex-1 space-y-6">
            {record && !isEditing && (
               <div className="flex items-center space-x-4 mb-6">
                 <img src={record.imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-slate-200 shadow-sm" />
                 <div>
                   <h2 className="text-xl font-bold text-slate-900">{record.title}</h2>
                   <p className="text-slate-500">{record.description}</p>
                   <div className="mt-2 flex space-x-2">
                     <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'Active' ? 'bg-green-100 text-green-800' : record.status === 'Archived' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                       {record.status}
                     </span>
                     <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                       {record.bu}
                     </span>
                   </div>
                 </div>
               </div>
            )}

            <form id="record-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CUST ID (PIT) *</label>
                  <input 
                    type="text" name="custId" value={formData.custId || ''} onChange={handleChange}
                    disabled={!isEditing || !canEditField(record, 'custId')}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    placeholder="e.g. PIT-HC-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">TAB ID</label>
                  <input 
                    type="text" name="tabId" value={formData.tabId || ''} onChange={handleChange}
                    disabled={!isEditing || !canEditField(record, 'tabId')}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    placeholder="Added by DRD/GMS"
                  />
                  {currentUser.role === 'R&D User' && isEditing && <p className="text-xs text-slate-400 mt-1">Only DRD/GMS can edit TAB ID.</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input 
                  type="text" name="title" value={formData.title || ''} onChange={handleChange}
                  disabled={!isEditing || !canEditField(record, 'title')}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  name="description" value={formData.description || ''} onChange={handleChange} rows={3}
                  disabled={!isEditing || !canEditField(record, 'description')}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">BU / BG</label>
                <select 
                  name="bu" value={formData.bu || ''} onChange={handleChange}
                  disabled={!isEditing || !canEditField(record, 'bu')}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {BUS.map(bu => <option key={bu} value={bu}>{bu}</option>)}
                </select>
                {currentUser.role === 'R&D User' && isEditing && <p className="text-xs text-slate-400 mt-1">Locked to your BU.</p>}
              </div>
              
              {isEditing && !record && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Image File (Simulated)</label>
                   <div className="border-2 border-dashed border-slate-300 rounded-md p-4 text-center text-sm text-slate-500 bg-slate-50">
                     Click or drag file to upload (Mock)
                   </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Col: Audit & Actions */}
          {record && (
            <div className="w-full md:w-72 flex flex-col border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-6">
              <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Audit Trail</h4>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {record.history.map((entry: any, i: number) => (
                  <div key={entry.id} className="relative pl-4 border-l-2 border-slate-200 pb-4 last:pb-0">
                    <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5 ring-4 ring-white"></div>
                    <p className="text-xs font-semibold text-slate-900">{entry.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{entry.user}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Governance Actions */}
              {!isEditing && (
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                  {canArchive && (
                    <button onClick={onArchive} className="w-full flex items-center justify-center px-4 py-2 border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md text-sm font-medium transition-colors">
                      <Archive className="w-4 h-4 mr-2" /> Mark as Archived
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={onDelete} className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded-md text-sm font-medium transition-colors">
                      <Trash2 className="w-4 h-4 mr-2" /> Permanently Delete
                    </button>
                  )}
                  {!canArchive && !canDelete && (
                    <p className="text-xs text-slate-500 text-center italic">No governance actions available for your role on this record.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" form="record-form" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center">
              <Save className="w-4 h-4 mr-2" /> Save Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BulkUploadView({ onUpload }: { onUpload: (count: number) => void }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onUpload(18); // Simulate 18 records uploaded
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Bulk Upload</h2>
        <p className="text-slate-500 mt-1">Import multiple image records via Excel template.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-start space-x-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold">1</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900">Download Template</h3>
            <p className="text-sm text-slate-500 mt-1 mb-3">Use the standard Excel template to ensure columns match the library schema.</p>
            <button className="text-sm font-medium text-blue-600 hover:underline flex items-center">
              <Download className="w-4 h-4 mr-1" /> Download Template.xlsx
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold">2</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-900">Upload Data & Images</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Upload the filled Excel file along with a zip of corresponding images.</p>
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">Drag and drop files here</p>
              <p className="text-xs text-slate-500 mt-1">or click to browse</p>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSimulateUpload}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center"
              >
                {isUploading ? 'Processing...' : 'Simulate Import'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ records }: { records: ImageRecord[] }) {
  const handleExport = () => {
    // Simple CSV generation
    const headers = ['CUST ID', 'TAB ID', 'Title', 'BU', 'Status', 'Created By', 'Created At'];
    const rows = records.map(r => [
      r.custId, r.tabId || '', `"${r.title}"`, r.bu, r.status, r.createdBy, r.createdAt
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "governance_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Governance Reports</h2>
          <p className="text-slate-500 mt-1">Exportable audit view of all library records.</p>
        </div>
        <button onClick={handleExport} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-sm font-medium flex items-center shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CUST ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">TAB ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">BU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created By</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-slate-900">{record.custId}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-slate-500">{record.tabId || '-'}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500">{record.bu}</td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    record.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    record.status === 'Archived' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500">{record.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminSettingsView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Library Settings (DRD Only)</h2>
        <p className="text-slate-500 mt-1">Master configuration and schema management.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-8">
        
        <section>
          <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2 mb-4">Metadata Schema</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
              <div><span className="font-medium text-sm">CUST ID</span> <span className="text-xs text-slate-500 ml-2">String (Required, Unique)</span></div>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">System Field</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
              <div><span className="font-medium text-sm">TAB ID</span> <span className="text-xs text-slate-500 ml-2">String (Optional)</span></div>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">System Field</span>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:underline flex items-center mt-2">
              <Plus className="w-4 h-4 mr-1" /> Add Custom Field
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-red-600 border-b border-slate-200 pb-2 mb-4">Danger Zone</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
            <div>
              <h4 className="font-medium text-red-900">Delete Library Structure</h4>
              <p className="text-sm text-red-700 mt-1 max-w-md">
                Permanently removes the entire SharePoint list structure. This action is locked per governance policy.
              </p>
            </div>
            <button disabled className="bg-red-200 text-red-400 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed" title="Locked by Master Governance Config">
              Delete Library
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
