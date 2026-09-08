/**
 * pomodoro.js - 番茄钟数据模型与逻辑
 *
 * 本模块定义番茄钟的状态机、默认配置、持久化读写与时间计算。
 * 存储介质为嘉立创 EDA 专业版扩展的用户配置（eda.sys_Storage），
 * 存储键为 `eeWorkbench.pomodoro`，与 iframe/workbench.html 中的
 * 工作台界面共用同一套数据结构（iframe 内嵌了同构逻辑）。
 *
 * 数据结构：
 * {
 *   mode: 'focus' | 'shortBreak' | 'longBreak',  // 当前模式
 *   status: 'idle' | 'running' | 'paused',        // 计时状态
 *   durationMs: number,                            // 当前模式时长（毫秒）
 *   remainingMs: number,                           // 剩余时长（毫秒，暂停时有效）
 *   endAt: number,                                 // 运行中模式的结束时间戳（Date.now）
 *   completedFocus: number,                        // 已完成的专注轮数（含休息后重置）
 *   completedRounds: number,                       // 已完成的整轮（专注+休息）
 *   settings: {
 *     focusMin: 25, shortBreakMin: 5, longBreakMin: 15, rounds: 4, autoStartNext: true
 *   },
 *   updatedAt: number
 * }
 */

export const STORAGE_KEY = 'eeWorkbench.pomodoro';

export const MODE = {
	FOCUS: 'focus',
	SHORT_BREAK: 'shortBreak',
	LONG_BREAK: 'longBreak',
};

export const MODE_LABELS = {
	[MODE.FOCUS]: '专注',
	[MODE.SHORT_BREAK]: '短休息',
	[MODE.LONG_BREAK]: '长休息',
};

/** 默认设置：25 分钟专注 + 5 分钟短休 + 15 分钟长休，每 4 轮一次长休 */
export const DEFAULT_SETTINGS = {
	focusMin: 25,
	shortBreakMin: 5,
	longBreakMin: 15,
	rounds: 4,
	autoStartNext: true,
};

export const DEFAULT_STATE = {
	mode: MODE.FOCUS,
	status: 'idle',
	durationMs: DEFAULT_SETTINGS.focusMin * 60_000,
	remainingMs: DEFAULT_SETTINGS.focusMin * 60_000,
	endAt: 0,
	completedFocus: 0,
	completedRounds: 0,
	settings: { ...DEFAULT_SETTINGS },
	updatedAt: 0,
};

/** 根据模式返回时长（毫秒） */
export function durationMsOf(mode, settings = DEFAULT_SETTINGS) {
	switch (mode) {
		case MODE.FOCUS:
			return settings.focusMin * 60_000;
		case MODE.SHORT_BREAK:
			return settings.shortBreakMin * 60_000;
		case MODE.LONG_BREAK:
			return settings.longBreakMin * 60_000;
		default:
			return settings.focusMin * 60_000;
	}
}

/** 计算某个状态当前剩余毫秒数（运行中按 endAt 推算，保证节流/最小化不失准） */
export function computeRemainingMs(state, now = Date.now()) {
	if (state.status !== 'running' || !state.endAt) {
		return Math.max(0, state.remainingMs || 0);
	}
	return Math.max(0, state.endAt - now);
}

/** 毫秒格式化为 MM:SS（支持超过 99 分钟的 H:MM:SS） */
export function formatMs(ms) {
	const totalSec = Math.max(0, Math.ceil(ms / 1000));
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	const mm = String(m).padStart(2, '0');
	const ss = String(s).padStart(2, '0');
	return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** 创建全新状态（依据设置） */
export function createState(settings = DEFAULT_SETTINGS) {
	const durationMs = durationMsOf(MODE.FOCUS, settings);
	return {
		...DEFAULT_STATE,
		durationMs,
		remainingMs: durationMs,
		settings: { ...DEFAULT_SETTINGS, ...settings },
	};
}

/** 从扩展用户配置读取状态；不存在或损坏时回退默认 */
export function loadState() {
	try {
		const raw = eda.sys_Storage.getExtensionUserConfig(STORAGE_KEY);
		if (raw && typeof raw === 'object' && raw.mode && raw.settings) {
			return {
				...createState(raw.settings),
				...raw,
				settings: { ...DEFAULT_SETTINGS, ...raw.settings },
			};
		}
	} catch {
		// 独立脚本环境或存储不可用时回退默认状态
	}
	return createState();
}

/** 持久化番茄钟状态 */
export async function saveState(state) {
	const payload = { ...state, updatedAt: Date.now() };
	try {
		await eda.sys_Storage.setExtensionUserConfig(STORAGE_KEY, payload);
		return true;
	} catch {
		return false;
	}
}

/**
 * 推进状态机：一个阶段结束后调用。
 * 专注结束 → 进入休息（每 settings.rounds 轮进入长休息）；
 * 休息结束 → 回到专注。
 */
export function advance(state, now = Date.now()) {
	const settings = state.settings;
	const next = { ...state };

	if (state.mode === MODE.FOCUS) {
		const completedFocus = state.completedFocus + 1;
		const isLongBreak = completedFocus % settings.rounds === 0;
		next.mode = isLongBreak ? MODE.LONG_BREAK : MODE.SHORT_BREAK;
		next.completedFocus = completedFocus;
		if (isLongBreak) {
			next.completedRounds = (state.completedRounds || 0) + 1;
		}
	}
	else {
		next.mode = MODE.FOCUS;
	}

	const durationMs = durationMsOf(next.mode, settings);
	next.durationMs = durationMs;
	next.remainingMs = durationMs;
	next.status = 'idle';
	next.endAt = 0;
	next.updatedAt = now;
	return next;
}
