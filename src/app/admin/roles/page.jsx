'use client';
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const GREEN = "#2f7d4f";
const RED = "#b23b3b";
const AMBER = "#b7791f";

export default function RolesAdminPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [editingRole, setEditingRole] = useState(null); // null means "creating"
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

  // Fetch roles and permissions from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pRes = await apiFetch("/admin/permissions");
      const rRes = await apiFetch("/admin/roles");

      if (pRes.ok && rRes.ok) {
        setPermissions(await pRes.json());
        setRoles(await rRes.json());
      } else {
        const data = await (!pRes.ok ? pRes : rRes).json().catch(() => ({}));
        setError(data.message || "Failed to load roles and permissions.");
      }
    } catch (e) {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (role) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || "");
    setSelectedPermissionIds(role.permissions.map(p => p.id));
    setSuccess(null);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setName("");
    setDescription("");
    setSelectedPermissionIds([]);
    setError(null);
  };

  const handlePermissionToggle = (id) => {
    setSelectedPermissionIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }

    setSuccess(null);
    setError(null);

    const payload = {
      name,
      description,
      permission_ids: selectedPermissionIds
    };

    try {
      const url = editingRole ? `/admin/roles/${editingRole.id}` : "/admin/roles";
      const method = editingRole ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingRole ? "Role updated successfully." : "Role created successfully.");
        handleCancelEdit();
        fetchData();
      } else {
        setError(data.message || "Failed to save role.");
      }
    } catch (err) {
      setError("Unable to reach the server. Please try again.");
    }
  };

  const handleDelete = async (id, roleName) => {
    if (roleName === "Super Admin") {
      setError("The Super Admin role cannot be deleted.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    setSuccess(null);
    setError(null);

    try {
      const res = await apiFetch(`/admin/roles/${id}`, { method: "DELETE" });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Role deleted successfully.");
        fetchData();
      } else {
        setError(data.message || "Failed to delete role.");
      }
    } catch (err) {
      setError("Unable to reach the server. Please try again.");
    }
  };

  return (
    <div className="roles-page">
      <style>{css}</style>
      
      <div className="page-head">
        <div>
          <span className="eyebrow">Authorization</span>
          <h1>System Roles</h1>
          <p className="sub">Define functional roles and group permissions to delegate system access.</p>
        </div>
      </div>

      {success && <div className="banner ok">{success}</div>}
      {error && <div className="banner bad">{error}</div>}

      <div className="grid">
        <div className="card list-card">
          <h3>Available Roles</h3>
          {loading ? (
            <div className="loading">Loading roles...</div>
          ) : error ? (
            <p className="no-data">Unable to load roles.</p>
          ) : roles.length === 0 ? (
            <p className="no-data">No roles have been created yet.</p>
          ) : (
            <div className="roles-list">
              {roles.map((role) => (
                <div key={role.id} className="role-item">
                  <div className="role-details">
                    <div className="role-name-row">
                      <span className="role-name">{role.name}</span>
                      {role.name === "Super Admin" && <span className="badge">System Core</span>}
                    </div>
                    <p className="role-desc">{role.description || "No description provided."}</p>
                    <div className="role-perms">
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.map(p => (
                          <span key={p.id} className="perm-tag" title={p.description}>
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="no-perms">No permissions assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="role-actions">
                    <button className="btn-edit" onClick={() => handleEditClick(role)}>Edit</button>
                    {role.name !== "Super Admin" && (
                      <button className="btn-delete" onClick={() => handleDelete(role.id, role.name)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card form-card">
          <h3>{editingRole ? `Edit Role: ${editingRole.name}` : "Create New Role"}</h3>
          
          <form onSubmit={handleSave} className="role-form">
            <div className="form-group">
              <label htmlFor="role-name">Role Name</label>
              <input
                id="role-name"
                type="text"
                placeholder="e.g. Finance Auditor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={editingRole && editingRole.name === "Super Admin"}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role-desc">Description</label>
              <textarea
                id="role-desc"
                placeholder="Describe what this role does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Assign Permissions</label>
              <p className="label-help">Check the permissions to attach to this role.</p>
              
              <div className="permissions-grid">
                {permissions.length === 0 ? (
                  <p className="no-data">No permissions exist yet. Create one on the Permissions page first.</p>
                ) : (
                  permissions.map((perm) => (
                    <label key={perm.id} className="perm-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                      />
                      <div className="perm-cb-label">
                        <span className="perm-cb-name">{perm.name}</span>
                        <span className="perm-cb-desc">{perm.description}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingRole ? "Update Role" : "Create Role"}
              </button>
              {editingRole && (
                <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const css = `
.roles-page {
  max-width: 1100px;
  margin: 0 auto;
}

.page-head {
  margin-bottom: 24px;
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 800;
}

.page-head h1 {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -.02em;
  margin: 6px 0 2px;
}

.sub {
  font-size: 14.5px;
  color: var(--body);
  margin: 0;
}

.banner {
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 20px;
}

.banner.ok {
  background: #eefaf1;
  border: 1px solid #cdeed9;
  color: ${GREEN};
}

.banner.bad {
  background: #fdecec;
  border: 1px solid #f5c6c6;
  color: ${RED};
}

.grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(15,23,42,.04);
}

.card h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 18px;
  color: var(--ink);
}

.loading {
  font-size: 14px;
  color: var(--muted);
  padding: 20px 0;
  text-align: center;
}

.no-data {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
  padding: 30px 0;
  margin: 0;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.role-item {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background: #fafafb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.role-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15,23,42,.03);
}

.role-details {
  flex: 1;
}

.role-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.role-name {
  font-size: 15.5px;
  font-weight: 700;
  color: var(--ink);
}

.badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: ${BLUE_DARK};
  background: #eef4fb;
  padding: 2px 6px;
  border-radius: 4px;
}

.role-desc {
  font-size: 13px;
  color: var(--body);
  margin: 0 0 10px;
  line-height: 1.45;
}

.role-perms {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.perm-tag {
  font-size: 11px;
  font-weight: 600;
  background: #fff;
  border: 1px solid var(--line);
  color: var(--body);
  padding: 2px 8px;
  border-radius: 999px;
}

.no-perms {
  font-size: 11.5px;
  color: var(--muted);
  font-style: italic;
}

.role-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
}

.btn-edit {
  background: #fff;
  border: 1px solid var(--line);
  color: var(--body);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit:hover {
  border-color: var(--blue);
  color: var(--blue);
  background: #f8fafc;
}

.btn-delete {
  background: #fff;
  border: 1px solid #f0d2d2;
  color: ${RED};
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #fdf2f2;
}

.role-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.label-help {
  font-size: 11.5px;
  color: var(--muted);
  margin: -4px 0 4px;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: var(--ink);
  transition: border-color 0.2s;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--blue);
}

.permissions-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 6px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px;
  background: #fafafb;
}

.perm-checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  padding: 6px 0;
  border-bottom: 1px solid #f1f3f6;
}

.perm-checkbox-item:last-child {
  border-bottom: none;
}

.perm-checkbox-item input {
  margin-top: 3px;
  accent-color: var(--blue);
}

.perm-cb-label {
  display: flex;
  flex-direction: column;
}

.perm-cb-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.perm-cb-desc {
  font-size: 11.5px;
  color: var(--muted);
  line-height: 1.35;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.btn-primary {
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: var(--blueDark);
}

.btn-secondary {
  background: #fff;
  border: 1px solid var(--line);
  color: var(--body);
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
}
`;
