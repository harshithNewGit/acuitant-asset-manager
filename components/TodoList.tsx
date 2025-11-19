import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

interface TodoItem {
    id: number;
    text: string;
    done: boolean;
    note?: string | null;
}

const TodoList: React.FC = () => {
    const [items, setItems] = useState<TodoItem[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<TodoItem | null>(null);
    const [noteDraft, setNoteDraft] = useState<string>('');
    const [isSavingNote, setIsSavingNote] = useState<boolean>(false);

    useEffect(() => {
        const loadTodos = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/todos`);
                if (!response.ok) {
                    throw new Error(`Failed to load todos (status ${response.status})`);
                }
                const data = await response.json() as TodoItem[];
                setItems(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load todos', err);
                setError('Unable to load tasks from the server.');
            } finally {
                setIsLoading(false);
            }
        };

        loadTodos();
    }, []);

    const handleAdd = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: trimmed }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create todo (status ${response.status})`);
            }

            const created = await response.json() as TodoItem;
            setItems(prev => [created, ...prev]);
            setInput('');
        } catch (err) {
            console.error('Failed to add todo', err);
            setError('Unable to add task right now.');
        }
    };

    const handleToggle = async (id: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const nextDone = !item.done;

        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ done: nextDone, note: item.note ?? null }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update todo (status ${response.status})`);
            }

            const updated = await response.json() as TodoItem;
            setItems(prev =>
                prev.map(existing =>
                    existing.id === updated.id ? updated : existing
                )
            );
        } catch (err) {
            console.error('Failed to update todo', err);
            setError('Unable to update task status.');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok && response.status !== 204) {
                throw new Error(`Failed to delete todo (status ${response.status})`);
            }

            setItems(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Failed to delete todo', err);
            setError('Unable to delete task.');
        }
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAdd();
        }
    };

    const handleOpenNote = (item: TodoItem) => {
        setActiveItem(item);
        setNoteDraft(item.note ?? '');
        setError(null);
    };

    const handleCloseNote = () => {
        if (isSavingNote) return;
        setActiveItem(null);
        setNoteDraft('');
    };

    const handleSaveNote = async () => {
        if (!activeItem) return;
        setIsSavingNote(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/todos/${activeItem.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    done: activeItem.done,
                    note: noteDraft.trim() === '' ? null : noteDraft.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update todo (status ${response.status})`);
            }

            const updated = await response.json() as TodoItem;
            setItems(prev =>
                prev.map(item =>
                    item.id === updated.id ? updated : item
                )
            );
            setActiveItem(null);
            setNoteDraft('');
        } catch (err) {
            console.error('Failed to save note', err);
            setError('Unable to save note.');
        } finally {
            setIsSavingNote(false);
        }
    };

    return (
        <section aria-label="Task list" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h2 className="text-lg font-semibold text-[#221F20]">To-do</h2>
                    <p className="mt-1 text-xs text-gray-500">
                        Capture quick asset-related follow-ups or reminders.
                    </p>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a new task and press Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#DA3832] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Add
                </button>
            </div>

            <div className="mt-3 min-h-[1.25rem]">
                {isLoading && (
                    <p className="text-xs text-gray-400">Loading tasks…</p>
                )}
                {!isLoading && error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}
            </div>

            <ul className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {items.length === 0 && !isLoading ? (
                    <li className="text-xs text-gray-400">
                        No tasks yet. Add your first to-do above.
                    </li>
                ) : (
                    items.map(item => (
                        <li
                            key={item.id}
                            className="flex items-start justify-between gap-2 px-2 py-1 rounded-md hover:bg-gray-50"
                        >
                            <div className="flex items-start gap-2 flex-1">
                                <input
                                    type="checkbox"
                                    checked={item.done}
                                    onChange={() => handleToggle(item.id)}
                                    className="mt-1 h-4 w-4 text-[#DA3832] border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleOpenNote(item)}
                                    className="text-left flex-1"
                                >
                                    <span className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                        {item.text}
                                    </span>
                                    <span className="block text-xs mt-0.5 text-gray-400">
                                        {item.note ? 'View / edit note' : 'Add note'}
                                    </span>
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="text-xs text-gray-400 hover:text-red-600"
                            >
                                Remove
                            </button>
                        </li>
                    ))
                )}
            </ul>

            {activeItem && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-xl leading-6 font-semibold text-gray-900 mb-2">
                                Note for task
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                {activeItem.text}
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Note
                            </label>
                            <textarea
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                rows={6}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="Add context, next steps, or details related to this task."
                            />
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                            <button
                                type="button"
                                onClick={handleSaveNote}
                                disabled={isSavingNote}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70"
                            >
                                {isSavingNote ? 'Saving…' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseNote}
                                disabled={isSavingNote}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-70"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TodoList;
