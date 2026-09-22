import { useEffect, useState } from 'react'
import { Check, ChevronDown, CirclePlus, ClipboardList, FolderKanban, LogOut, Menu, MoreHorizontal, PanelLeftClose, Plus, Search, Settings2, Sparkles, Trash2, UserPlus, Users, X } from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
const roles = ['workspace_admin', 'project_manager', 'developer', 'viewer', 'guest']
const statuses = ['todo', 'in_progress', 'blocked', 'done']
const priorities = ['low', 'medium', 'high', 'urgent']

async function api(path, options = {}, retry = true) {
  const token = localStorage.getItem('flowforge_access_token')
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
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

function Avatar({ user }) {
  const name = user ? `${user.firstName || ''} ${user.lastName || ''}` : 'User'
  return <span className="avatar avatar-mint">{name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value })
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) }, false)
      localStorage.setItem('flowforge_access_token', data.accessToken)
      localStorage.setItem('flowforge_user', JSON.stringify(data.user))
      onAuthenticated(data.user)
    } catch (requestError) { setError(requestError.message) } finally { setBusy(false) }
  }
  return <main className="auth-shell"><section className="auth-art"><div className="auth-brand"><span className="brand-mark"><Sparkles size={17} /></span> flowforge</div><div className="auth-copy"><span className="eyebrow"><span className="live-dot" /> Task and workspace management</span><h1>Make the work<br /><em>flow.</em></h1><p>Manage your workspaces, projects, tasks, and team access in one focused place.</p></div></section><section className="auth-panel"><div className="auth-form-wrap"><div className="mobile-auth-brand"><span className="brand-mark"><Sparkles size={17} /></span> flowforge</div><span className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create an account'}</span><h2>{mode === 'login' ? 'Sign in to FlowForge' : 'Create your account'}</h2><p className="auth-subtitle">Use your FlowForge API account to continue.</p><form onSubmit={submit}>{mode === 'register' && <div className="form-grid"><label>First name<input required value={form.firstName} onChange={update('firstName')} /></label><label>Last name<input required value={form.lastName} onChange={update('lastName')} /></label></div>}<label>Email address<input type="email" required value={form.email} onChange={update('email')} /></label><label>Password<input type="password" required value={form.password} onChange={update('password')} /></label>{mode === 'register' && <p className="field-hint">Use 8+ characters with uppercase, lowercase, number, and special character.</p>}{error && <div className="form-error">{error}</div>}<button className="button button-dark auth-submit" disabled={busy}>{busy ? 'Connecting...' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form><div className="auth-switch">{mode === 'login' ? 'New to FlowForge?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></div></div></section></main>
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('flowforge_user') || 'null'))
  const [authChecked, setAuthChecked] = useState(false)
  const [workspaces, setWorkspaces] = useState([])
  const [workspace, setWorkspace] = useState(null)
  const [projects, setProjects] = useState([])
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModalState] = useState(null)
  const setModal = (nextModal) => setModalState(nextModal?.type === 'members' ? { ...nextModal, type: 'member' } : nextModal)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('flowforge_access_token')) { setAuthChecked(true); return }
    api('/workspaces').then(() => setAuthChecked(true)).catch(() => { localStorage.clear(); setUser(null); setAuthChecked(true) })
  }, [])

  useEffect(() => {
    if (!user) return
    loadWorkspaces()
  }, [user])

  async function loadWorkspaces() {
    try {
      const data = await api('/workspaces')
      setWorkspaces(data.workspaces || [])
      if (data.workspaces?.length) {
        const selectedWorkspace = data.workspaces.find((item) => item._id === workspace?._id) || data.workspaces[0]
        selectWorkspace(selectedWorkspace._id)
      }
      else { setWorkspace(null); setProjects([]); setProject(null); setTasks([]) }
    } catch (requestError) { setError(requestError.message) }
  }

  async function selectWorkspace(workspaceId) {
    if (!workspaceId) return
    setLoading(true); setSidebarOpen(false)
    try {
      const [workspaceData, projectData] = await Promise.all([api(`/workspaces/${workspaceId}`), api(`/workspaces/${workspaceId}/projects` )])
      setWorkspace(workspaceData.workspace)
      setProjects(projectData.projects || [])
      if (projectData.projects?.length) selectProject(projectData.projects[0])
      else { setProject(null); setTasks([]) }
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }

  async function selectProject(nextProject) {
    setProject(nextProject); setFilter('all')
    try { const data = await api(`/projects/${nextProject._id}/tasks`); setTasks(data.tasks || []) } catch (requestError) { setError(requestError.message) }
  }

  async function submitWorkspace(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    try { await api(workspace ? `/workspaces/${workspace._id}` : '/workspaces', { method: workspace && modal.mode === 'edit' ? 'PATCH' : 'POST', body: JSON.stringify({ name: form.get('name'), description: form.get('description') || '' }) }); closeModal(); setNotice(workspace && modal.mode === 'edit' ? 'Workspace updated' : 'Workspace created'); await loadWorkspaces() } catch (requestError) { setError(requestError.message) }
  }

  async function submitProject(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const editing = modal.mode === 'edit'
    try { const data = await api(editing ? `/projects/${project._id}` : `/workspaces/${workspace._id}/projects`, { method: editing ? 'PATCH' : 'POST', body: JSON.stringify({ name: form.get('name'), description: form.get('description') || '', status: form.get('status') }) }); closeModal(); setNotice(editing ? 'Project updated' : 'Project created'); await refreshProjects(editing ? data.project._id : data.project._id) } catch (requestError) { setError(requestError.message) }
  }

  async function refreshProjects(selectedId = project?._id) {
    const data = await api(`/workspaces/${workspace._id}/projects`); setProjects(data.projects || [])
    const next = data.projects?.find((item) => item._id === selectedId) || data.projects?.[0]
    if (next) await selectProject(next); else { setProject(null); setTasks([]) }
  }

  async function submitTask(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const editing = modal.mode === 'edit'
    const payload = { title: form.get('title'), description: form.get('description') || '', status: form.get('status'), priority: form.get('priority'), dueDate: form.get('dueDate') || null }
    if (modal.mode === 'create') payload.assignee = user.id
    try { const data = await api(editing ? `/tasks/${modal.task._id}` : `/projects/${project._id}/tasks`, { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); closeModal(); setNotice(editing ? 'Task updated' : 'Task created'); setTasks((current) => editing ? current.map((item) => item._id === data.task._id ? data.task : item) : [data.task, ...current]) } catch (requestError) { setError(requestError.message) }
  }

  async function addMember(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    try { const data = await api(`/workspaces/${workspace._id}/members`, { method: 'POST', body: JSON.stringify({ email: form.get('email'), role: form.get('role') }) }); setWorkspace(data.workspace); closeModal(); setNotice('Member added') } catch (requestError) { setError(requestError.message) }
  }

  async function removeResource(type, item) {
    if (!window.confirm(`Delete this ${type}? This cannot be undone.`)) return
    try {
      await api(type === 'workspace' ? `/workspaces/${item._id}` : type === 'project' ? `/projects/${item._id}` : type === 'member' ? `/workspaces/${workspace._id}/members/${item._id}` : `/tasks/${item._id}`, { method: 'DELETE' })
      setNotice(`${type[0].toUpperCase()}${type.slice(1)} deleted`)
      if (type === 'workspace') { await loadWorkspaces() } else if (type === 'project') { await refreshProjects() } else if (type === 'member') { const data = await api(`/workspaces/${workspace._id}`); setWorkspace(data.workspace) } else { setTasks((current) => current.filter((task) => task._id !== item._id)) }
    } catch (requestError) { setError(requestError.message) }
  }

  async function toggleTask(task) { try { const data = await api(`/tasks/${task._id}`, { method: 'PATCH', body: JSON.stringify({ status: task.status === 'done' ? 'todo' : 'done' }) }); setTasks((current) => current.map((item) => item._id === task._id ? data.task : item)) } catch (requestError) { setError(requestError.message) } }
  function closeModal() { setModal(null) }
  function logout() { api('/auth/logout', { method: 'POST' }).catch(() => {}).finally(() => { localStorage.clear(); setUser(null) }) }

  if (!authChecked) return <div className="loading-screen">Connecting to FlowForge...</div>
  if (!user) return <AuthScreen onAuthenticated={setUser} />

  const visibleTasks = tasks.filter((task) => (filter === 'all' || task.status === filter) && task.title.toLowerCase().includes(search.toLowerCase()))
  const counts = { all: tasks.length, todo: tasks.filter((task) => task.status === 'todo').length, in_progress: tasks.filter((task) => task.status === 'in_progress').length, blocked: tasks.filter((task) => task.status === 'blocked').length, done: tasks.filter((task) => task.status === 'done').length }

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}><div className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>flowforge</span><button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)}><PanelLeftClose size={17} /></button></div><div className="workspace-picker"><div className="workspace-icon">W</div><div className="workspace-name"><span>Workspace</span><strong>{workspace?.name || 'No workspace'}</strong></div><ChevronDown size={15} /><select value={workspace?._id || ''} onChange={(event) => selectWorkspace(event.target.value)}><option value="" disabled>Select workspace</option>{workspaces.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></div><nav className="primary-nav"><button className="nav-item active"><FolderKanban size={17} /> Projects</button><button className="nav-item" onClick={() => setModal({ type: 'member' })}><Users size={17} /> Members <span className="nav-count">{workspace?.members?.length || 0}</span></button></nav><div className="side-label"><span>Projects</span><button className="icon-button" onClick={() => setModal({ type: 'project', mode: 'create' })} disabled={!workspace}><Plus size={15} /></button></div><nav className="project-nav">{projects.map((item) => <button key={item._id} className={`project-link ${item._id === project?._id ? 'selected' : ''}`} onClick={() => selectProject(item)}><span className={`project-dot dot-${item.status}`} />{item.name}</button>)}</nav><button className="profile profile-button" onClick={logout}><Avatar user={user} /><div><strong>{user.firstName} {user.lastName}</strong><span>Sign out</span></div><LogOut size={16} /></button></aside>
    <main className="main-content"><header className="topbar"><button className="icon-button menu-button" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button><div className="breadcrumbs"><span>{workspace?.name || 'Workspace'}</span><span>/</span><strong>{project?.name || 'Projects'}</strong></div><div className="top-actions"><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" /></div></div></header><div className="content-wrap">{error && <div className="request-error"><span>{error}</span><button onClick={() => setError('')}><X size={14} /></button></div>}{notice && <div className="notice"><span><Check size={14} /> {notice}</span><button onClick={() => setNotice('')}><X size={14} /></button></div>}<div className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> Backend resources</div><h1>{workspace ? workspace.name : 'Your workspaces'}</h1><p>{project ? project.description || 'Manage tasks in this project.' : 'Create a workspace to begin managing projects and tasks.'}</p></div><button className="button button-dark" onClick={() => setModal({ type: workspace ? 'task' : 'workspace', mode: 'create' })}><CirclePlus size={17} /> {workspace ? 'New task' : 'Create workspace'}</button></div>{workspace ? <><div className="resource-toolbar"><div className="resource-tabs">{[['all', 'All'], ['todo', 'To do'], ['in_progress', 'In progress'], ['blocked', 'Blocked'], ['done', 'Done']].map(([value, label]) => <button className={filter === value ? 'active' : ''} key={value} onClick={() => setFilter(value)}>{label}<span>{counts[value]}</span></button>)}</div><div className="toolbar-actions"><button className="button button-light" onClick={() => setModal({ type: 'member' })}><UserPlus size={15} /> Add member</button><button className="icon-button" onClick={() => setModal({ type: 'workspace', mode: 'edit' })}><MoreHorizontal size={18} /></button></div></div><section className="resource-layout"><div className="panel task-panel"><div className="panel-header"><div><div className="section-kicker"><span className="section-dot" /> {project?.name || 'Select a project'}</div><h2>{project ? 'Tasks' : 'No project selected'}</h2><p>{loading ? 'Loading backend data...' : `${tasks.length} task${tasks.length === 1 ? '' : 's'} in this project`}</p></div>{project && <div className="panel-actions"><button className="icon-button" onClick={() => setModal({ type: 'project', mode: 'edit' })}><Settings2 size={16} /></button><button className="icon-button danger" onClick={() => removeResource('project', project)}><Trash2 size={16} /></button></div>}</div>{project ? <div className="task-list">{visibleTasks.map((task) => <article className={`task-row ${task.status === 'done' ? 'task-complete' : ''}`} key={task._id}><button className={`task-check ${task.status === 'done' ? 'checked' : ''}`} onClick={() => toggleTask(task)}>{task.status === 'done' && <Check size={13} />}</button><button className="task-body task-button" onClick={() => setModal({ type: 'task', mode: 'edit', task })}><strong>{task.title}</strong><div className="task-meta"><span className={`priority priority-${task.priority}`}>{task.priority}</span><span>{task.status.replace('_', ' ')}</span></div></button><button className="icon-button row-more" onClick={() => removeResource('task', task)}><Trash2 size={15} /></button></article>)}{!visibleTasks.length && <div className="empty-state"><ClipboardList size={24} /><strong>No tasks yet</strong><span>Create a task to start tracking work.</span></div>}<button className="add-task-link" onClick={() => setModal({ type: 'task', mode: 'create' })}><Plus size={16} /> Add task</button></div> : <div className="empty-state"><FolderKanban size={24} /><strong>Select or create a project</strong><span>Projects belong to this workspace.</span></div>}</div><aside className="panel members-panel"><div className="panel-header"><div><div className="section-kicker"><span className="section-dot section-dot-blue" /> Access</div><h2>Members</h2></div><button className="icon-button" onClick={() => setModal({ type: 'member' })}><UserPlus size={16} /></button></div>{workspace.members?.map((member) => <div className="member-row" key={member.user?._id || member.user}>{member.user?.firstName ? <Avatar user={member.user} /> : <span className="avatar avatar-plum">U</span>}<div><strong>{member.user?.firstName || 'Member'} {member.user?.lastName || ''}</strong><span>{member.role}</span></div>{member.user?._id !== workspace.owner && <button className="icon-button" onClick={() => removeResource('member', { _id: member.user?._id })}><Trash2 size={14} /></button>}</div>)}{!workspace.members?.length && <div className="empty-state small"><Users size={20} /><span>No members loaded.</span></div>}</aside></section></> : <div className="empty-workspace"><FolderKanban size={34} /><h2>No workspace yet</h2><p>Create your first workspace to unlock projects, tasks, and member access.</p><button className="button button-dark" onClick={() => setModal({ type: 'workspace', mode: 'create' })}>Create workspace</button></div>}</div></main>
    {modal?.type === 'workspace' && <div className="modal-backdrop" onMouseDown={closeModal}><form className="modal" onSubmit={submitWorkspace} onMouseDown={(event) => event.stopPropagation()}><ModalHeading title={modal.mode === 'edit' ? 'Edit workspace' : 'Create workspace'} close={closeModal} /><label>Name<input name="name" required defaultValue={modal.mode === 'edit' ? workspace?.name : ''} /></label><label>Description<input name="description" defaultValue={modal.mode === 'edit' ? workspace?.description : ''} /></label><ModalActions /></form></div>}
    {modal?.type === 'project' && <div className="modal-backdrop" onMouseDown={closeModal}><form className="modal" onSubmit={submitProject} onMouseDown={(event) => event.stopPropagation()}><ModalHeading title={modal.mode === 'edit' ? 'Edit project' : 'Create project'} close={closeModal} /><label>Name<input name="name" required defaultValue={modal.mode === 'edit' ? project?.name : ''} /></label><label>Description<input name="description" defaultValue={modal.mode === 'edit' ? project?.description : ''} /></label><label>Status<select name="status" defaultValue={modal.mode === 'edit' ? project?.status : 'planned'}>{['planned', 'active', 'completed', 'archived'].map((status) => <option key={status}>{status}</option>)}</select></label><ModalActions /></form></div>}
    {modal?.type === 'task' && <div className="modal-backdrop" onMouseDown={closeModal}><form className="modal" onSubmit={submitTask} onMouseDown={(event) => event.stopPropagation()}><ModalHeading title={modal.mode === 'edit' ? 'Edit task' : 'Create task'} close={closeModal} /><label>Title<input name="title" required defaultValue={modal.mode === 'edit' ? modal.task.title : ''} /></label><label>Description<input name="description" defaultValue={modal.mode === 'edit' ? modal.task.description : ''} /></label><div className="form-grid"><label>Status<select name="status" defaultValue={modal.mode === 'edit' ? modal.task.status : 'todo'}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label>Priority<select name="priority" defaultValue={modal.mode === 'edit' ? modal.task.priority : 'medium'}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label></div><label>Due date<input name="dueDate" type="date" defaultValue={modal.mode === 'edit' && modal.task.dueDate ? modal.task.dueDate.slice(0, 10) : ''} /></label><ModalActions /></form></div>}
    {modal?.type === 'member' && <div className="modal-backdrop" onMouseDown={closeModal}><form className="modal" onSubmit={addMember} onMouseDown={(event) => event.stopPropagation()}><ModalHeading title="Add member" close={closeModal} /><label>Email<input name="email" required type="email" placeholder="teammate@example.com" /></label><label>Role<select name="role" defaultValue="developer">{roles.map((role) => <option key={role}>{role}</option>)}</select></label><ModalActions /></form></div>}
  </div>
}

function ModalHeading({ title, close }) { return <div className="modal-heading"><h2>{title}</h2><button type="button" className="icon-button" onClick={close}><X size={18} /></button></div> }
function ModalActions() { return <div className="modal-actions"><button type="submit" className="button button-dark">Save</button></div> }

export default App
