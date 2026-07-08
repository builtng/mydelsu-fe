'use client';
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const GREEN = "#2f7d4f";
const RED = "#b23b3b";
const AMBER = "#b7791f";

const CORE_PERMISSIONS = ["manage_roles_permissions", "moderate_gratitudes", "manage_manna_draws", "correct_academic_details"];

export default function PermissionsAdminPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [editingPermission, setEditingPermission] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/admin/permissions");
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to load permissions.");
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

  const handleEditClick = (perm) => {
    setEditingPermission(perm);
    setName(perm.name);
    setDescription(perm.description || "");
    setSuccess(null);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingPermission(null);
    setName("");
    setDescription("");
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Permission name is required.");
      return;
    }

    setSuccess(null);
    setError(null);

    const payload = { name, description };

    try {
      const url = editingPermission ? `/admin/permissions/${editingPermission.id}` : "/admin/permissions";
      const method = editingPermission ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingPermission ? "Permission updated successfully." : "Permission created successfully.");
        handleCancelEdit();
        fetchData();
      } else {
        setError(data.message || "Failed to save permission.");
      }
    } catch (err) {
      setError("Unable to reach the server. Please try again.");
    }
  };

  const handleDelete = async (id, permName) => {
    if (permName === "manage_roles_permissions") {
      setError("The manage_roles_permissions permission cannot be deleted.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the permission "${permName}"?`)) {
      return;
    }

    setSuccess(null);
    setError(null);

    try {
      const res = await apiFetch(`/admin/permissions/${id}`, { method: "DELETE" });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Permission deleted successfully.");
        fetchData();
      } else {
        setError(data.message || "Failed to delete permission.");
      }
    } catch (err) {
      setError("Unable to reach the server. Please try again.");
    }
  };

  return (
    <div className="permissions-page">
      <style>{css}</style>
      
      <div className="page-head">
        <div>
          <span className="eyebrow">Authorization</span>
          <h1>System Permissions</h1>
          <p className="sub">Manage discrete capabilities that protect APIs and drive application gateways.</p>
        </div>
      </div>

      {success && <div className="banner ok">{success}</div>}
      {error && <div className="banner bad">{error}</div>}

      <div className="grid">
        <div className="card list-card">
          <h3>Registered Permissions</h3>
          {loading ? (
            <div className="loading">Loading permissions...</div>
          ) : error ? (
            <p className="no-data">Unable to load permissions.</p>
          ) : permissions.length === 0 ? (
            <p className="no-data">No permissions have been created yet.</p>
          ) : (
            <div className="permissions-list">
              {permissions.map((perm) => {
                const isCore = CORE_PERMISSIONS.includes(perm.name);
                return (
                  <div key={perm.id} className="perm-item">
                    <div className="perm-details">
                      <div className="perm-name-row">
                        <span className="perm-name">{perm.name}</span>
                        {isCore && <span className="badge core">System Core</span>}
                      </div>
                      <p className="perm-desc">{perm.description || "No description provided."}</p>
                    </div>
                    <div className="perm-actions">
                      <button className="btn-edit" onClick={() => handleEditClick(perm)}>Edit</button>
                      {perm.name !== "manage_roles_permissions" && (
                        <button className="btn-delete" onClick={() => handleDelete(perm.id, perm.name)}>Delete</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card form-card">
          <h3>{editingPermission ? `Edit Permission: ${editingPermission.name}` : "Create New Permission"}</h3>
          
          <form onSubmit={handleSave} className="perm-form">
            <div className="form-group">
              <label htmlFor="perm-name">Permission Name</label>
              <input
                id="perm-name"
                type="text"
                placeholder="e.g. audit_financial_draws"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={editingPermission && CORE_PERMISSIONS.includes(editingPermission.name)}
                required
              />
              <p className="field-help">Use snake_case for names, e.g. manage_users, moderate_posts.</p>
            </div>

            <div className="form-group">
              <label htmlFor="perm-desc">Description</label>
              <textarea
                id="perm-desc"
                placeholder="Describe what capability this permission grants..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingPermission ? "Update Permission" : "Create Permission"}
              </button>
              {editingPermission && (
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
.permissions-page {
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

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.perm-item {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background: #fafafb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.perm-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15,23,42,.03);
}

.perm-details {
  flex: 1;
}

.perm-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.perm-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  font-family: monospace;
}

.badge {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  color: ${BLUE_DARK};
  background: #eef4fb;
  padding: 1px 5px;
  border-radius: 4px;
}

.badge.core {
  color: ${AMBER};
  background: #fdf6e7;
}

.perm-desc {
  font-size: 13px;
  color: var(--body);
  margin: 0;
  line-height: 1.45;
}

.perm-actions {
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

.perm-form {
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

.field-help {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
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
