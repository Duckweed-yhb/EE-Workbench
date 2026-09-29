import assert from 'node:assert/strict';
import { it } from 'vitest';

import {
	createTodo,
	formatDate,
	STORAGE_KEY,
	todoStats,
} from '../src/todo.js';

it('createTodo 生成完整默认结构', () => {
	const t = createTodo({ text: '核对 BOM' });
	assert.ok(t.id.startsWith('todo_'));
	assert.equal(t.text, '核对 BOM');
	assert.equal(t.done, false);
	assert.equal(t.priority, 'medium');
	assert.equal(t.category, '其他');
	assert.ok(t.createdAt > 0);
	assert.equal(t.completedAt, null);
});

it('createTodo 非法优先级与分类回退默认', () => {
	const t = createTodo({ text: 'x', priority: 'urgent', category: '不存在' });
	assert.equal(t.priority, 'medium');
	assert.equal(t.category, '其他');
});

it('createTodo 空文本转空字符串不崩溃', () => {
	assert.equal(createTodo().text, '');
	assert.equal(createTodo({ text: 123 }).text, '123');
});

it('todoStats 正确统计', () => {
	const todos = [{ done: false }, { done: false }, { done: true }];
	assert.deepEqual(todoStats(todos), { open: 2, done: 1, total: 3 });
	assert.deepEqual(todoStats([]), { open: 0, done: 0, total: 0 });
});

it('formatDate 格式化时间戳', () => {
	assert.equal(formatDate(0), '');
	const ts = new Date(2026, 0, 15).getTime();
	assert.equal(formatDate(ts), '2026-01-15');
});

it('存储键与界面端约定一致', () => {
	assert.equal(STORAGE_KEY, 'eeWorkbench.todos');
});
