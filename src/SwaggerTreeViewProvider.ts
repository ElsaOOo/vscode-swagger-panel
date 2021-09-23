import * as vscode from 'vscode'
class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    tooltip?: string,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState)
    this.tooltip = tooltip
  }

  contextValue = 'swaggerItem'
}

export class SwaggerTreeViewProvider
  implements vscode.TreeDataProvider<TreeItem>
{
  sources: { label: string; value: string }[] = []
  context: vscode.ExtensionContext
  constructor(context: vscode.ExtensionContext) {
    this.context = context
    const thisExtensionConfigs = context.globalState.get('swaggerDoc.data') as {
      label: string
      value: string
    }[]
    console.log('thisExtensionConfigs===', thisExtensionConfigs)

    if (thisExtensionConfigs && thisExtensionConfigs.length > 0) {
      this.sources = thisExtensionConfigs
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>()

  readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element
  }

  getChildren(): Thenable<any[]> {
    const children: TreeItem[] = []
    this.sources.forEach((item) => {
      const treeItem = new TreeItem(
        item.label,
        vscode.TreeItemCollapsibleState.None,
        item.value,
        {
          command: 'swagger-panel.swaggerDoc',
          title: item.label,
          arguments: [item.value],
        }
      )
      children.push(treeItem)
    })

    return Promise.resolve(children)
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  addNewSwaggerConfig(item: { label: string; value: string }) {
    // 重名校验
    if (this.sources.every((sourceItem) => sourceItem.label !== item.label)) {
      this.sources.push(item)
      this.context.globalState.update('swaggerDoc.data', this.sources)
      this.refresh()
      vscode.window.showInformationMessage('config swagger doc successfully!')
    } else {
      vscode.window.showErrorMessage('swagger name can not be repeated!', {
        modal: true,
      })
    }
  }

  deleteSwaggerItem(value: TreeItem) {
    this.sources = this.sources.filter((item) => item.label !== value.label)
    this.context.globalState.update('swaggerDoc.data', this.sources)
    this.refresh()
  }
}
