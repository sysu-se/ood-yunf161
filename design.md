# 设计文档
## A. 提示（Hint）

#### 1. 候选提示

提示用户当前棋盘，某个格子的候选数集合。

#### 2. 下一步提示

提示用户当前棋盘，下一步可以填写的候选数（推定数）。

### 要求

1. 提示功能必须通过你的领域对象接口提供，而不是仅在 UI 组件中临时拼接。
2. 需要说明：
   - 提示能力属于 `Sudoku`
   - 还是属于 `Game`
   - 或者两者如何协作

说明：候选数提示属于sudoku对象，因为候选数提示是基于当前棋盘状态的，而不是基于用户操作的。
    下一步提示属于game对象，因为它更像面向用户会话的“推荐下一步操作”

支持：
下一步提示支持提示只有一个候选值的格子，也支持在行列格子情况进行综合后，排除多个候选数中不合理的候选值，最后提示一个只有一个候选值的格子。
候选数支持提示当前棋盘，某个格子的候选数集合。
与之前的hint兼容，之前的hint功能是采用的直接写答案的模式，而当前的hint功能是采用的提示候选数的模式，会在侧面弹出对话框，提示候选数集合。



## B. 探索（Explore）

当前棋盘所有单元格若都无法推断出推定値（唯一的候选值），则用户可以采取探索模式，在多个候选值中逐一尝试。

----

### 要求

1. 冲突：能够判断探索失败，即棋盘出现了冲突
2. 回溯：用户能够在多次填写后，快速回到探索的起点，选择另外的候选值，进行探索
3. 记忆：用户多路径探索到已经失败的探索路径的某一棋盘时，告知用户探索失败

说明：
1.探索模式采用将当前游戏信息序列化保存（局面快照），然后在原基础上进行探索，结束探索后可以选择 1.载入探索前的游戏信息，放弃探索结果2.清空保存的游戏信息，接受探索结果。
2.探索模式下，用户可以在任意时间选择放弃探索，也可以在探索过程中选择接受探索结果。如果用户选择接受探索结果，那么当前游戏信息会被保存，用户可以在任意时间选择载入。如果用户选择放弃探索，那么当前游戏信息会被清空，用户可以在任意时间选择载入。如果用户选择接受探索结果，那么当前游戏信息会被保存，用户可以在任意时间选择载入。
3.处理冲突：game类有留下判断失败的方法，由ui层实时监听，完整链路是：
Game.is_failed() （有候选数为0的空格子就会失败）
→ src/domain/index.js 的 isGameFailed(game)
→ src/domain/index.js 的 projectGame(game)
→ src/node_modules/@sudoku/gamestore.js 的 gameView
→ src/App.svelte 的响应式监听
→ 弹出失败提示并执行回退
然后会把这个盘面加入黑名单（game类的failedGames属性），后续再遇到这个盘面，就会直接返回失败提示，而不是继续探索。
4.回溯：回溯时，只需载入保存的局面快照即可。也可以在探索中无限制进行undo/redo操作
5.记忆：game类有一个黑名单属性failedGames，用于记录已经失败的探索路径的棋盘状态（序列化后的盘面）。如果用户在探索过程中，遇到了已经失败的探索路径的棋盘状态，那么就会直接返回失败提示，而不是继续探索。

## 五、设计要求

本次作业要求你显式思考以下问题，并在文档中说明：

### 1. 探索模式的本质是什么？

你可以选择以下任一思路：

- `Game` 进入一种新的状态
- `Game` 创建一个临时子会话
- 使用局面快照与回滚机制
- 其他合理方案

说明：探索模式的本质是保存局面快照（字符串化的json），开启探索模式的完整调用链是：
Actions.svelte
→ gamestore.js 的 beginExploration
→ gamestore.js 的 mutateGame
→ domain/index.js 的 beginExplorationGame
→ Game_pack.js 的 begin_exploration
→ gameView 重新投影
→ UI 显示为探索模式
用户可以进行多次尝试，直到找到一个可行的解或者放弃探索。结束探索模式现在有两条路径：手动结束，和自动因失败而结束。
1.手动结束探索
手动结束的入口在 src/components/Controls/ActionBar/Actions.svelte。
当用户已经处于探索模式时，再点一次探索按钮，不会立刻退出，而是先：
调用 pauseGame()
打开 exploreDecision 弹窗
让用户在“继续探索 / 放弃本次探索 / 接受当前结果”之间选择
这个弹窗本身在 src/components/Modal/Types/ExploreDecision.svelte。
然后分成两种结果：
接受当前结果
调用链是：
src/components/Controls/ActionBar/Actions.svelte
src/node_modules/@sudoku/gamestore.js
src/domain/index.js
src/node_modules/@sudoku/Game_pack.js
在 Game.accept_exploration() 里做的事情很简单：
如果当前不在探索模式，返回 false
否则把 #is_exploring 设为 false
把 #base_state_json 清空
当前盘面保持不变
也就是说，接受的含义不是“提交一段新历史”，而是“确认这次试探结果成立，退出探索态”。
放弃本次探索
调用链是：
src/components/Controls/ActionBar/Actions.svelte
src/node_modules/@sudoku/gamestore.js
src/domain/index.js
src/node_modules/@sudoku/Game_pack.js
在 Game.reject_exploration() 里，逻辑是：
如果当前不在探索模式，返回 false
先计算当前分支是否失败：flag = this.is_failed()
保存当前盘面快照 temp_failed_cases
用 this.fromJSON(this.#base_state_json) 回滚到探索起点
清空 #base_state_json
如果刚才那个分支确实失败，而且还不在黑名单里，就加入 #failed_cases
把 #is_exploring 设为 false
2.自动结束探索
自动结束的监听点在 src/App.svelte。
这里会持续观察：
$gameView.isExploring
$gameView.isFailed
只要满足“当前还在探索模式，并且当前盘面已经失败”，就会：
pauseGame()
弹出一个 confirm 提示框
用户确认后直接调用 gameStore.rejectExploration()
所以自动结束探索本质上走的是“放弃本次探索”这条链，只是触发方式不是按钮，而是失败检测。
拒绝恢复盘面都是最终调用fromJson（）反序列化恢复，不会有拷贝问题

### 2. 主局面与探索局面的关系是什么？

你需要说明：

- 是共享对象，还是复制对象？
- 是否会产生深拷贝问题？
- 提交时如何合并？
- 放弃时如何回滚？
说明：可以基本认为就是共享对象，克隆是为了稳定刷新响应式链路。不会产生深拷贝问题，上面说明探索本质的时候有说，拒绝恢复盘面都是最终调用fromJson（）反序列化恢复，不会有拷贝问题，接受探索结果就直接清空记录盘面应用当前盘面，也不会有拷贝问题；合并就是直接应用当前盘面，放弃就是反序列化导入


### 3. history 如何演进？

你需要说明：

- 探索过程是否拥有独立 history
- 提交后如何进入主 history
- 是否仍然使用线性栈
- 是否引入了树状分支

说明：没有独立的history，探索过程是直接在主history上进行的。
提交后直接放弃原先保存的结果，直接应用这个盘面，自身变成主history。
是否仍然使用线性栈：是。本身的undo/redo操作和history栈是线性的。
是否引入了树状分支：否。
