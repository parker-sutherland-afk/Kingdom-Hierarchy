import React, { useEffect, useRef, useState } from 'react';
import { Download, Pencil, Plus, RotateCcw, Trash2, Undo2, X } from 'lucide-react';
import { validateRoster } from './rosterUtils.js';

const EMPTY_MEMBER = {
  name: '',
  mcName: '',
  role: '',
  secondaryRole: '',
  customPoints: '',
  customDesc: '',
};

const FIELD_CLASS = 'mt-1 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20';

export default function RosterEditor({
  open,
  members,
  publishedMembers,
  roleNames,
  roleConfig,
  onClose,
  onSave,
  onReset,
}) {
  const dialogRef = useRef(null);
  const [draftMembers, setDraftMembers] = useState(members);
  const [draftMember, setDraftMember] = useState(EMPTY_MEMBER);
  const [editingId, setEditingId] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setDraftMembers(members);
      setDraftMember({ ...EMPTY_MEMBER, role: roleNames[0] ?? '' });
      setEditingId(null);
      setHistory([]);
      setError('');
      setStatus('');
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, members, roleNames]);

  function updateField(event) {
    const { name, value } = event.target;
    setDraftMember(current => ({ ...current, [name]: value }));
  }

  function rememberDraft() {
    setHistory(current => [...current.slice(-19), draftMembers]);
  }

  function startEditing(member) {
    setEditingId(member.id);
    setDraftMember({
      name: member.name,
      mcName: member.mcName,
      role: member.role,
      secondaryRole: member.secondaryRole ?? '',
      customPoints: member.customPoints ?? '',
      customDesc: member.customDesc ?? '',
    });
    setError('');
    setStatus(`Editing ${member.name}`);
  }

  function clearForm() {
    setEditingId(null);
    setDraftMember({ ...EMPTY_MEMBER, role: roleNames[0] ?? '' });
    setError('');
    setStatus('');
  }

  function saveMember(event) {
    event.preventDefault();
    const name = draftMember.name.trim();
    const mcName = draftMember.mcName.trim();
    if (!name || !mcName || !draftMember.role) {
      setError('Add a display name, Minecraft username, and primary role.');
      return;
    }

    if (draftMember.customPoints !== '' &&
      (!Number.isFinite(Number(draftMember.customPoints)) || Number(draftMember.customPoints) < 0)) {
      setError('Custom voting points must be a non-negative number.');
      return;
    }

    const member = {
      id: editingId ?? Math.max(0, ...draftMembers.map(item => item.id)) + 1,
      name,
      mcName,
      role: draftMember.role,
      ...(draftMember.secondaryRole ? { secondaryRole: draftMember.secondaryRole } : {}),
      ...(draftMember.customPoints !== '' ? { customPoints: Number(draftMember.customPoints) } : {}),
      ...(draftMember.customDesc.trim() ? { customDesc: draftMember.customDesc.trim() } : {}),
    };
    const nextMembers = editingId === null
      ? [...draftMembers, member]
      : draftMembers.map(item => item.id === editingId ? member : item);
    const validationError = validateRoster(nextMembers, roleConfig);

    if (validationError) {
      setError(validationError);
      return;
    }

    rememberDraft();
    setDraftMembers(nextMembers);
    setStatus(`${name} is in the draft roster. Save roster changes to keep it.`);
    setError('');
    setEditingId(null);
    setDraftMember({ ...EMPTY_MEMBER, role: roleNames[0] ?? '' });
  }

  function removeMember(member) {
    if (!window.confirm(`Remove ${member.name} from the draft roster?`)) return;
    rememberDraft();
    setDraftMembers(current => current.filter(item => item.id !== member.id));
    if (editingId === member.id) clearForm();
    setStatus(`${member.name} removed from the draft roster. Undo to bring them back.`);
    setError('');
  }

  function undoDraftChange() {
    const previousMembers = history.at(-1);
    if (!previousMembers) return;
    setDraftMembers(previousMembers);
    setHistory(current => current.slice(0, -1));
    setError('');
    setStatus('Undid the last draft change.');
  }

  function saveRoster() {
    const validationError = validateRoster(draftMembers, roleConfig);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      onSave(draftMembers);
      setHistory([]);
      setError('');
      setStatus('Roster saved in this browser.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the roster.');
    }
  }

  function downloadRoster() {
    const validationError = validateRoster(draftMembers, roleConfig);
    if (validationError) {
      setError(validationError);
      return;
    }

    const blob = new Blob([`${JSON.stringify(draftMembers, null, 2)}\n`], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'members.json';
    link.click();
    URL.revokeObjectURL(url);
    setError('');
    setStatus('Downloaded members.json. Replace src/data/members.json and redeploy to publish for everyone.');
  }

  function resetRoster() {
    if (!window.confirm('Discard browser-saved changes and restore the published roster?')) return;
    try {
      onReset();
      setDraftMembers(publishedMembers);
      setDraftMember({ ...EMPTY_MEMBER, role: roleNames[0] ?? '' });
      setEditingId(null);
      setHistory([]);
      setError('');
      setStatus('Restored the published roster in this browser.');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not restore the published roster.');
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="roster-editor-title"
      onClose={onClose}
      className="max-h-[92dvh] w-[min(70rem,calc(100%-1rem))] overflow-y-auto rounded-2xl border border-stone-700 bg-[#11120f] p-0 text-stone-200 shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-stone-800 bg-[#11120f]/95 p-4 backdrop-blur sm:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Browser-only editor</p>
          <h2 id="roster-editor-title" className="mt-1 text-lg font-black text-stone-100 sm:text-xl">Edit kingdom roster</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-stone-400">Changes save on this device only. Download the JSON and update the project roster to publish changes for everyone.</p>
        </div>
        <button type="button" aria-label="Close roster editor" onClick={onClose} className="shrink-0 rounded-lg border border-stone-700 p-2 text-stone-400 transition hover:border-stone-500 hover:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500">
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.9fr)]">
        <section aria-labelledby="editor-members-title">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="editor-members-title" className="text-sm font-bold text-stone-200">Members <span className="text-stone-500">({draftMembers.length})</span></h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={undoDraftChange} disabled={!history.length} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-stone-700 px-3 py-2 text-xs font-bold text-stone-300 transition hover:border-stone-500 hover:text-stone-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <Undo2 size={14} /> Undo
              </button>
              <button type="button" onClick={clearForm} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-stone-700 px-3 py-2 text-xs font-bold text-stone-300 transition hover:border-amber-500/50 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
          <ul className="mt-3 max-h-[34dvh] space-y-2 overflow-y-auto pr-1 lg:max-h-[52dvh]">
            {draftMembers.map(member => (
              <li key={member.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-stone-800 bg-black/20 p-2.5 sm:gap-3 sm:p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-200">{member.name}</p>
                  <p className="truncate text-xs text-stone-500">{member.role}{member.secondaryRole ? ` · ${member.secondaryRole}` : ''}</p>
                </div>
                <button type="button" aria-label={`Edit ${member.name}`} onClick={() => startEditing(member)} className="min-h-10 min-w-10 rounded-lg border border-stone-700 p-2 text-stone-400 transition hover:border-amber-500/50 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <Pencil size={14} className="mx-auto" />
                </button>
                <button type="button" aria-label={`Remove ${member.name}`} onClick={() => removeMember(member)} className="min-h-10 min-w-10 rounded-lg border border-stone-700 p-2 text-stone-400 transition hover:border-rose-500/50 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <Trash2 size={14} className="mx-auto" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <form onSubmit={saveMember} className="space-y-3 rounded-xl border border-stone-800 bg-black/20 p-3 sm:p-4">
          <div>
            <h3 className="text-sm font-bold text-stone-200">{editingId === null ? 'Add a member' : 'Edit member'}</h3>
            <p className="mt-1 text-xs text-stone-500">Changes here are drafts until added or updated.</p>
          </div>
          <label className="block text-xs font-semibold text-stone-400">
            Display name
            <input className={FIELD_CLASS} name="name" value={draftMember.name} onChange={updateField} maxLength={60} required />
          </label>
          <label className="block text-xs font-semibold text-stone-400">
            Minecraft username
            <input className={FIELD_CLASS} name="mcName" value={draftMember.mcName} onChange={updateField} maxLength={32} required />
          </label>
          <label className="block text-xs font-semibold text-stone-400">
            Primary role
            <select className={FIELD_CLASS} name="role" value={draftMember.role} onChange={updateField} required>
              {roleNames.map(role => <option key={role} value={role} className="bg-stone-900">{role}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-stone-400">
            Secondary role <span className="font-normal text-stone-600">(optional)</span>
            <select className={FIELD_CLASS} name="secondaryRole" value={draftMember.secondaryRole} onChange={updateField}>
              <option value="" className="bg-stone-900">No secondary role</option>
              {roleNames.map(role => <option key={role} value={role} className="bg-stone-900">{role}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-stone-400">
            Custom voting points <span className="font-normal text-stone-600">(optional override)</span>
            <input className={FIELD_CLASS} name="customPoints" type="number" min="0" step="1" value={draftMember.customPoints} onChange={updateField} placeholder="Use role points" />
          </label>
          <label className="block text-xs font-semibold text-stone-400">
            Description <span className="font-normal text-stone-600">(optional)</span>
            <textarea className={`${FIELD_CLASS} min-h-24 resize-y`} name="customDesc" value={draftMember.customDesc} onChange={updateField} maxLength={500} />
          </label>
          {error && <p className="rounded-lg border border-rose-400/25 bg-rose-400/[0.06] p-3 text-xs leading-relaxed text-rose-200" role="alert">{error}</p>}
          {status && <p className="text-xs leading-relaxed text-emerald-300" role="status">{status}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs font-bold text-amber-100 transition hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-500">
              {editingId === null ? <Plus size={14} /> : <Pencil size={14} />}
              {editingId === null ? 'Add to draft' : 'Update draft'}
            </button>
            {editingId !== null && <button type="button" onClick={clearForm} className="min-h-11 rounded-lg border border-stone-700 px-3 py-2.5 text-xs font-semibold text-stone-400 hover:text-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-500">Cancel</button>}
          </div>
        </form>
      </div>

      {status && <p className="sr-only" aria-live="polite">{status}</p>}
      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-stone-800 bg-[#11120f]/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <button type="button" onClick={resetRoster} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-stone-700 px-3 py-2.5 text-xs font-semibold text-stone-400 transition hover:border-rose-500/40 hover:text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500">
          <RotateCcw size={14} /> Reset to published
        </button>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" onClick={downloadRoster} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-stone-600 px-3 py-2.5 text-xs font-bold text-stone-200 transition hover:border-stone-400 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400">
            <Download size={14} /> Download JSON
          </button>
          <button type="button" onClick={saveRoster} className="min-h-11 rounded-lg bg-amber-300 px-4 py-2.5 text-xs font-black text-stone-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-stone-950">
            Save on this device
          </button>
        </div>
      </div>
    </dialog>
  );
}
