// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { SwaggerTreeViewProvider } from './SwaggerTreeViewProvider'

let timer: NodeJS.Timeout

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // ============ tree view start ===============
  const swaggerDocTreeView = new SwaggerTreeViewProvider(context)
  vscode.window.registerTreeDataProvider('swagger-doc', swaggerDocTreeView)

  let addSwaggerCommand = vscode.commands.registerCommand(
    'swagger-doc.addSwagger',
    async () => {
      const value = await vscode.window.showInputBox({
        placeHolder: 'a swagger url',
      })
      const label = await vscode.window.showInputBox({
        placeHolder: 'give it a name',
      })
      if (value && label) {
        swaggerDocTreeView.addNewSwaggerConfig({ label, value })
      }
    }
  )

  let deleteSwaggerCommand = vscode.commands.registerCommand(
    'swagger-doc.deleteSwagger',
    (args) => {
      swaggerDocTreeView.deleteSwaggerItem(args)
    }
  )

  // ============ tree view end ===============

  // 追踪当前webview面板
  let currentPanel: vscode.WebviewPanel | undefined = undefined
  console.log('Congratulations, your extension "swagger-panel" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  let disposable = vscode.commands.registerCommand(
    'swagger-panel.swaggerDoc',
    (args) => {
      if (currentPanel) {
        currentPanel.dispose()
      }
      // 创建并显示新的webview
      currentPanel = vscode.window.createWebviewPanel(
        'swaggerDoc', // 只供内部使用，这个webview的标识
        'Swagger Doc', // 给用户显示的面板标题
        vscode.ViewColumn.One, // 给新的webview面板一个编辑器视图
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(context.extensionPath)],
          retainContextWhenHidden: true,
        } // Webview选项
      )
      if (!currentPanel) {
        return
      }
      const htmlPath = path.join(context.extensionPath, 'web', 'index.html')
      let html = fs.readFileSync(htmlPath, 'utf-8')
      // 设置HTML内容
      currentPanel.webview.html = html
      timer = setTimeout(() => {
        currentPanel!.webview.postMessage({
          url: args,
        })
      }, 800)
    }
  )

  context.subscriptions.push(disposable)
  context.subscriptions.push(addSwaggerCommand)
  context.subscriptions.push(deleteSwaggerCommand)
}

// this method is called when your extension is deactivated
export function deactivate() {
  clearTimeout(timer)
}
