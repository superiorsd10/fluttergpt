
import * as vscode from "vscode";
import { CodeAction } from "vscode";
import { Outline } from "../shared/types/custom_protocols";
import { cursorIsAt } from "../shared/utils";
import { ILspAnalyzer } from "../shared/types/LspAnalyzer";
import { GeminiRepository } from "../repository/gemini-repository";


export class FluttergptActionProvider implements vscode.CodeActionProvider {
	constructor(private readonly analyzer: ILspAnalyzer, private readonly aiRepo: GeminiRepository, private readonly extcontext: vscode.ExtensionContext) { }


	async provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): Promise<CodeAction[] | undefined> {
		let functionAction = [];

		const manualSelectionRange: vscode.Range | undefined = range.start.line !== range.end.line || range.start.character !== range.end.character? range : undefined;
		let functionRange: { symbolRange: vscode.Range, symbol: Outline } | undefined = await cursorIsAt("METHOD", this.analyzer, document, vscode.window.activeTextEditor, range);
		const classRange: { symbolRange: vscode.Range, symbol: Outline } | undefined = await cursorIsAt("CLASS", this.analyzer, document, vscode.window.activeTextEditor, range);

		const selectedRange = manualSelectionRange!==undefined? manualSelectionRange: functionRange!==undefined?functionRange.symbolRange: classRange?.symbolRange;
		const codeActionIndication = manualSelectionRange!==undefined? "Selection":
		functionRange!==undefined?functionRange.symbol.element.name:classRange?.symbol.element.name;
		
		if (selectedRange !== undefined) {

		// optimize function
		const optimizeFunction = new vscode.CodeAction(
			`Optimize ${codeActionIndication}`, vscode.CodeActionKind.Refactor);
		optimizeFunction.command = {
			arguments: [this.aiRepo, this.extcontext.globalState, selectedRange],
			command: "fluttergpt.optimizeCode",
			title: "Optimize Function",
		};

		functionAction.push(optimizeFunction);

		// refractor code
		const refactorCode = new vscode.CodeAction(`Refactor ${codeActionIndication}`, vscode.CodeActionKind.Refactor);
		refactorCode.command = {
			arguments: [this.aiRepo, this.extcontext.globalState, selectedRange],
			command: "fluttergpt.refactorCode",
			title: "Refactor code",
		};
		functionAction.push(refactorCode);

		return functionAction;

		}
	}
}
