/**
 * build-your-own-x.js - DIY 项目管理模块
 *
 * 面向硬件工程师的 build-your-own-x 灵感与项目沉淀：
 * 记录项目名称、目标、参考资料、状态与进度。
 * 存储键为 `eeWorkbench.projects`，与 iframe/workbench.html 共用。
 *
 * 数据结构（数组元素）：
 * {
 *   id: string,                    // 唯一标识
 *   name: string,                  // 项目名称
 *   goal: string,                  // 项目目标 / 一句话描述
 *   reference: string,             // 参考资料链接
 *   status: 'idea'|'building'|'paused'|'done',
 *   progress: number,              // 0-100
 *   tags: string[],                // 标签
 *   createdAt: number,
 *   updatedAt: number
 * }
 */

export const STORAGE_KEY = 'eeWorkbench.projects';

export const PROJECT_STATUSES = ['idea', 'building', 'paused', 'done'];

export const STATUS_LABELS = {
	idea: '想法',
	building: '进行中',
	paused: '暂停',
	done: '完成',
};

/** 空项目的占位示例（首屏引导用） */
export const SAMPLE_PROJECTS = [
	{
		id: 'sample-power',
		name: 'Build your own power supply',
		goal: '从线性稳压起步，逐步实现可调多路电源',
		reference: '',
		status: 'idea',
		progress: 0,
		tags: ['电源'],
		createdAt: 0,
		updatedAt: 0,
	},
];

export function createProject({ name, goal = '', reference = '', status = 'idea', progress = 0, tags = [] } = {}) {
	const now = Date.now();
	return {
		id: `proj_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
		name: String(name || '').trim(),
		goal: String(goal || '').trim(),
		reference: String(reference || '').trim(),
		status: PROJECT_STATUSES.includes(status) ? status : 'idea',
		progress: Math.min(100, Math.max(0, Number(progress) || 0)),
		tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
		createdAt: now,
		updatedAt: now,
	};
}

/** 从扩展用户配置读取项目列表 */
export function loadProjects() {
	try {
		const raw = eda.sys_Storage.getExtensionUserConfig(STORAGE_KEY);
		if (Array.isArray(raw)) {
			return raw.filter(p => p && typeof p === 'object' && p.name);
		}
	} catch {
		// 存储不可用时返回空列表
	}
	return [];
}

/** 持久化项目列表 */
export async function saveProjects(projects) {
	try {
		await eda.sys_Storage.setExtensionUserConfig(STORAGE_KEY, projects);
		return true;
	} catch {
		return false;
	}
}

/** 项目统计 */
export function projectStats(projects) {
	const total = projects.length;
	const building = projects.filter(p => p.status === 'building').length;
	const done = projects.filter(p => p.status === 'done').length;
	const ideas = projects.filter(p => p.status === 'idea').length;
	return { total, building, done, ideas };
}
