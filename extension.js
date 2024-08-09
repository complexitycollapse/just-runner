const vscode = require('vscode');
const { exec } = require('child_process');

class JustTestCodeLensProvider {
    constructor() {
        // Adjust this regex to match your test framework's test function definitions
        this.regex = /test\(['"`](.*?)['"`]/g;
    }

    provideCodeLenses(document, token) {
        const codeLenses = [];
        const text = document.getText();
        let matches;
        
        while ((matches = this.regex.exec(text)) !== null) {
            const line = document.lineAt(document.positionAt(matches.index).line);
            const range = new vscode.Range(line.range.start, line.range.end);
            const command = {
                title: "Run Test",
                command: "extension.runJustTest",
                arguments: [document.fileName, matches[1]],
            };
            codeLenses.push(new vscode.CodeLens(range, command));

            codeLenses.push(new vscode.CodeLens(range, {
                title: "Debug Test",
                command: "extension.debugJustTest",
                arguments: [document.fileName, matches[1]],
            }));
        }

        return codeLenses;
    }

    resolveCodeLens(codeLens, token) {
        return codeLens;
    }
}

function activate(context) {
    // Register the CodeLens provider for JavaScript files
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            { language: 'javascript', scheme: 'file' }, 
            new JustTestCodeLensProvider()
        )
    );

    // Register the command that will run the test
    let runTest = vscode.commands.registerCommand('extension.runJustTest', (filePath, testName) => {
        const cmd = `node C:\\Users\\Main\\repos\\just\\just\\index.js --file "${filePath}" --test "${testName}"`;
        
        let terminal = vscode.window.terminals.find(t => t.name === 'Just Test Runner');
        if (!terminal) {
            terminal = vscode.window.createTerminal('Just Test Runner');
        }

        terminal.show(); // Show the terminal if it's not visible
        terminal.sendText(cmd);
    });

    let debugTest = vscode.commands.registerCommand('extension.debugJustTest', (filePath, testName) => {
        const debugConfig = {
            type: 'node', // This assumes you're using Node.js
            request: 'launch',
            name: `Debug ${testName}`,
            program: "C:\\Users\\Main\\repos\\just\\just\\index.js",
            args: ['--file', filePath, '--test', testName],
            cwd: '${workspaceFolder}',
            console: 'integratedTerminal',
            internalConsoleOptions: 'neverOpen',
        };

        vscode.debug.startDebugging(undefined, debugConfig);
    });

    context.subscriptions.push(runTest);
    context.subscriptions.push(debugTest);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
