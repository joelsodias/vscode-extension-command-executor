import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface Command {
    name: string;
    command: string;
}

function getCommands(): Command[] {
    const commandsFilePath = path.join(vscode.workspace.rootPath || '', '.vscode', 'commands.json');
    if (fs.existsSync(commandsFilePath)) {
        const commandsJson = fs.readFileSync(commandsFilePath, 'utf8');
        const commands: Command[] = JSON.parse(commandsJson);
        return commands;
    }
    return [];
}

function executeCommand(command: string) {
    const terminal = vscode.window.createTerminal();
    terminal.sendText(command);
    terminal.show();
}

export function activate(context: vscode.ExtensionContext) {
    const commands = getCommands();

    let disposable = vscode.commands.registerCommand('extension.showCommands', () => {
        const panel = vscode.window.createWebviewPanel(
            'commands',
            'Commands',
            vscode.ViewColumn.One,
            {}
        );

        let htmlContent = '<ul>';
        commands.forEach(cmd => {
            htmlContent += `<li>${cmd.name} <button onclick="runCommand('${cmd.command}')">Run</button></li>`;
        });
        htmlContent += '</ul>';

        panel.webview.html = htmlContent;

        panel.webview.onDidReceiveMessage(message => {
            executeCommand(message.command);
        });
    });

    context.subscriptions.push(disposable);
}
