import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { colors, typography } from '../theme/tokens';

/** The formatting actions the toolbar can apply. */
export type EditorCommand =
  | { type: 'foreColor'; color: string }
  | { type: 'bold' }
  | { type: 'italic' }
  | { type: 'underline' }
  | { type: 'insertUnorderedList' }
  | { type: 'insertOrderedList' }
  | { type: 'insertHorizontalRule' };

/** Which formats are active at the cursor, so the toolbar can light up. */
export type ActiveFormats = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  unorderedList: boolean;
  orderedList: boolean;
};

export type RichTextEditorHandle = {
  apply: (command: EditorCommand) => void;
  focus: () => void;
};

type Props = {
  /** Initial HTML. Only read on mount — the WebView owns the document after that. */
  initialHtml: string;
  /** Fires on every edit with the document's HTML and its plain-text equivalent. */
  onChange: (payload: { html: string; text: string }) => void;
  onActiveFormatsChange?: (formats: ActiveFormats) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  editable?: boolean;
};

/**
 * A rich text field, because React Native's `TextInput` cannot render mixed
 * inline formatting while editing — a single input can be bold, but it can't
 * show one word bold and the next in another colour, which is exactly what
 * Figma's Add-Image-Texting-4 (node 3184:6675) shows. So the field is a
 * `contenteditable` document inside a WebView, styled to match `typography.body`
 * so it is indistinguishable from the plain input it replaces.
 *
 * The seven toolbar actions map one-to-one onto `document.execCommand`, which
 * is what every React Native rich-text library wraps anyway; going direct
 * keeps the dependency list at `react-native-webview` (bundled with Expo Go
 * SDK 57) and keeps the document's styling ours.
 *
 * The same component renders a saved post read-only — pass `editable={false}`.
 */
const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(function RichTextEditor(
  { initialHtml, onChange, onActiveFormatsChange, onFocus, onBlur, placeholder = '', editable = true },
  ref,
) {
  const webRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    apply(command) {
      webRef.current?.injectJavaScript(`window.__apply(${JSON.stringify(command)}); true;`);
    },
    focus() {
      webRef.current?.injectJavaScript('window.__focus(); true;');
    },
  }));

  // Built once: re-rendering the document would move the caret and drop undo
  // history on every keystroke.
  const html = useMemo(
    () => buildDocument({ initialHtml, placeholder, editable }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    let message: any;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (message.type === 'change') onChange({ html: message.html, text: message.text });
    else if (message.type === 'formats') onActiveFormatsChange?.(message.formats);
    else if (message.type === 'focus') onFocus?.();
    else if (message.type === 'blur') onBlur?.();
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        style={styles.web}
        // The document scrolls internally; letting the WebView bounce as well
        // makes the field feel detached from the screen around it.
        scrollEnabled={editable}
        bounces={false}
        overScrollMode="never"
        hideKeyboardAccessoryView
        keyboardDisplayRequiresUserAction={false}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

export default RichTextEditor;

function buildDocument({
  initialHtml,
  placeholder,
  editable,
}: {
  initialHtml: string;
  placeholder: string;
  editable: boolean;
}): string {
  const body = initialHtml || '';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  html, body { margin: 0; padding: 0; height: 100%; background: transparent; }
  #editor {
    min-height: 100%;
    padding: 0;
    outline: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: ${typography.body.fontSize}px;
    line-height: ${typography.body.lineHeight / typography.body.fontSize};
    letter-spacing: ${typography.body.letterSpacing}px;
    color: ${colors.textPrimary};
    -webkit-user-select: text;
    word-wrap: break-word;
  }
  #editor:empty:before {
    content: attr(data-placeholder);
    color: ${colors.textPlaceholder};
    pointer-events: none;
    display: block;
  }
  #editor ul, #editor ol { padding-left: 22px; margin: 0; }
  #editor hr { border: none; border-top: 1px solid ${colors.borderSubtle}; margin: 12px 0; }
</style>
</head>
<body>
<div id="editor" ${editable ? 'contenteditable="true"' : ''} data-placeholder="${escapeAttribute(placeholder)}">${body}</div>
<script>
  (function () {
    var editor = document.getElementById('editor');
    var post = function (payload) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    };

    var emitChange = function () {
      post({ type: 'change', html: editor.innerHTML, text: editor.innerText });
    };
    var emitFormats = function () {
      post({
        type: 'formats',
        formats: {
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          unorderedList: document.queryCommandState('insertUnorderedList'),
          orderedList: document.queryCommandState('insertOrderedList')
        }
      });
    };

    editor.addEventListener('input', function () { emitChange(); emitFormats(); });
    editor.addEventListener('focus', function () { post({ type: 'focus' }); emitFormats(); });
    editor.addEventListener('blur', function () { post({ type: 'blur' }); });
    document.addEventListener('selectionchange', function () {
      if (document.activeElement === editor) emitFormats();
    });

    window.__apply = function (command) {
      editor.focus();
      if (command.type === 'foreColor') document.execCommand('foreColor', false, command.color);
      else document.execCommand(command.type, false, null);
      emitChange();
      emitFormats();
    };
    window.__focus = function () { editor.focus(); };
  })();
</script>
</body>
</html>`;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  web: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
