# Aux translation glossary (strings-a1)

Launch locales: `es`, `fr`, `de`, `pt-BR`, `it`, `ja`, `ko`, `zh-CN`, `zh-TW` (decision 9). Every Aux translation (native `.xtb` entries, the reworded Chromium/Chrome strings, the extension catalog) uses these terms. When a term is not listed, use the word Chromium already uses for the same concept in that locale's `.xtb` (for example `chrome/app/resources/generated_resources_<locale>.xtb`).

## Rules

- **Never translate:** Aux, Aux Daemon, Peek (feature name), Chromium, Finder, macOS, URL, ID, keyboard symbols (⌘, ⌥, ⇧, ↩). "Chrome Web Store" keeps Chromium's localized form (ja "Chrome ウェブストア", zh-CN "Chrome 应用商店"). "emoji" may use the locale's common word (ja 絵文字, ko 이모티콘).
- **Placeholders** (`<ph name="…"/>` in `.xtb`, `$1` in Chromium text, `{name}` in the extension catalog) stay exactly as in English, in whatever position the language needs.
- **Tone:** match Chromium's own tone in each locale. Short labels, no exclamation marks except where English has one.
  - `es`, `pt-BR`, `it`: sentence case; informal address in `es` (tú) and `pt-BR` (você), as Chromium does; `it` uses the informal *tu*-style imperative used by Chromium ("Riprova").
  - `fr`: *vous*; sentence case; a no-break space (U+00A0) before `? ! : ;` and inside « ».
  - `de`: *du*, as Chromium de does (871 "du" vs 18 "Sie" in `generated_resources_de.xtb`); nouns capitalized; compound nouns joined ("Aux-Einstellungen").
  - `ja`: labels in plain noun/verb form ("タブを閉じる"); sentences in です/ます.
  - `ko`: labels as nouns/verbs ("탭 닫기"); sentences in 합니다/하세요 style.
  - `zh-CN`, `zh-TW`: no spaces between CJK characters; one space between CJK text and Latin words or numbers ("在 Aux 中打开"), as Chromium does.
- **Ellipsis:** keep a trailing "…" where English has one (it signals a dialog follows).
- **Menu labels:** `es`, `fr`, `pt-BR`, `it` use sentence case even when English uses Title Case ("Show All Downloads" → "Mostrar todas las descargas").

## Terms

| English | es | fr | de | pt-BR | it | ja | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|---|---|---|---|
| Aux | Aux | Aux | Aux | Aux | Aux | Aux | Aux | Aux | Aux |
| Space (Arc-style tab workspace) | Espacio | Espace | Bereich | Espaço | Spazio | スペース | 스페이스 | 空间 | 空間 |
| Spaces | Espacios | Espaces | Bereiche | Espaços | Spazi | スペース | 스페이스 | 空间 | 空間 |
| Peek (floating link preview) | Peek | Peek | Peek | Peek | Peek | Peek | Peek | Peek | Peek |
| Quick Window (Little Arc-style window) | Ventana rápida | Fenêtre rapide | Schnellfenster | Janela rápida | Finestra rapida | クイック ウィンドウ | 빠른 창 | 快速窗口 | 快速視窗 |
| Little Arc-style bar (the Quick Window's toolbar) | barra de la ventana rápida | barre de la fenêtre rapide | Schnellfenster-Leiste | barra da janela rápida | barra della finestra rapida | クイック ウィンドウのバー | 빠른 창 막대 | 快速窗口栏 | 快速視窗列 |
| Pins (section of tabs pinned to all Spaces) | Fijados | Épinglés | Angeheftet | Fixados | Fissati | 固定済み | 고정됨 | 已固定 | 已固定 |
| Pin / Unpin (verb) | Fijar / No fijar | Épingler / Retirer l'épingle | Anheften / Loslösen | Fixar / Desafixar | Fissa / Sblocca | 固定 / 固定を解除 | 고정 / 고정 해제 | 固定 / 取消固定 | 固定 / 取消固定 |
| Tidy (AI tab organization) | Ordenar | Ranger | Aufräumen | Organizar | Riordina | 整理 | 정리 | 整理 | 整理 |
| Ask Aux | Preguntar a Aux | Demander à Aux | Aux fragen | Perguntar ao Aux | Chiedi ad Aux | Aux に質問 | Aux에게 묻기 | 询问 Aux | 詢問 Aux |
| Chat (noun) | chat | discussion | Chat | conversa | chat | チャット | 채팅 | 对话 | 對話 |
| Chats | Chats | Discussions | Chats | Conversas | Chat | チャット | 채팅 | 对话 | 對話 |
| New Chat | Nuevo chat | Nouvelle discussion | Neuer Chat | Nova conversa | Nuova chat | 新しいチャット | 새 채팅 | 新对话 | 新對話 |
| Agent (AI agent) | agente | agent | Agent | agente | agente | エージェント | 에이전트 | 智能体 | 代理程式 |
| Agent tabs | Pestañas del agente | Onglets de l'agent | Agent-Tabs | Guias do agente | Schede dell'agente | エージェントのタブ | 에이전트 탭 | 智能体标签页 | 代理程式分頁 |
| Task | tarea | tâche | Aufgabe | tarefa | attività | タスク | 작업 | 任务 | 任務 |
| Approve / Deny | Aprobar / Denegar | Approuver / Refuser | Genehmigen / Ablehnen | Aprovar / Negar | Approva / Nega | 承認 / 拒否 | 승인 / 거부 | 批准 / 拒绝 | 核准 / 拒絕 |
| Routine | rutina | routine | Routine | rotina | routine | ルーティン | 루틴 | 例行任务 | 例行任務 |
| Skill | habilidad | compétence | Skill | habilidade | competenza | スキル | 스킬 | 技能 | 技能 |
| Library | Biblioteca | Bibliothèque | Bibliothek | Biblioteca | Libreria | ライブラリ | 라이브러리 | 资料库 | 資料庫 |
| Command bar ("Search commands, tabs…") | barra de comandos | barre de commandes | Befehlsleiste | barra de comandos | barra dei comandi | コマンドバー | 명령어 표시줄 | 命令栏 | 指令列 |
| Sidebar | barra lateral | barre latérale | Seitenleiste | barra lateral | barra laterale | サイドバー | 사이드바 | 侧边栏 | 側邊欄 |
| Tab | pestaña | onglet | Tab | guia | scheda | タブ | 탭 | 标签页 | 分頁 |
| Window | ventana | fenêtre | Fenster | janela | finestra | ウィンドウ | 창 | 窗口 | 視窗 |
| Incognito window | ventana de incógnito | fenêtre de navigation privée | Inkognitofenster | janela anônima | finestra di navigazione in incognito | シークレット ウィンドウ | 시크릿 창 | 无痕式窗口 | 無痕式視窗 |
| Split view | vista dividida | vue fractionnée | geteilte Ansicht | visualização dividida | visualizzazione divisa | 分割ビュー | 분할 보기 | 拆分视图 | 分割檢視畫面 |
| Bookmark | marcador | favori | Lesezeichen | favorito | preferito | ブックマーク | 북마크 | 书签 | 書籤 |
| Folder | carpeta | dossier | Ordner | pasta | cartella | フォルダ | 폴더 | 文件夹 | 資料夾 |
| Archive (verb) | Archivar | Archiver | Archivieren | Arquivar | Archivia | アーカイブ | 보관 | 归档 | 封存 |
| Profile | perfil | profil | Profil | perfil | profilo | プロフィール | 프로필 | 个人资料 | 設定檔 |
| Settings | Configuración | Paramètres | Einstellungen | Configurações | Impostazioni | 設定 | 설정 | 设置 | 設定 |
| Downloads | Descargas | Téléchargements | Downloads | Downloads | Download | ダウンロード | 다운로드 | 下载内容 | 下載項目 |
| History | Historial | Historique | Verlauf | Histórico | Cronologia | 履歴 | 방문 기록 | 历史记录 | 歷史記錄 |
| Extensions | Extensiones | Extensions | Erweiterungen | Extensões | Estensioni | 拡張機能 | 확장 프로그램 | 扩展程序 | 擴充功能 |
| Provider (AI model provider) | proveedor | fournisseur | Anbieter | provedor | provider | プロバイダ | 제공업체 | 提供商 | 供應商 |
| API key | clave de API | clé API | API-Schlüssel | chave de API | chiave API | API キー | API 키 | API 密钥 | API 金鑰 |
| Sign in / Sign out | Iniciar sesión / Cerrar sesión | Se connecter / Se déconnecter | Anmelden / Abmelden | Fazer login / Sair | Accedi / Esci | ログイン / ログアウト | 로그인 / 로그아웃 | 登录 / 退出 | 登入 / 登出 |

## Chromium strings reworded from "Chrome"/"Chromium" to "Aux"

Upstream translations already exist for these. Where the rewording only swaps the product name, the translation is the upstream translation with the same swap (`Chrome`/`Chromium`/`Google Chrome` → `Aux`). Inflected or transliterated forms (for example ja `Chromium` is kept in Latin script; no transliteration exists in these locales) are checked by `build_strings.py`, which refuses a mechanical swap if the product-name count in the translation differs from the English source.

## Terms decided during translation (strings-a1)

| English | es | fr | de | pt-BR | it | ja | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|---|---|---|---|
| pane (split view) | panel | vue | Ansicht | painel | riquadro | ペイン | 분할 영역 | 窗格 | 窗格 |
| Focus (one split pane) | — | — | — | — | — | — | — | 聚焦 | 聚焦 |
| unload (a tab) | liberar de la memoria | décharger | entladen | liberar da memória | scarica dalla memoria | アンロード | 로드 해제 | 卸载 | 卸載 |
| session ID | ID de sesión | ID de session | Sitzungs-ID | ID da sessão | ID sessione | セッション ID | 세션 ID | 会话 ID | 工作階段 ID |
| workspace (a profile's saved windows) | espacio de trabajo | espace de travail | Arbeitsumgebung | espaço de trabalho | area di lavoro | ワークスペース | 작업 공간 | 工作区 | 工作區 |
| quotation marks | “ ” | « » | „ “ | “ ” | “ ” | 「 」 | ‘ ’ | “ ” | 「 」 |

Cells marked — follow Chromium's existing wording in that locale.
