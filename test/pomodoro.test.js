import assert from 'node:assert/strict';
import { it } from 'vitest';

import {
	advance,
	computeRemainingMs,
	createState,
	DEFAULT_SETTINGS,
	durationMsOf,
	formatMs,
	MODE,
} from '../src/pomodoro.js';

const MIN = 60_000;

it('durationMsOf 按模式返回时长', () => {
	assert.equal(durationMsOf(MODE.FOCUS), 25 * MIN);
	assert.equal(durationMsOf(MODE.SHORT_BREAK), 5 * MIN);
	assert.equal(durationMsOf(MODE.LONG_BREAK), 15 * MIN);
	assert.equal(durationMsOf('unknown'), 25 * MIN); // 非法模式回退专注
});

it('durationMsOf 支持自定义设置', () => {
	const s = { ...DEFAULT_SETTINGS, focusMin: 50, shortBreakMin: 10, longBreakMin: 30 };
	assert.equal(durationMsOf(MODE.FOCUS, s), 50 * MIN);
	assert.equal(durationMsOf(MODE.SHORT_BREAK, s), 10 * MIN);
	assert.equal(durationMsOf(MODE.LONG_BREAK, s), 30 * MIN);
});

it('formatMs 格式化分秒与小时', () => {
	assert.equal(formatMs(0), '00:00');
	assert.equal(formatMs(65_000), '01:05');
	assert.equal(formatMs(3_661_000), '1:01:01');
	assert.equal(formatMs(-5_000), '00:00'); // 负数归 0
});

it('computeRemainingMs 空闲返回剩余，运行按 endAt 推算', () => {
	const now = 1_000_000;
	assert.equal(computeRemainingMs({ status: 'idle', remainingMs: 10_000 }, now), 10_000);
	assert.equal(computeRemainingMs({ status: 'running', endAt: now + 3_000, remainingMs: 9_000 }, now), 3_000);
	assert.equal(computeRemainingMs({ status: 'running', endAt: now - 5_000 }, now), 0); // 超时归 0
});

it('createState 依据设置初始化', () => {
	const s = createState({ focusMin: 30 });
	assert.equal(s.mode, MODE.FOCUS);
	assert.equal(s.status, 'idle');
	assert.equal(s.durationMs, 30 * MIN);
	assert.equal(s.settings.focusMin, 30);
});

it('advance：专注结束进入短休息', () => {
	const s = createState();
	const next = advance(s, 1_000);
	assert.equal(next.mode, MODE.SHORT_BREAK);
	assert.equal(next.completedFocus, 1);
	assert.equal(next.status, 'idle');
	assert.equal(next.durationMs, 5 * MIN);
});

it('advance：每 4 轮进入长休息并累计整轮', () => {
	let s = createState();
	s.completedFocus = 3;
	s = advance(s); // 第 4 次专注结束
	assert.equal(s.mode, MODE.LONG_BREAK);
	assert.equal(s.completedRounds, 1);
});

it('advance：休息结束回到专注', () => {
	let s = createState();
	s.mode = MODE.SHORT_BREAK;
	s = advance(s);
	assert.equal(s.mode, MODE.FOCUS);
});
