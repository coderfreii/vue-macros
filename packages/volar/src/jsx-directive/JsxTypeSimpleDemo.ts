import {
	type Code,
	allCodeFeatures,
	replaceSourceRange,
} from '@vue/language-core';
import { getSelfClosingElement, getOpeningElement, type JsxDirective, type TransformOptions, getTagName } from './index';

export function transformAllJsxNode(
	allJsxNode: Set<JsxDirective['node']>,
	options: TransformOptions
) {
	if (allJsxNode.size === 0) return;
	const { codes, ts, sfc, source } = options;


	geneJsx(codes);

	const toJsxType = (type: String) => `VLS_JSX_ELEMENT<VLS_children<typeof ${type}>>`;


	allJsxNode.forEach((node) => {
		insert(node, toJsxType(toPascalCase(getTagName(node, options))));
	});

	
	function insert(node: JsxDirective['node'], type: string) {
		const result: Code[] = [`) as unknown as ${type} satisfies ${type})`];
		const closingElement = getSelfClosingElement(node, options);
		const openingElement = getOpeningElement(node, options);

		const starto = openingElement!.tagName.pos;

		const start = closingElement!.end;

		replaceSourceRange(
			codes,
			source,
			starto - 1,
			starto - 1,
			"(("
		);



		replaceSourceRange(
			codes,
			source,
			start,
			start,
			...result,
		);
	}

	function geneJsx(codes: Code[]) {
		if (codes.toString().includes('type VLS_JSX_ELEMENT<T>')) return;


		codes.unshift(
			`
import { type VNode as VLS_VNode ,type Slot as VLS_Slot } from 'vue'

type VLS_MakeRequired<T> = {
-readonly [P in keyof T]-?: T[P];
}

type VLS_MakeOption<T> = {
  [P in keyof T]?: T[P];
 }

type VLS_SlotChildren_FROM_DefineSetupFnComponent<T> =  T extends new (...args: any) => {$slots: infer T } ? T : never;

type VLS_JSX_ELEMENT<T> = Omit<VLS_VNode, 'children'> & { children: T } & VLS_VNode & new (...args: any) => VLS_VNode & {   $props: {} }

type VLS_ExtractFunctionSignatures<T> = {
 [K in keyof T]: T[K]  extends  VLS_Slot<infer V>  ? (arg0: V) => VLS_JSX_ELEMENT<any>[] | Element[] : never
};

type VLS_children<T> = {} &  VLS_MakeOption<VLS_ExtractFunctionSignatures<VLS_MakeRequired<VLS_SlotChildren_FROM_DefineSetupFnComponent<T>>>>
	


`);
	}



	function toPascalCase(input: string): string {
		// 检查输入是否已经是大驼峰格式
		const isPascalCase = /^[A-Z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(input);

		if (isPascalCase) {
			return input; // 如果是大驼峰格式，直接返回
		}

		return input
			.split('-') // 将字符串按短横线分隔
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // 每个单词首字母大写，其余小写
			.join(''); // 拼接成一个字符串
	}
}