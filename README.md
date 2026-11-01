# 白抜き検量線メーカー

化学実験レポート向けの、白背景・白抜き標準点・黒い回帰直線の検量線作成ツールです。ライブラリ、CDN、ビルド工程、通信は不要です。`index.html` をブラウザで開けば使用できます。相対パスのみで構成され、GitHub Pages のルートにもそのまま配置できます。

## 使い方（6 手順）

1. `index.html` を開き、初期サンプルまたは自分の標準試料の濃度 X・吸光度 Y を表に入力します。
2. 未知試料の名前と吸光度を入力します。各行または全体のチェックでグラフへの表示を切り替えます。
3. 通常回帰または原点回帰を選び、係数・R²・濃度の表示桁数を設定します。
4. 軸ラベル、軸範囲、目盛り、点・線・文字の体裁を調整します。回帰式はドラッグ移動でき、位置を相対座標で保持します。
5. 結果欄で回帰式、R²、有効点数、未知濃度と警告を確認します。外挿値は標準範囲を超える推定です。
6. グラフ寸法、PNG の解像度・仕上がり幅を指定して PNG／SVG を保存します。濃度一覧は CSV でも保存できます。

入力と設定はブラウザの localStorage に自動保存されます。「設定を初期化」でデータも初期サンプルに戻ります。ブラウザ側で保存が禁止されている場合も編集できますが再訪時の復元はできません。`file:` での保存領域の扱いはブラウザに依存します。

## 入力方法

- 表の「行を追加」「削除」で編集します。負の値も有効です。空欄や非数値の標準行は除外し、赤枠と行番号付き警告で示します。
- Excel の2列・複数行を標準表のセルに貼り付けると、そのセルから行を増やして埋めます。Y 列からの貼り付けでは Y 列に入力します。
- 「Excel から一括貼り付け」はタブ・カンマ・セミコロン・空白区切りに対応します。置換／追記を選んで反映します。先頭の非数値行はヘッダーとして除外し、軸ラベル候補を表示します。ラベルは自動変更しません。3列以上は先頭2列を使用します。
- 全角数字・全角記号・Unicode のマイナスを正規化します。小数点カンマはタブまたはセミコロン区切りでのみ使用できます。
- CSV／TXT／TSV ファイルは UTF-8（BOM の有無を問わず）で読み、置換文字があれば Shift_JIS で読み直します。日本語のヘッダーも使用できます。
- 未知試料の一括入力は1列なら吸光度、2列なら名前と吸光度です。表の表示設定と無関係に、未知試料は回帰計算には含まれません。

## グラフと保存

初期状態は左・下軸のみ、内向き目盛り、グリッドなし、標準点は白抜き円です。未知試料は黒点と水平・垂直の点線で表示します。四方枠、副目盛り、6種類の未知マーカー、点線パターン、フォント、縦書き軸ラベル、余白等を調整できます。軸の手動設定が不正な場合は直前の有効な範囲を維持します。

- **PNG**：96／300／600 dpi。仕上がり幅が指定されていれば `幅 cm ÷ 2.54 × dpi` でピクセル幅を算出します。幅を空欄にするとグラフの幅 px × dpi/96 になります。白背景で描画し、IHDR 直後の pHYs チャンクに解像度（pixels/m）を埋め込みます。幅・高さ16384 pxまたは面積2.5億 pxを超える指定は縮小して警告します。縮小時の物理寸法は元の指定幅より小さくなります。
- **SVG**：同一の SVG 描画関数からベクター画像として保存します。日本語はシステムフォントを使用し、テキストを保持します。ドラッグ用属性は除外します。利用先のPCにも日本語フォントが必要です。
- **CSV**：Excel 向け UTF-8 BOM 付き。名前・吸光度・濃度・判定の後に、回帰式・R²・回帰方式の注記を付けます。

保存対象はグラフだけです。表示をオフにした要素は画像にも含みません。

## 回帰と R²

通常回帰は2パスで平均と偏差和を求め、`a = Sxy/Sxx`、`b = ȳ − ax̄` とします。R² は `1 − Σ(y−ŷ)²/Σ(y−ȳ)²` です。標準試料は2点以上必要です。2点だけの場合は R² = 1 の注意が出ます。すべての X が等しい場合（`Sxx ≤ 1e−14 Σx²` を含む）は回帰できません。

原点回帰は `a = Σxy/Σx²`、`b = 0`。R² は **非中心化定義 `1 − Σ(y−ŷ)²/Σy²`（Excel の切片0と同じ）** であり、通常回帰の R² と定義が異なります。1点でも回帰できますが、Σx² = 0 なら回帰できません。

R² の分母が0の場合は「—」を表示します。未知濃度は `(y−b)/a`。傾きがほぼ0（`|a| × (xmax−xmin) ≤ 1e−9 × max|y|` または `a = 0`）なら計算不可です。この定義では標準点が1点だけの原点回帰も濃度計算不可になります。標準 X または Y の範囲を超える未知試料は外挿と表示します。

仕様の初期サンプルの実際の通常回帰は `y = 0.5576x + 0.006370`、`R² = 0.9991`（表示4桁）、試料Aは約 `0.09923` です。参考画像の式は書式例であり、数値を固定表示していません。サンプルの自動軸は X = 0〜0.25（0.05刻み）、Y = 0〜0.14（0.02刻み）です。

## ファイル構成とテスト

`js/regression.js` は計算・整形・入力パース、`js/chart.js` は DOM 非依存の SVG 生成です。両方とも UMD でブラウザと Node から使えます。`js/app.js` はUIと永続化、`js/export.js` は画像・CSV保存を担当します。

Node.js と Python + NumPy が必要です。プロジェクトルートで実行します。

```text
node tests/run_js.js
python tests/verify_numpy.py
node tests/chart_smoke.js
```

`cases.json` の14ケースで通常回帰、原点回帰、負値、大きなオフセット、点数不足、X同一、Y一定、ほぼゼロの傾きと未知濃度を検証します。Node は期待値を検証したうえで結果を JSON 出力します。Python は Node の結果と NumPy の独立した最小二乗計算を相対誤差1e−10（ゼロ近傍の絶対誤差1e−12）で比較します。SVG テストでは要素数、XML の簡易整合性、エスケープ、各表示オプションに加え、PNG の pHYs 配置・値・CRC32、CSV の BOM、出力寸法を検証します。テスト不合格は終了コード1になります。サイト自体には Python も Node も必要ありません。

## ライセンス

MIT License

Copyright (c) 2026 白抜き検量線メーカー contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
