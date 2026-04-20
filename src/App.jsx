import React, { useState, useEffect, createContext, useContext } from 'react';

// ---------------------------------------------------------
// 1. CONTEXT
// ---------------------------------------------------------
const AppContext = createContext();

function AppProvider({ children }) {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('smarttracker_jobs_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem('smarttracker_jobs_v2', JSON.stringify(jobs));
  }, [jobs]);

  let toastTimer;
  function showToast(msg) {
    clearTimeout(toastTimer);
    setToast(msg);
    toastTimer = setTimeout(() => setToast(''), 2800);
  }

  function addJob(newJob) {
    setJobs(prev => [
      ...prev,
      {
        ...newJob,
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      },
    ]);
    showToast('Application added!');
  }

  function deleteJob(id) {
    setJobs(prev => prev.filter(j => j.id !== id));
    showToast('Removed.');
  }

  return (
    <AppContext.Provider value={{ jobs, addJob, deleteJob, toast }}>
      {children}
    </AppContext.Provider>
  );
}

// ---------------------------------------------------------
// 2. ICONS (inline SVG helpers)
// ---------------------------------------------------------
const Icon = ({ d, size = 15 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

// ---------------------------------------------------------
// 3. SIDEBAR
// ---------------------------------------------------------
const TABS = [
  {
    id: 'dash',
    label: 'Dashboard',
    d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10',
  },
  {
    id: 'list',
    label: 'Applications',
    d: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  },
  {
    id: 'add',
    label: 'Add new',
    d: 'M12 5v14M5 12h14',
  },
];

function Sidebar({ activeTab, setActiveTab, total }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="logo-text">SmartTracker</span>
      </div>

      <nav className="sidebar-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon d={tab.d} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {total} application{total !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 4. TOPBAR
// ---------------------------------------------------------
function Topbar({ tab, total }) {
  const map = {
    dash: { title: 'Dashboard', sub: 'Overview' },
    list: { title: 'Applications', sub: `${total} total` },
    add:  { title: 'New application', sub: 'Track a job' },
  };
  const { title, sub } = map[tab];
  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      <span className="topbar-badge">{sub}</span>
    </div>
  );
}

// ---------------------------------------------------------
// 5. BADGE
// ---------------------------------------------------------
function Badge({ status }) {
  const cls =
    status === 'Interviewing' ? 'badge badge-interviewing' :
    status === 'Offer'        ? 'badge badge-offer' :
                                'badge badge-applied';
  return <span className={cls}>{status}</span>;
}

// ---------------------------------------------------------
// 6. DASHBOARD
// ---------------------------------------------------------
function Dashboard({ setTab }) {
  const { jobs } = useContext(AppContext);
  const total      = jobs.length;
  const interviews = jobs.filter(j => j.status === 'Interviewing').length;
  const offers     = jobs.filter(j => j.status === 'Offer').length;
  const applied    = jobs.filter(j => j.status === 'Applied').length;
  const recent     = [...jobs].reverse().slice(0, 4);

  const pipeline = [
    { label: 'Applied',      count: applied,    color: '#3b82f6' },
    { label: 'Interviewing', count: interviews,  color: '#f59e0b' },
    { label: 'Offer',        count: offers,      color: '#22c55e' },
  ];

  return (
    <div className="content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
            </svg>
          </div>
          <span className="stat-label">Total</span>
          <span className="stat-value">{total}</span>
          <span className="stat-sub">applications tracked</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <span className="stat-label">Interviews</span>
          <span className="stat-value">{interviews}</span>
          <span className="stat-sub">in progress</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <span className="stat-label">Offers</span>
          <span className="stat-value">{offers}</span>
          <span className="stat-sub">received</span>
        </div>
      </div>

      <div className="overview-row">
        <div className="mini-card">
          <div className="mini-card-title">Pipeline</div>
          {pipeline.map(p => (
            <div className="pipeline-row" key={p.label}>
              <span className="pipeline-label">{p.label}</span>
              <div className="pipeline-bar-wrap">
                <div
                  className="pipeline-bar"
                  style={{ width: total ? `${Math.round((p.count / total) * 100)}%` : '0%', background: p.color }}
                />
              </div>
              <span className="pipeline-count">{p.count}</span>
            </div>
          ))}
        </div>

        <div className="mini-card">
          <div className="mini-card-title">Recent</div>
          {recent.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No applications yet</p>
          ) : (
            recent.map(j => (
              <div className="recent-item" key={j.id}>
                <div>
                  <div className="recent-company">{j.company}</div>
                  <div className="recent-role">{j.role}</div>
                </div>
                <Badge status={j.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 7. JOB TABLE
// ---------------------------------------------------------
function JobTable({ setTab }) {
  const { jobs, deleteJob } = useContext(AppContext);
  return (
    <div className="content">
      <div className="section-header">
        <span className="section-title">
          {jobs.length} application{jobs.length !== 1 ? 's' : ''}
        </span>
        <button className="section-action" onClick={() => setTab('add')}>
          + Add new
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="empty">
          No applications yet.<br />Add your first one.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td style={{ fontWeight: 500 }}>{job.company}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{job.role}</td>
                  <td><Badge status={job.status} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{job.date || '—'}</td>
                  <td>
                    <button className="btn-delete" onClick={() => deleteJob(job.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// 8. ADD JOB FORM
// ---------------------------------------------------------
function AddJobForm({ setTab }) {
  const { addJob } = useContext(AppContext);
  const [form, setForm] = useState({ company: '', role: '', status: 'Applied' });

  function handleSubmit() {
    if (!form.company.trim() || !form.role.trim()) return;
    addJob(form);
    setForm({ company: '', role: '', status: 'Applied' });
    setTab('list');
  }

  function handleKeyDown(e, nextId) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextId) document.getElementById(nextId)?.focus();
      else handleSubmit();
    }
  }

  return (
    <div className="content">
      <div className="section-header" style={{ marginBottom: 16 }}>
        <span className="section-title">New application</span>
      </div>

      <div className="form-card">
        <div className="form-group">
          <label className="form-label" htmlFor="f-company">Company</label>
          <input
            id="f-company"
            className="form-input"
            placeholder="e.g. Stripe"
            value={form.company}
            onChange={e => setForm({ ...form, company: e.target.value })}
            onKeyDown={e => handleKeyDown(e, 'f-role')}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-role">Role</label>
          <input
            id="f-role"
            className="form-input"
            placeholder="e.g. Frontend Engineer"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            onKeyDown={e => handleKeyDown(e, null)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-status">Status</label>
          <select
            id="f-status"
            className="form-select"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <option>Applied</option>
            <option>Interviewing</option>
            <option>Offer</option>
          </select>
        </div>

        <button className="btn-primary" onClick={handleSubmit}>
          Save application
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 9. TOAST
// ---------------------------------------------------------
function Toast() {
  const { toast } = useContext(AppContext);
  return (
    <div className={`toast${toast ? ' show' : ''}`}>
      {toast}
    </div>
  );
}

// ---------------------------------------------------------
// 10. MAIN APP
// ---------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState('dash');

  return (
    <AppProvider>
      <AppInner activeTab={activeTab} setActiveTab={setActiveTab} />
    </AppProvider>
  );
}

function AppInner({ activeTab, setActiveTab }) {
  const { jobs } = useContext(AppContext);

  return (
    <div className="layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} total={jobs.length} />

      <div className="main">
        <Topbar tab={activeTab} total={jobs.length} />

        {activeTab === 'dash' && <Dashboard setTab={setActiveTab} />}
        {activeTab === 'list' && <JobTable setTab={setActiveTab} />}
        {activeTab === 'add'  && <AddJobForm setTab={setActiveTab} />}
      </div>

      <Toast />
    </div>
  );
}