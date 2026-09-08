/**
 * todo.js - 待办清单模块
 *
 * 面向硬件工程师的待办管理：调试问题、BOM、封装、PCB 改版、
 * 文档与实验记录等。存储键为 `eeWorkbench.todos`，与
 * iframe/workbench.html 共用同一数据结构。
 *
 * 数据结构（数组元素）：
 * {
 *   id: string,
 *   text: string,
 *   done: boolean,
 *   priority: 'high'|'medium'|'low',
 *   category: '调试'|'BOM'|'封装'|'PCB 改版'|'文档'|'其他',
 *   createdAt: number,
 *   completedAt: number | null,
 *   source: string                  // 可选：来源标记，如 "sch-stats"
 * }
 */

export const STORAGE_KEY = 'eeWorkbench.todos';

export const TODO_CATEGORIES = ['调试', 'BOM', '封装', 'PCB 改版', '文档', '其他'];

export const TODO_PRIORITIES = ['high', 'medium', 'low'];

export const PRIORITY_LABELS = {
	high: '高',
	medium: '中',
	low: '低',
};

export function createTodo({ text, priority = 'medium', category = '其他', source = '' } = {}) {
	const now = Date.now();
	return {
		id: `todo_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
		text: String(text || '').trim(),
		done: false,
		priority: TODO_PRIORITIES.includes(priority) ? priority : 'medium',
		category: TODO_CATEGORIES.includes(category) ? category : '其他',
		createdAt: now,
		completedAt: null,
		source: String(source || ''),
	};
}

/** 从扩展用户配置读取待办列表 */
export function loadTodos() {
	try {
		const raw = eda.sys_Storage.getExtensionUserConfig(STORAGE_KEY);
		if (Array.isArray(raw)) {
			return raw.filter(t => t && typeof t === 'object' && t.text);
		}
	} catch {
		// 存储不可用时返回空列表
	}
	return [];
}

/** 持久化待办列表 */
export async function saveTodos(todos) {
	try {
		await eda.sys_Storage.setExtensionUserConfig(STORAGE_KEY, todos);
		return true;
	} catch {
		return false;
	}
}

/** 新增待办（返回新列表） */
export async function addTodoItem(todo) {
	const todos = loadTodos();
	todos.unshift(todo);
	await saveTodos(todos);
	return todos;
}

/** 切换完成状态 */
export async function toggleTodoItem(id) {
	const todos = loadTodos();
	const target = todos.find(t => t.id === id);
	if (target) {
		target.done = !target.done;
		target.completedAt = target.done ? Date.now() : null;
	}
	await saveTodos(todos);
	return todos;
}

/** 删除待办 */
export async function removeTodoItem(id) {
	const todos = loadTodos().filter(t => t.id !== id);
	await saveTodos(todos);
	return todos;
}

/** 待办统计 */
export function todoStats(todos) {
	const open = todos.filter(t => !t.done).length;
	const done = todos.filter(t => t.done).length;
	return { open, done, total: todos.length };
}

/** 时间戳格式化为 YYYY-MM-DD */
export function formatDate(ts) {
	if (!ts) {
		return '';
	}
	const d = new Date(ts);
	const pad = n => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
