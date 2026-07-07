# File Management
## File uploads
Handle file inputs and uploads through the file chooser flow.

Use this pattern:

```js
const chooserPromise = tab.playwright.waitForEvent("filechooser", { timeoutMs: 10000 });
await tab.playwright.locator('input[type="file"]').click();
const chooser = await chooserPromise;
await chooser.setFiles(["/absolute/path/to/file.txt"]);
```

Notes:

* Start `waitForEvent("filechooser")` before clicking the file input or its associated upload control.
* Prefer the actual `input[type="file"]` when it is available; if the UI uses a visible button or label, click that only when it is the control that opens the chooser.
* Use absolute local paths for `setFiles(...)`.
* Use `chooser.isMultiple()` before passing multiple files when needed.
* Do not look for `locator.setInputFiles(...)` in this wrapper; uploads are exposed via the chooser object instead.

If the task involves attaching a local file, check for a file input and try the `filechooser` flow before falling back to a native picker.

## Upload errors
Keep the first response short and non-technical unless the user asks for more information.

If file upload fails when using `playwright_file_chooser_set_files`, `set_files` or similar tell the user exactly this:

`To enable file upload, go to chrome://extensions in Chrome, click Details under the Codex extension, and enable "Allow access to file URLs." See [here](https://developers.openai.com/codex/app/chrome-extension#upload-files) for details.`
