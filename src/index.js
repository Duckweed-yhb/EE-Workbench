/**
 * index.js - EE Workbench 扩展入口
 *
 * 本文件为扩展入口，导出的函数通过名称与 extension.json 中
 * headerMenus 的 registerFn 关联。所有用户可见功能：
 *  - 打开 EE Workbench 工作台（番茄钟 / build-your-own-x / 待办）
 *  - 统计当前原理图 / PCB 并记入待办（EDA 集成）
 *  - 关于
 */
import extensionConfig from '../extension.json' with { type: 'json' };

import { addTodoItem, createTodo, todoStats } from './todo.js';
import { loadState as loadPomodoroState } from './pomodoro.js';
import { projectStats, loadProjects } from './build-your-own-x.js';

/** 工作台窗口 ID（与 iframe/workbench.html 中的关闭调用保持一致） */
export const WORKBENCH_IFRAME_ID = 'ee-workbench';
const WORKBENCH_HTML_PATH = '/iframe/workbench.html';

/** 扩展激活钩子（预留；目前无需在启动时执行动作） */
export function activate(status, arg) {
	void status;
	void arg;
}

/** 关于 */
export function about() {
	eda.sys_Dialog.showInformationMessage(
		eda.sys_I18n.text(
			'EE Workbench v${1}',
			undefined,
			undefined,
			extensionConfig.version,
		),
		eda.sys_I18n.text('About'),
	);
}

/**
 * 打开 EE Workbench 工作台（内联框架窗口）
 * 工作台包含番茄钟、build-your-own-x 项目管理和待办清单三个标签页。
 */
export async function openWorkbench() {
	try {
		await eda.sys_IFrame.openIFrame(WORKBENCH_HTML_PATH, 440, 660, WORKBENCH_IFRAME_ID, {
			title: 'EE Workbench',
			minimizeButton: true,
			maximizeButton: false,
			grayscaleMask: false,
		});
	}
	catch (err) {
		eda.sys_Dialog.showInformationMessage(
			eda.sys_I18n.text('打开工作台失败：${1}', undefined, undefined, err?.message ?? err),
			'EE Workbench',
		);
	}
}

/** 安全地读取一个图元统计（不可用时返回 null） */
async function safeCount(api, filter) {
	try {
		const items = await api.getAll();
		if (!Array.isArray(items)) {
			return 0;
		}
		return filter ? items.filter(filter).length : items.length;
	}
	catch {
		return null;
	}
}

/** 统计当前原理图并记入待办 */
export async function captureSchStatsToTodo() {
	const componentNum = await safeCount(
		eda.sch_PrimitiveComponent,
		item => item.getState_ComponentType() === ESCH_PrimitiveComponentType.COMPONENT,
	);
	const portNum = await safeCount(
		eda.sch_PrimitiveComponent,
		item => item.getState_ComponentType() === ESCH_PrimitiveComponentType.NET_PORT,
	);
	const textNum = await safeCount(eda.sch_PrimitiveText);
	const wireNum = await safeCount(eda.sch_PrimitiveWire);

	if (componentNum === null && portNum === null && textNum === null && wireNum === null) {
		eda.sys_Message.showToastMessage('请先打开一个原理图文档', 'warn', 3);
		return;
	}

	const parts = [
		componentNum !== null ? `元件 ${componentNum}` : null,
		portNum !== null ? `端口 ${portNum}` : null,
		textNum !== null ? `文本 ${textNum}` : null,
		wireNum !== null ? `导线 ${wireNum}` : null,
	].filter(Boolean);
	const text = `【原理图统计】${parts.join(' / ')}`;

	const todos = await addTodoItem(createTodo({
		text,
		priority: 'medium',
		category: '文档',
		source: 'sch-stats',
	}));
	const stats = todoStats(todos);
	eda.sys_Message.showToastMessage(
		eda.sys_I18n.text('已记入待办，未完成 ${1} 项', undefined, undefined, stats.open),
		'success',
		3,
	);
}

/** 统计当前 PCB 并记入待办 */
export async function capturePcbStatsToTodo() {
	const componentNum = await safeCount(eda.pcb_PrimitiveComponent);
	const lineNum = await safeCount(eda.pcb_PrimitiveLine);
	const arcNum = await safeCount(eda.pcb_PrimitiveArc);
	const trackNum = lineNum !== null || arcNum !== null ? (lineNum ?? 0) + (arcNum ?? 0) : null;
	const padNum = await safeCount(eda.pcb_PrimitivePad);
	const viaNum = await safeCount(eda.pcb_PrimitiveVia);

	if (componentNum === null && trackNum === null && padNum === null && viaNum === null) {
		eda.sys_Message.showToastMessage('请先打开一个 PCB 文档', 'warn', 3);
		return;
	}

	const parts = [
		componentNum !== null ? `元件 ${componentNum}` : null,
		trackNum !== null ? `走线 ${trackNum}` : null,
		padNum !== null ? `焊盘 ${padNum}` : null,
		viaNum !== null ? `过孔 ${viaNum}` : null,
	].filter(Boolean);
	const text = `【PCB 统计】${parts.join(' / ')}`;

	const todos = await addTodoItem(createTodo({
		text,
		priority: 'medium',
		category: 'PCB 改版',
		source: 'pcb-stats',
	}));
	const stats = todoStats(todos);
	eda.sys_Message.showToastMessage(
		eda.sys_I18n.text('已记入待办，未完成 ${1} 项', undefined, undefined, stats.open),
		'success',
		3,
	);
}

/** 汇总当前工作台数据（供菜单或调试使用） */
export function summarizeWorkbench() {
	const pomodoro = loadPomodoroState();
	const projects = projectStats(loadProjects());
	const todos = todoStats(loadTodosSafe());
	return { pomodoro: { mode: pomodoro.mode, status: pomodoro.status }, projects, todos };
}

/** 从存储读取待办（供 summarize 使用，避免额外导入命名冲突） */
function loadTodosSafe() {
	try {
		const raw = eda.sys_Storage.getExtensionUserConfig('eeWorkbench.todos');
		return Array.isArray(raw) ? raw : [];
	}
	catch {
		return [];
	}
}
