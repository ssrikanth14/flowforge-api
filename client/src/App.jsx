import { useEffect, useMemo, useState } from 'react'
import { Archive, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown, CircleHelp, CirclePlus, ClipboardList, Clock3, LayoutDashboard, LogOut, Menu, MoreHorizontal, PanelLeftClose, Plus, Search, Settings2, Sparkles, Users, X } from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
const statusLabels = { todo: 'To do', in_progress: 'In progress', blocked: 'Blocked', done: 'Done' }

async function api(path, options = {}, retry = true) {
  const accessToken = localStorage.getItem('flowforge_access_token')
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  const body = await response.json().catch(() => ({}))
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    try {
      const refreshed = await api('/auth/refresh', { method: 'POST' }, false)
      localStorage.setItem('flowforge_access_token', refreshed.accessToken)
      return api(path, options, false)
    } catch {
      localStorage.removeItem('flowforge_access_token')
      localStorage.removeItem('flowforge_user')
    }
  }
  if (!response.ok) throw new Error(body.message || 'Request failed')
  return body.data
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) }, false)
      localStorage.setItem('flowforge_access_token', data.accessToken)
      localStorage.setItem('flowforge_user', JSON.stringify(data.user))
      onAuthenticated(data.user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="auth-shell"><section className="auth-art"><div className="auth-brand"><span className="brand-mark"><Sparkles size={17} /></span> flowforge</div><div className="auth-copy"><span className="eyebrow"><span className="live-dot" /> Workspace intelligence</span><h1>Make the work<br /><em>flow.</em></h1><p>A focused command center for teams turning ambitious plans into finished work.</p></div><div className="auth-orbit"><span /><span /><span /></div></section><section className="auth-panel"><div className="auth-form-wrap"><div className="mobile-auth-brand"><span className="brand-mark"><Sparkles size={17} /></span> flowforge</div><span className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Start your workspace'}</span><h2>{mode === 'login' ? 'Sign in to FlowForge' : 'Create your account'}</h2><p className="auth-subtitle">{mode === 'login' ? 'Pick up where your team left off.' : 'Your team’s next chapter starts here.'}</p><form onSubmit={submit}>{mode === 'register' && <div className="form-grid"><label>First name<input required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label><label>Last name<input required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label></div>}<label>Email address<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Password<input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>{error && <div className="form-error">{error}</div>}<button className="button button-dark auth-submit" disabled={busy}>{busy ? 'Connecting...' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={16} /></button></form><div className="auth-switch">{mode === 'login' ? 'New to FlowForge?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></div></div></section></main>
}

function Avatar({ name = 'FF', tone = 'plum' }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  return <span className={`avatar avatar-${tone}`}>{initials}</span>
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('flowforge_user') || 'null'))
  const [authChecked, setAuthChecked] = useState(false)
  const [workspaces, setWorkspaces] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [requestError, setRequestError] = useState('')

  const activeProject = projects.find((project) => project._id === projectId) || projects[0]
  const visibleTasks = useMemo(() => tasks.filter((task) => (filter === 'all' || task.status === filter) && task.title.toLowerCase().includes(search.toLowerCase())), [filter, search, tasks])
  const counts = { all: tasks.length, in_progress: tasks.filter((task) => task.status === 'in_progress').length, todo: tasks.filter((task) => task.status === 'todo').length, done: tasks.filter((task) => task.status === 'done').length }

  useEffect(() => {
    if (!localStorage.getItem('flowforge_access_token')) {
      setAuthChecked(true)
      return
    }
    api('/workspaces').then(() => setAuthChecked(true)).catch(() => {
      localStorage.removeItem('flowforge_access_token')
      localStorage.removeItem('flowforge_user')
      setUser(null)
      setAuthChecked(true)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    let mounted = true
    api('/workspaces').then((data) => {
      if (!mounted) return
      const nextWorkspaces = data?.workspaces || []
      setWorkspaces(nextWorkspaces)
      setWorkspaceId(nextWorkspaces[0]?._id || '')
      setNotice(nextWorkspaces.length ? 'Connected to FlowForge API' : 'Create your first workspace to get started')
    }).catch((error) => setRequestError(error.message))
    return () => { mounted = false }
  }, [user])
  useEffect(() => {
    if (!workspaceId) return
    api(`/workspaces/${workspaceId}/projects`).then((data) => {
      const nextProjects = data?.projects || []
      setProjects(nextProjects)
      setProjectId(nextProjects[0]?._id || '')
    }).catch((error) => setRequestError(error.message))
  }, [workspaceId])
  useEffect(() => {
    if (!projectId || projectId.startsWith('local-')) { setTasks([]); return }
    api(`/projects/${projectId}/tasks`).then((data) => setTasks(data?.tasks || [])).catch((error) => setRequestError(error.message))
  }, [projectId])

  if (!authChecked) return <div className="loading-screen">Connecting to FlowForge...</div>
  if (!user) return <AuthScreen onAuthenticated={setUser} />

  function createTask(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (!projectId) {
      setRequestError('Create a project before adding tasks.')
      return
    }
    api(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify({ title: form.get('title'), priority: form.get('priority'), dueDate: form.get('dueDate') || null }) }).then((data) => {
      setTasks((current) => [data.task, ...current])
      setModal(null); setNotice('Task added to the sprint')
    }).catch((error) => setRequestError(error.message))
  }
  function toggleTask(taskId) {
    const task = tasks.find((item) => item._id === taskId)
    if (!task) return
    api(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ status: task.status === 'done' ? 'todo' : 'done' }) }).then((data) => {
      setTasks((current) => current.map((item) => item._id === taskId ? data.task : item))
    }).catch((error) => setRequestError(error.message))
  }
  function logout() {
    api('/auth/logout', { method: 'POST' }).catch(() => {}).finally(() => {
      localStorage.removeItem('flowforge_access_token')
      localStorage.removeItem('flowforge_user')
      setUser(null)
    })
  }
  function createProject(event) {
    event.preventDefault()
    const name = new FormData(event.currentTarget).get('name')
    if (!workspaceId) {
      setRequestError('Create a workspace before adding projects.')
      return
    }
    api(`/workspaces/${workspaceId}/projects`, { method: 'POST', body: JSON.stringify({ name, description: 'New workspace project' }) }).then((data) => {
      setProjects((current) => [...current, data.project])
      setProjectId(data.project._id)
      setModal(null)
      setNotice('Project created')
    }).catch((error) => setRequestError(error.message))
  }
  function createWorkspace(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    api('/workspaces', { method: 'POST', body: JSON.stringify({ name: form.get('name'), description: form.get('description') || '' }) }).then((data) => {
      const workspace = data.workspace
      setWorkspaces((current) => [...current, workspace])
      setWorkspaceId(workspace._id)
      setModal(null)
      setNotice('Workspace created')
    }).catch((error) => setRequestError(error.message))
  }

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>flowforge</span><button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><PanelLeftClose size={17} /></button></div>
      <div className="workspace-picker"><div className="workspace-icon">A</div><div className="workspace-name"><span>Workspace</span><strong>{workspaces.find((item) => item._id === workspaceId)?.name || 'No workspace yet'}</strong></div><ChevronDown size={15} /><select value={workspaceId} onChange={(event) => { setWorkspaceId(event.target.value); setSidebarOpen(false); setNotice('Workspace switched') }} aria-label="Select workspace"><option value="" disabled>Select workspace</option>{workspaces.map((workspace) => <option key={workspace._id} value={workspace._id}>{workspace.name}</option>)}</select></div>
      <nav className="primary-nav"><button className="nav-item active"><LayoutDashboard size={17} /> Overview</button><button className="nav-item"><ClipboardList size={17} /> My work <span className="nav-count">4</span></button><button className="nav-item"><CalendarDays size={17} /> Timeline</button><button className="nav-item"><Users size={17} /> People</button></nav>
      <div className="side-label"><span>Projects</span><button className="icon-button" onClick={() => setModal('project')} aria-label="Create project" disabled={!workspaceId}><Plus size={15} /></button></div>
      <nav className="project-nav">{projects.map((project) => <button key={project._id} className={`project-link ${project._id === projectId ? 'selected' : ''}`} onClick={() => setProjectId(project._id)}><span className={`project-dot dot-${project.status}`} />{project.name}<span className="project-meta">{project._id === projectId ? visibleTasks.length : ''}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings2 size={17} /> Settings</button><button className="nav-item"><CircleHelp size={17} /> Help center</button></div>
        <button className="profile profile-button" onClick={logout}><Avatar name={`${user?.firstName || 'Maya'} ${user?.lastName || 'Chen'}`} tone="mint" /><div><strong>{user?.firstName || 'Maya'} {user?.lastName || 'Chen'}</strong><span>Sign out</span></div><LogOut size={16} /></button>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={19} /></button><div className="breadcrumbs"><span>Acme Design</span><span>/</span><strong>Overview</strong></div><div className="top-actions"><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" /><kbd>⌘ K</kbd></div><button className="icon-button"><Bell size={18} /><i className="notification-dot" /></button><button className="help-button"><CircleHelp size={17} /> Help</button></div></header>
      <div className="content-wrap">
          {requestError && <div className="request-error"><span>{requestError}</span><button onClick={() => setRequestError('')} aria-label="Dismiss error"><X size={14} /></button></div>}
        <div className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> Tuesday, September 22, 2026</div><h1>Good morning, {user?.firstName || 'there'} <span>✦</span></h1><p>Here’s the pulse of your workspace. Keep the momentum going.</p></div><button className="button button-dark" onClick={() => setModal(workspaceId ? 'task' : 'workspace')}><CirclePlus size={17} /> {workspaceId ? 'New task' : 'Create workspace'}</button></div>
        <div className="notice"><div><Check size={15} /><span>{notice}</span></div><button onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={14} /></button></div>
        <section className="stats-grid"><div className="stat-card"><div className="stat-icon"><ClipboardList size={18} /></div><span>Open tasks</span><strong>{counts.all - counts.done}</strong><small><ArrowUpRight size={13} /> 12% from last week</small><div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /><i /></div></div><div className="stat-card"><div className="stat-icon soft-lilac"><Clock3 size={18} /></div><span>In progress</span><strong>{counts.in_progress}</strong><small className="muted">Across 3 projects</small><div className="progress-line"><i /></div></div><div className="stat-card"><div className="stat-icon soft-peach"><Check size={18} /></div><span>Completed</span><strong>{counts.done}</strong><small className="muted">This week</small><div className="completion-ring"><b>68%</b></div></div><div className="stat-card"><div className="stat-icon soft-blue"><Users size={18} /></div><span>Team members</span><strong>8</strong><small className="muted">2 active right now</small><div className="avatar-stack"><Avatar name="Maya Chen" tone="mint" /><Avatar name="Owen Lee" tone="blue" /><Avatar name="Noah Park" tone="peach" /><span>+5</span></div></div></section>
        <section className="work-grid"><div className="panel task-panel"><div className="panel-header"><div><div className="section-kicker"><span className="section-dot" /> Focus area</div><h2>{activeProject?.name || 'Website refresh'}</h2><p>{activeProject?.description || 'Your current project priorities'}</p></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="task-toolbar"><div className="filter-tabs">{[['all', 'All'], ['in_progress', 'In progress'], ['todo', 'To do'], ['done', 'Done']].map(([value, label]) => <button className={filter === value ? 'active' : ''} key={value} onClick={() => setFilter(value)}>{label}<span>{counts[value]}</span></button>)}</div><button className="filter-button"><Archive size={15} /> Filter</button></div><div className="task-list">{visibleTasks.map((task) => <article className={`task-row ${task.status === 'done' ? 'task-complete' : ''}`} key={task._id}><button className={`task-check ${task.status === 'done' ? 'checked' : ''}`} onClick={() => toggleTask(task._id)} aria-label={`Mark ${task.title} complete`}>{task.status === 'done' && <Check size={13} />}</button><div className="task-body"><strong>{task.title}</strong><div className="task-meta"><span className={`priority priority-${task.priority}`}>{task.priority}</span><span><CalendarDays size={12} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}</span></div></div><div className="task-assignee"><Avatar name={`${task.assignee?.firstName || 'U'} ${task.assignee?.lastName || 'N'}`} tone={task.priority === 'urgent' ? 'peach' : 'blue'} /><span className="status-label">{statusLabels[task.status]}</span></div><button className="icon-button row-more" aria-label="Task options"><MoreHorizontal size={16} /></button></article>)}{!visibleTasks.length && <div className="empty-state"><Search size={22} /><strong>No tasks match that search</strong><span>Try a different project or filter.</span></div>}</div><button className="add-task-link" onClick={() => setModal('task')}><Plus size={16} /> Add a task</button></div>
          <div className="right-column"><div className="panel progress-panel"><div className="panel-header compact"><div><div className="section-kicker"><span className="section-dot section-dot-blue" /> Delivery</div><h2>Project health</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="health-score"><div className="score-ring"><strong>74</strong><span>/ 100</span></div><div><strong>Looking good</strong><p>On track for this sprint</p></div></div><div className="health-row"><span>Scope</span><strong>On track</strong><i className="health-green" /></div><div className="health-row"><span>Timeline</span><strong>At risk</strong><i className="health-yellow" /></div><div className="health-row"><span>Resources</span><strong>Healthy</strong><i className="health-green" /></div><button className="text-button">View project details <ArrowUpRight size={14} /></button></div><div className="panel activity-panel"><div className="panel-header compact"><div><div className="section-kicker"><span className="section-dot section-dot-peach" /> Activity</div><h2>Recent updates</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="activity-item"><Avatar name="Owen Lee" tone="blue" /><p><strong>Owen</strong> moved <b>Review navigation patterns</b> to In progress</p><time>12m</time></div><div className="activity-item"><Avatar name="Noah Park" tone="peach" /><p><strong>Noah</strong> commented on <b>Launch notes</b></p><time>1h</time></div><div className="activity-item"><Avatar name="Maya Chen" tone="mint" /><p>You completed <b>Archive outdated components</b></p><time>3h</time></div><button className="text-button">See all activity <ArrowUpRight size={14} /></button></div></div></section>
      </div>
    </main>
    {modal === 'task' && <div className="modal-backdrop" onMouseDown={() => setModal(null)}><form className="modal" onSubmit={createTask} onMouseDown={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">New work item</span><h2>Add a task</h2></div><button type="button" className="icon-button" onClick={() => setModal(null)}><X size={18} /></button></div><label>Task title<input name="title" placeholder="What needs to happen?" required autoFocus /></label><div className="form-grid"><label>Priority<select name="priority" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label>Due date<input name="dueDate" type="date" /></label></div><div className="modal-actions"><button type="button" className="button button-light" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="button button-dark">Create task</button></div></form></div>}
    {modal === 'project' && <div className="modal-backdrop" onMouseDown={() => setModal(null)}><form className="modal" onSubmit={createProject} onMouseDown={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">Workspace planning</span><h2>New project</h2></div><button type="button" className="icon-button" onClick={() => setModal(null)}><X size={18} /></button></div><label>Project name<input name="name" placeholder="e.g. Q4 launch" required autoFocus /></label><div className="modal-actions"><button type="button" className="button button-light" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="button button-dark">Create project</button></div></form></div>}
    {modal === 'workspace' && <div className="modal-backdrop" onMouseDown={() => setModal(null)}><form className="modal" onSubmit={createWorkspace} onMouseDown={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">Start organized</span><h2>Create workspace</h2></div><button type="button" className="icon-button" onClick={() => setModal(null)}><X size={18} /></button></div><label>Workspace name<input name="name" placeholder="e.g. Product team" required autoFocus /></label><label>Description<input name="description" placeholder="What is this workspace for?" /></label><div className="modal-actions"><button type="button" className="button button-light" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="button button-dark">Create workspace</button></div></form></div>}
  </div>
}
export default App
