import {
	type Code,
	allCodeFeatures,
	replaceSourceRange,
} from '@vue/language-core';
import { getStart, getText } from '../common';
import { getSelfClosingElement, getOpeningElement, type JsxDirective, type TransformOptions } from './index';

export function transformAllJsxNode(
	allJsxNode: Set<JsxDirective['node']>,
	options: TransformOptions
) {
	if (allJsxNode.size === 0) return;
	const { codes, ts, sfc, source } = options

	allJsxNode.forEach((i) => {
		const result: Code[] = [') as unknown as string satisfies string']
		const closingElement = getSelfClosingElement(i, options)
		const openingElement =  getOpeningElement(i, options)
		
		const starto =  openingElement!.tagName.pos

		const start = closingElement!.end;

		replaceSourceRange(
			codes,
			source,
			starto - 1,
			starto-1,
			"("
		  )



		replaceSourceRange(
			codes,
			source,
			start,
			start+1,
			...result,
		  )
	});
}